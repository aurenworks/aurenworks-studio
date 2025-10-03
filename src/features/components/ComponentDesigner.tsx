import React, { useState, useEffect, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client, authHeader } from '../../lib/api/client';
import type { components } from '../../lib/api/types';
import { YamlEditor } from '../../components/YamlEditor';
import { ToastContainer } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import FieldEditor, { type Field } from './FieldEditor';
import * as yaml from 'js-yaml';

type Component = components['schemas']['Component'];

// Extended component type with fields for local use
type ComponentWithFields = Component & {
  fields?: Field[];
};

// Field schema definition
const fieldSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  label: z.string().min(1, 'Label is required'),
  type: z.enum(['text', 'number', 'date', 'select']),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
});

// Zod schema for form validation
const componentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum([
    'service',
    'database',
    'queue',
    'cache',
    'storage',
    'api',
    'worker',
    'scheduler',
  ]),
  status: z.enum(['active', 'inactive', 'deploying', 'failed', 'pending']),
  config: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
  fields: z
    .array(fieldSchema)
    .optional()
    .refine(
      fields => {
        if (!fields) return true;
        const keys = fields.map(f => f.key);
        return keys.length === new Set(keys).size;
      },
      {
        message: 'Field keys must be unique',
      }
    ),
});

type FormData = z.infer<typeof componentSchema>;

interface ComponentDesignerProps {
  component?: ComponentWithFields;
  projectId: string;

  onSave?: (_component: Component) => void;
  onCancel?: () => void;
}

