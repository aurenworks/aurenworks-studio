import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client, authHeader } from '../../lib/api/client';
import type { components } from '../../lib/api/types';

type CreateProjectRequest = components['schemas']['CreateProjectRequest'];
type Project = components['schemas']['Project'];

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: '',
    description: '',
    tags: [],
  });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
      setFormData({ name: '', description: '', tags: [] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      createMutation.mutate(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background-dark/50 flex items-center justify-center z-50">
      <div className="card p-6 w-full max-w-md shadow-auren-lg">
        <h2 className="text-xl font-semibold mb-4 text-foreground">
          Create New Project
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="input w-full"
              required
            />
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
              value={formData.description || ''}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input w-full"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !formData.name.trim()}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>

        {createMutation.error && (
          <div className="mt-4 text-error text-sm">
            Failed to create project: {createMutation.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
