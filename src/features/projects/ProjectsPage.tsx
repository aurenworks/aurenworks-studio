import { useQuery } from '@tanstack/react-query';
import { client, authHeader } from '../../lib/api/client';
import type { components } from '../../lib/api/types';

type Project = components['schemas']['Project'];

async function listProjects(): Promise<Project[]> {
  const res = await client.GET('/projects', { headers: authHeader() });
  if (res.error) throw res.error;
  return res.data?.projects ?? [];
}

export default function ProjectsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: listProjects,
  });

  if (isLoading) return <div>Loading projects...</div>;
  if (error) return <div className="text-red-600">Failed to load projects</div>;

  return (
    <div className="rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map(p => (
            <tr key={p.id} className="border-t">
              <td className="p-2 font-mono text-xs">{p.id}</td>
              <td className="p-2">{p.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