export default function ComponentDesigner({
  component: _component,
  projectId,
  onSave,
  onCancel,
}: ComponentDesignerProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'yaml'>('form');
  const [yamlValue, setYamlValue] = useState('');
  const [yamlError, setYamlError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(componentSchema),
    defaultValues: {
      name: _component?.name || '',
      description: _component?.description || '',
      type: _component?.type || 'api',
      status: _component?.status || 'active',
      config: _component?.config || {},
      metadata: _component?.metadata || {},
      fields: _component?.fields || [],
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = form;

  // Initialize YAML from component data
  useEffect(() => {
    if (_component) {
      const yamlData = {
        name: _component.name,
        description: _component.description,
        type: _component.type,
        status: _component.status,
        config: _component.config,
        metadata: _component.metadata,
        fields: _component.fields || [],
      };
      setYamlValue(yaml.dump(yamlData, { indent: 2 }));
    } else {
      // Minimal prefilled ComponentModel for new components
      const defaultYaml = `name: ""
description: ""
type: api
status: active
config: {}
metadata: {}
fields: []`;
      setYamlValue(defaultYaml);
    }
  }, [_component]);

  // Create component mutation
  const createComponentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await client.POST('/projects/{projectId}/components', {
        params: { path: { projectId } },
        headers: authHeader(),
        body: data,
      });
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['components', projectId] });
      showSuccess('Component created successfully!');
      onSave?.(data);
    },
    onError: () => {
      showError('Failed to create component. Please try again.');
    },
  });

  // Update component mutation
  const updateComponentMutation = useMutation({
    mutationFn: async (_data: FormData) => {
      if (!_component?.id)
        throw new Error('Component ID is required for update');

      // TODO: Replace with actual API endpoint when available
      // This should be: client.PUT('/projects/{projectId}/components/{componentId}', ...)
      return Promise.reject(new Error('Component update not yet implemented in API'));
    },
    onSuccess: _data => {
      queryClient.invalidateQueries({ queryKey: ['components', projectId] });
      queryClient.invalidateQueries({
        queryKey: ['component', _component?.id],
      });
      showSuccess('Component updated successfully!');
      onSave?.(_data);
    },
    onError: () => {
      showError('Failed to update component. Please try again.');
    },
  });

  // Convert YAML to form data
  const yamlToFormData = useCallback((yamlText: string): FormData | null => {
    try {
      const parsed = yaml.load(yamlText) as Record<string, unknown>;
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid YAML structure');
      }

      // Validate the parsed data against our schema
      const result = componentSchema.safeParse(parsed);
      if (!result.success) {
        throw new Error(
          `Validation error: ${result.error.errors.map(e => e.message).join(', ')}`
        );
      }

      return result.data;
    } catch (error) {
      setYamlError(error instanceof Error ? error.message : 'Invalid YAML');
      return null;
    }
  }, []);

  // Convert form data to YAML
  const formDataToYaml = useCallback(
    (data: FormData): string => {
      try {
        return yaml.dump(data, { indent: 2 });
      } catch {
        return yamlValue;
      }
    },
    [yamlValue]
  );

  // Handle YAML changes
  const handleYamlChange = useCallback(
    (newYaml: string) => {
      setYamlValue(newYaml);
      setYamlError(null);

      const formData = yamlToFormData(newYaml);
      if (formData) {
        // Update form fields
        Object.entries(formData).forEach(([key, value]) => {
          setValue(key as keyof FormData, value);
        });
      }
    },
    [yamlToFormData, setValue]
  );

  // Handle form changes
  const handleFormChange = useCallback(() => {
    const formData = watch();
    const newYaml = formDataToYaml(formData);
    setYamlValue(newYaml);
  }, [watch, formDataToYaml]);

  // Watch form changes to update YAML
  useEffect(() => {
    const subscription = watch(handleFormChange);
    return () => subscription.unsubscribe();
  }, [watch, handleFormChange]);

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      if (_component?.id) {
        // Update existing component
        await updateComponentMutation.mutateAsync(data);
      } else {
        // Create new component
        await createComponentMutation.mutateAsync(data);
      }
    } catch (error) {
      // Error is already handled by the mutation's onError callback
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle YAML tab submission
  const handleYamlSubmit = () => {
    const formData = yamlToFormData(yamlValue);
    if (formData) {
      onSubmit(formData);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <FormProvider {...form}>
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground">
              {_component?.id ? 'Edit Component' : 'Create Component'}
            </h2>
            <p className="text-sm text-foreground-secondary">
              {_component?.id
                ? 'Modify your component using the form or YAML editor'
                : 'Design your component using the form or YAML editor'}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-border mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'form'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-foreground-secondary hover:text-foreground'
              }`}
            >
              Form
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('yaml')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'yaml'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-foreground-secondary hover:text-foreground'
              }`}
            >
              YAML
            </button>
          </div>

          {/* Form Tab */}
          {activeTab === 'form' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Name *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    id="name"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Component name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-error">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Type *
                  </label>
                  <select
                    {...register('type')}
                    id="type"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="api">API</option>
                    <option value="service">Service</option>
                    <option value="database">Database</option>
                    <option value="queue">Queue</option>
                    <option value="cache">Cache</option>
                    <option value="storage">Storage</option>
                    <option value="worker">Worker</option>
                    <option value="scheduler">Scheduler</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-error">
                      {errors.type.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Description
                </label>
                <textarea
                  {...register('description')}
                  id="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Component description"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-error">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Status *
                </label>
                <select
                  {...register('status')}
                  id="status"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="deploying">Deploying</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-error">
                    {errors.status.message}
                  </p>
                )}
              </div>

              {/* Field Editor */}
              <div className="border-t border-border pt-6">
                <FieldEditor name="fields" />
                {errors.fields && (
                  <p className="mt-2 text-sm text-error">
                    {errors.fields.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  {isSubmitting
                    ? _component?.id
                      ? 'Updating...'
                      : 'Creating...'
                    : _component?.id
                      ? 'Update'
                      : 'Create'}
                </button>
              </div>
            </form>
          )}

          {/* YAML Tab */}
          {activeTab === 'yaml' && (
            <div className="space-y-4">
              {yamlError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{yamlError}</p>
                </div>
              )}

              <YamlEditor
                value={yamlValue}
                onChange={handleYamlChange}
                height="400px"
                className="border border-border rounded-md"
              />

              <div className="flex justify-end space-x-4">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleYamlSubmit}
                  disabled={isSubmitting || !!yamlError}
                  className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  {isSubmitting
                    ? _component?.id
                      ? 'Updating...'
                      : 'Creating...'
                    : _component?.id
                      ? 'Update'
                      : 'Create'}
                </button>
              </div>
            </div>
          )}
        </div>
      </FormProvider>
    </>
  );
}
