import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { client, authHeader } from '../../lib/api/client';
import type { components } from '../../lib/api/types';
import NewProjectModal from './NewProjectModal';

type Project = components['schemas']['Project'];

async function listProjects(): Promise<Project[]> {
  // For development: return mock data if no backend is available
  const isDevelopment = import.meta.env.DEV;
  
  if (isDevelopment) {
    // Check if we can reach the API
    try {
      const res = await client.GET('/projects', { headers: authHeader() });
      if (res.error) {
        console.warn('API not available, using mock data:', res.error);
        return getMockProjects();
      }
      return res.data?.projects ?? [];
    } catch (error) {
      console.warn('API not available, using mock data:', error);
      return getMockProjects();
    }
  }
  
  const res = await client.GET('/projects', { headers: authHeader() });
  if (res.error) throw res.error;
  return res.data?.projects ?? [];
}

function getMockProjects(): Project[] {
  return [
    {
      id: 'proj-1',
      name: 'Sample Project',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'proj-2', 
      name: 'Another Project',
      status: 'inactive',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

export default function ProjectsPage() {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: listProjects,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-8">
      <div className="text-foreground-secondary">Loading projects...</div>
    </div>
  );
  
  if (error) {
    return (
      <div className="text-error space-y-2">
        <div className="font-medium">Failed to load projects</div>
        <div className="text-sm text-foreground-secondary">
          {import.meta.env.DEV 
            ? "Development mode: Check console for details. Using mock data if available."
            : "Please check your connection and try again."
          }
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Projects</h2>
        <button
          onClick={() => setIsNewProjectModalOpen(true)}
          className="btn-primary"
        >
          New Project
        </button>
      </div>

      <div className="card">
        <table className="w-full text-sm">
          <thead className="bg-background-secondary text-left">
            <tr>
              <th className="p-4 font-medium text-foreground">ID</th>
              <th className="p-4 font-medium text-foreground">Name</th>
              <th className="p-4 font-medium text-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map(p => (
              <tr key={p.id} className="border-t border-border hover:bg-background-secondary/50 transition-colors">
                <td className="p-4 font-mono text-xs text-foreground-secondary">{p.id}</td>
                <td className="p-4 font-medium text-foreground">{p.name}</td>
                <td className="p-4">
                  <span
                    className={
                      p.status === 'active'
                        ? 'status-active'
                        : p.status === 'inactive'
                          ? 'status-inactive'
                          : 'status-error'
                    }
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />
    </>
  );
}
