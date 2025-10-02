import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { client, authHeader } from '../../lib/api/client';
import { useToast } from '../../hooks/useToast';
import type { components } from '../../lib/api/types';

type CreateProjectRequest = components['schemas']['CreateProjectRequest'];
type Project = components['schemas']['Project'];

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Form validation schema
const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  tags: z.array(z.string()).optional(),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

async function createProject(data: CreateProjectRequest): Promise<Project> {
  const res = await client.POST('/projects', {
    body: data,
    headers: authHeader(),
  });
  if (res.error) throw res.error;
  if (!res.data) throw new Error('No data returned from API');
  return res.data;
}

export default function NewProjectModal({
  isOpen,
  onClose,
}: NewProjectModalProps) {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      tags: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: newProject => {
      // Optimistically add the new project to the cache
      queryClient.setQueryData(
        ['projects'],
        (oldData: Project[] | undefined) => {
          if (!oldData) return [newProject];
          return [...oldData, newProject];
        }
      );

      showSuccess('Project created successfully!');
      reset();
      onClose();
    },
    onError: error => {
      showError(`Failed to create project: ${error.message}`);
    },
  });

  const onSubmit = (data: CreateProjectFormData) => {
    createMutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background-dark/50 flex items-center justify-center z-50">
      <div className="card p-6 w-full max-w-md shadow-auren-lg">
        <h2 className="text-xl font-semibold mb-4 text-foreground">
          Create New Project
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-1 text-foreground"
            >
              Project Name *
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Enter project name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1 text-foreground"
            >
              Description
            </label>
            <textarea
              id="description"
              {...register('description')}
              className={`input w-full ${errors.description ? 'border-red-500' : ''}`}
              rows={3}
              placeholder="Optional project description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn-outline flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
