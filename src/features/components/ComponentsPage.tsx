import { useQuery } from '@tanstack/react-query';
import { client, authHeader } from '../../lib/api/client';
import type { components } from '../../lib/api/types';

type Component = components['schemas']['Component'];

interface ComponentsPageProps {
  projectId: string;
}

async function listComponents(projectId: string): Promise<Component[]> {
  const res = await client.GET('/projects/{projectId}/components', {
    params: { path: { projectId } },
    headers: authHeader(),
  });
  if (res.error) throw res.error;
  return res.data?.components ?? [];
}

export default function ComponentsPage({ projectId }: ComponentsPageProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['components', projectId],
    queryFn: () => listComponents(projectId),
  });

  if (isLoading) return <div>Loading components...</div>;
  if (error)
    return <div className="text-red-600">Failed to load components</div>;

  return (
    <div className="rounded-xl border bg-white">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">Components</h3>
        <p className="text-sm text-gray-600">Project: {projectId}</p>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Type</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map(component => (
            <tr key={component.id} className="border-t">
              <td className="p-2 font-mono text-xs">{component.id}</td>
              <td className="p-2">{component.name}</td>
              <td className="p-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {component.type}
                </span>
              </td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    component.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : component.status === 'inactive'
                        ? 'bg-gray-100 text-gray-800'
                        : component.status === 'deploying'
                          ? 'bg-yellow-100 text-yellow-800'
                          : component.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {component.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {data && data.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No components found for this project.
        </div>
      )}
    </div>
  );
}
