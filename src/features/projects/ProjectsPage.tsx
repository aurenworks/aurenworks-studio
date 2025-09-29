import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { client, authHeader } from '../../lib/api/client';
import type { components } from '../../lib/api/types';
import NewProjectModal from './NewProjectModal';

type Project = components['schemas']['Project'];

async function listProjects(): Promise<Project[]> {
  const res = await client.GET('/projects', { headers: authHeader() });
  if (res.error) throw res.error;
  return res.data?.projects ?? [];
}

export default function ProjectsPage() {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: listProjects,
  });

  if (isLoading) return <div>Loading projects...</div>;
  if (error) return <div className="text-red-600">Failed to load projects</div>;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Projects</h3>
        <button
          onClick={() => setIsNewProjectModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          New Project
        </button>
      </div>

      <div className="rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-2 font-mono text-xs">{p.id}</td>
                <td className="p-2">{p.name}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      p.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : p.status === 'inactive'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                    }`}
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
