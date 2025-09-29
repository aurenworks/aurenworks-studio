import { useState } from 'react';
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
  return res.data!;
}

export default function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Project Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !formData.name.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
        
        {createMutation.error && (
          <div className="mt-4 text-red-600 text-sm">
            Failed to create project: {createMutation.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
