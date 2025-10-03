import { useState, lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Plus, Edit, Eye } from 'lucide-react';
import { client, authHeader } from '../../lib/api/client';
import type { components } from '../../lib/api/types';

// Lazy load ComponentDesignerModal to avoid Monaco editor import during tests
const ComponentDesignerModal = lazy(() => import('./ComponentDesignerModal'));

type Component = components['schemas']['Component'];

interface ComponentsPageProps {
  projectId: string;
}

async function listComponents(
  projectId: string,
  limit = 10,
  offset = 0
): Promise<{
  components: Component[];
  total: number;
  limit: number;
  offset: number;
}> {
  // For development: return mock data if no backend is available
  const isDevelopment = import.meta.env.DEV;

  if (isDevelopment) {
    try {
      const res = await client.GET('/projects/{projectId}/components', {
        params: {
          path: { projectId },
          query: { limit, offset },
        },
        headers: authHeader(),
      });
      if (res.error) {
        // API not available, using mock data
        const mockComponents = getMockComponents(projectId);
        return {
          components: mockComponents.slice(offset, offset + limit),
          total: mockComponents.length,
          limit,
          offset,
        };
      }
      return res.data ?? { components: [], total: 0, limit, offset };
    } catch {
      // API not available, using mock data
      const mockComponents = getMockComponents(projectId);
      return {
        components: mockComponents.slice(offset, offset + limit),
        total: mockComponents.length,
        limit,
        offset,
      };
    }
  }

  const res = await client.GET('/projects/{projectId}/components', {
    params: {
      path: { projectId },
      query: { limit, offset },
    },
    headers: authHeader(),
  });
  if (res.error) throw res.error;
  return res.data ?? { components: [], total: 0, limit, offset };
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

const columnHelper = createColumnHelper<Component>();

export default function ComponentsPage({ projectId }: ComponentsPageProps) {
  const [editingComponent, setEditingComponent] = useState<Component | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['components', projectId, currentPage, pageSize],
    queryFn: () => listComponents(projectId, pageSize, currentPage * pageSize),
  });

  const handleRowClick = (component: Component) => {
    navigate(`/projects/${projectId}/components/${component.id}`);
  };

  const handleNewComponent = () => {
    navigate(`/projects/${projectId}/components/new`);
  };

  const columns = [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: info => (
        <span className="font-mono text-xs text-foreground-secondary">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => (
        <span className="font-medium text-foreground">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: info => (
        <span className="px-2 py-1 bg-accent-secondary/10 text-accent-secondary rounded text-xs font-medium">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const status = info.getValue();
        const statusClasses = {
          active: 'status-active',
          inactive: 'status-inactive',
          deploying: 'status-warning',
          failed: 'status-error',
          pending: 'status-inactive',
        };
        return (
          <span className={statusClasses[status as keyof typeof statusClasses]}>
            {status}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: info => (
        <div className="flex space-x-2">
          <button
            onClick={e => {
              e.stopPropagation();
              handleRowClick(info.row.original);
            }}
            className="text-sm text-accent hover:text-accent/80 transition-colors flex items-center space-x-1"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              setEditingComponent(info.row.original);
            }}
            className="text-sm text-accent hover:text-accent/80 transition-colors flex items-center space-x-1"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: data?.components ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Components</h2>
          <p className="text-sm text-foreground-secondary">
            Project: {projectId}
          </p>
        </div>
        <button
          onClick={handleNewComponent}
          className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-md transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Component</span>
        </button>
      </div>

      <div className="card">
        {data && data.components.length === 0 ? (
          <div className="p-8 text-center text-foreground-muted">
            <div className="text-lg font-medium mb-2">No components found</div>
            <div className="text-sm">
              Create your first component to get started.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background-secondary text-left">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="p-4 font-medium text-foreground"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    onClick={() => handleRowClick(row.original)}
                    className="border-t border-border hover:bg-background-secondary/50 transition-colors cursor-pointer"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="p-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <div className="text-sm text-foreground-secondary">
              Showing {(data?.offset || 0) + 1} to{' '}
              {Math.min((data?.offset || 0) + pageSize, data?.total || 0)} of{' '}
              {data?.total || 0} components
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 text-sm border border-border rounded hover:bg-background-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))
                }
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 text-sm border border-border rounded hover:bg-background-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Component Modal */}
      {editingComponent && (
        <Suspense fallback={<div>Loading...</div>}>
          <ComponentDesignerModal
            isOpen={!!editingComponent}
            onClose={() => setEditingComponent(null)}
            component={editingComponent}
            projectId={projectId}
          />
        </Suspense>
      )}
    </>
  );
}
