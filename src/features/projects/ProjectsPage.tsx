import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { client, authHeader } from '../../lib/api/client';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';
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
        // API not available, using mock data
        return getMockProjects();
      }
      return res.data?.projects ?? [];
    } catch {
      // API not available, using mock data
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'proj-2',
      name: 'Another Project',
      status: 'inactive',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export default function ProjectsPage() {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toasts, removeToast } = useToast();
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: listProjects,
  });

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}/components`);
  };

  if (isLoading)
    return (
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
            ? 'Development mode: Check console for details. Using mock data if available.'
            : 'Please check your connection and try again.'}
        </div>
      </div>
    );
  }

  const projects = data ?? [];

  if (projects.length === 0) {
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

        <div className="text-center py-12">
          <div className="text-foreground-secondary mb-4">
            <svg
              className="mx-auto h-12 w-12 text-foreground-secondary/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No projects yet
          </h3>
          <p className="text-foreground-secondary mb-6">
            Get started by creating your first project.
          </p>
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="btn-primary"
          >
            Create Project
          </button>
        </div>

        <NewProjectModal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
        />

        <ToastContainer toasts={toasts} onClose={removeToast} />
      </>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div
            key={project.id}
            onClick={() => handleProjectClick(project.id)}
            className="card cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                  {project.name}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    project.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : project.status === 'inactive'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {project.status}
                </span>
              </div>

              {project.description && (
                <p className="text-sm text-foreground-secondary mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-foreground-secondary">
                <span className="font-mono">{project.id}</span>
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>

              {project.tags && project.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-background-secondary text-foreground-secondary rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs text-foreground-secondary">
                      +{project.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
