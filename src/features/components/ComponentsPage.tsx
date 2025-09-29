import { useQuery } from '@tanstack/react-query';
import { client, authHeader } from '../../lib/api/client';
import type { components } from '../../lib/api/types';

type Component = components['schemas']['Component'];

interface ComponentsPageProps {
  projectId: string;
}

async function listComponents(projectId: string): Promise<Component[]> {
  // For development: return mock data if no backend is available
  const isDevelopment = import.meta.env.DEV;

  if (isDevelopment) {
    try {
      const res = await client.GET('/projects/{projectId}/components', {
        params: { path: { projectId } },
        headers: authHeader(),
      });
      if (res.error) {
        // API not available, using mock data
        return getMockComponents(projectId);
      }
      return res.data?.components ?? [];
    } catch {
      // API not available, using mock data
      return getMockComponents(projectId);
    }
  }

  const res = await client.GET('/projects/{projectId}/components', {
    params: { path: { projectId } },
    headers: authHeader(),
  });
  if (res.error) throw res.error;
  return res.data?.components ?? [];
}

function getMockComponents(projectId: string): Component[] {
  return [
    {
      id: 'comp-1',
      name: 'User Profile Component',
      type: 'api',
      status: 'active',
      projectId: projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'comp-2',
      name: 'Product List Component',
      type: 'service',
      status: 'active',
      projectId: projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'comp-3',
      name: 'Settings Component',
      type: 'api',
      status: 'inactive',
      projectId: projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export default function ComponentsPage({ projectId }: ComponentsPageProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['components', projectId],
    queryFn: () => listComponents(projectId),
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-foreground-secondary">Loading components...</div>
      </div>
    );

  if (error) {
    return (
      <div className="text-error space-y-2">
        <div className="font-medium">Failed to load components</div>
        <div className="text-sm text-foreground-secondary">
          {import.meta.env.DEV
            ? 'Development mode: Check console for details. Using mock data if available.'
            : 'Please check your connection and try again.'}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Components</h2>
        <p className="text-sm text-foreground-secondary">
          Project: {projectId}
        </p>
      </div>

      <div className="card">
        <table className="w-full text-sm">
          <thead className="bg-background-secondary text-left">
            <tr>
              <th className="p-4 font-medium text-foreground">ID</th>
              <th className="p-4 font-medium text-foreground">Name</th>
              <th className="p-4 font-medium text-foreground">Type</th>
              <th className="p-4 font-medium text-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map(component => (
              <tr
                key={component.id}
                className="border-t border-border hover:bg-background-secondary/50 transition-colors"
              >
                <td className="p-4 font-mono text-xs text-foreground-secondary">
                  {component.id}
                </td>
                <td className="p-4 font-medium text-foreground">
                  {component.name}
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-accent-secondary/10 text-accent-secondary rounded text-xs font-medium">
                    {component.type}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={
                      component.status === 'active'
                        ? 'status-active'
                        : component.status === 'inactive'
                          ? 'status-inactive'
                          : component.status === 'deploying'
                            ? 'status-warning'
                            : component.status === 'failed'
                              ? 'status-error'
                              : 'status-inactive'
                    }
                  >
                    {component.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data && data.length === 0 && (
          <div className="p-8 text-center text-foreground-muted">
            No components found for this project.
          </div>
        )}
      </div>
    </>
  );
}
