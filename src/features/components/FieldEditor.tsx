import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { z } from 'zod';

// Field type definition
export const fieldSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  label: z.string().min(1, 'Label is required'),
  type: z.enum(['text', 'number', 'date', 'select']),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
});

export type Field = z.infer<typeof fieldSchema>;

// Type for field array errors
type FieldArrayErrors = {
  [key: number]: {
    key?: { message?: string };
    label?: { message?: string };
    type?: { message?: string };
    options?: { message?: string };
  };
};

interface FieldEditorProps {
  name: string;
}

export default function FieldEditor({ name }: FieldEditorProps) {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const addField = () => {
    append({
      key: '',
      label: '',
      type: 'text' as const,
      required: false,
      options: [],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Fields</h3>
        <button
          type="button"
          onClick={addField}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Field
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 text-foreground-secondary">
          <p>No fields defined. Click "Add Field" to get started.</p>
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="border border-border rounded-lg p-4 bg-background"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className="p-1 hover:bg-muted rounded cursor-grab"
                  onMouseDown={e => {
                    e.preventDefault();
                    // Handle drag start
                  }}
                >
                  <GripVertical className="w-4 h-4 text-foreground-secondary" />
                </button>
                <span className="text-sm font-medium text-foreground-secondary">
                  Field {index + 1}
                </span>
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-1 text-error hover:bg-error/10 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Key */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Key *
                </label>
                <input
                  {...register(`${name}.${index}.key`)}
                  type="text"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="field_key"
                />
                {(errors[name] as FieldArrayErrors)?.[index]?.key && (
                  <p className="mt-1 text-sm text-error">
                    {(errors[name] as FieldArrayErrors)?.[index]?.key?.message}
                  </p>
                )}
              </div>

              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Label *
                </label>
                <input
                  {...register(`${name}.${index}.label`)}
                  type="text"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Field Label"
                />
                {(errors[name] as FieldArrayErrors)?.[index]?.label && (
                  <p className="mt-1 text-sm text-error">
                    {
                      (errors[name] as FieldArrayErrors)?.[index]?.label
                        ?.message
                    }
                  </p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Type *
                </label>
                <select
                  {...register(`${name}.${index}.type`)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Select</option>
                </select>
                {(errors[name] as FieldArrayErrors)?.[index]?.type && (
                  <p className="mt-1 text-sm text-error">
                    {(errors[name] as FieldArrayErrors)?.[index]?.type?.message}
                  </p>
                )}
              </div>

              {/* Required */}
              <div className="flex items-center space-x-2">
                <input
                  {...register(`${name}.${index}.required`)}
                  type="checkbox"
                  id={`${name}.${index}.required`}
                  className="w-4 h-4 text-accent bg-background border-border rounded focus:ring-accent focus:ring-2"
                />
                <label
                  htmlFor={`${name}.${index}.required`}
                  className="text-sm font-medium text-foreground"
                >
                  Required
                </label>
              </div>
            </div>

            {/* Options for select type */}
            {watch(`${name}.${index}.type`) === 'select' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Options (one per line)
                </label>
                <textarea
                  {...register(`${name}.${index}.options`)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  onChange={e => {
                    const options = e.target.value
                      .split('\n')
                      .map(line => line.trim())
                      .filter(line => line.length > 0);
                    setValue(`${name}.${index}.options`, options);
                  }}
                />
                {(errors[name] as FieldArrayErrors)?.[index]?.options && (
                  <p className="mt-1 text-sm text-error">
                    {
                      (errors[name] as FieldArrayErrors)?.[index]?.options
                        ?.message
                    }
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
