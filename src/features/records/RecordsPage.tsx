import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { listRecords, deleteRecord, getComponentFields } from './api';
import type { RecordData, RecordField } from './types';
import CreateRecordModal from './CreateRecordModal';
import EditRecordModal from './EditRecordModal';

interface RecordsPageProps {
  componentId: string;
}

const columnHelper = createColumnHelper<RecordData>();

export default function RecordsPage({ componentId }: RecordsPageProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RecordData | null>(null);
  const queryClient = useQueryClient();

  const {
    data: records,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['records', componentId],
    queryFn: () => listRecords(componentId),
  });

  const { data: fields } = useQuery({
    queryKey: ['component-fields', componentId],
    queryFn: () => getComponentFields(),
  });

  const deleteRecordMutation = useMutation({
    mutationFn: deleteRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', componentId] });
    },
  });

  const columns = [
    // Add ID column
    columnHelper.accessor('id', {
      header: 'ID',
      cell: info => (
        <span className="font-mono text-xs text-foreground-secondary">
          {info.getValue()}
        </span>
      ),
    }),
    // Add dynamic columns based on component fields
    ...(fields || []).map((field: RecordField) =>
      columnHelper.accessor(`data.${field.name}`, {
        header: field.label,
        cell: info => {
          const value = info.getValue();
          if (field.type === 'date' && value) {
            return new Date(value as string).toLocaleDateString();
          }
          if (field.type === 'select' && value) {
            return (
              <span className="px-2 py-1 bg-accent-secondary/10 text-accent-secondary rounded text-xs font-medium">
                {value as string}
              </span>
            );
          }
          return value ? String(value) : '-';
        },
      })
    ),
    // Add actions column
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: info => (
        <div className="flex space-x-2">
          <button
            onClick={() => setEditingRecord(info.row.original)}
            className="p-1 text-foreground-secondary hover:text-accent transition-colors"
            title="Edit record"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => deleteRecordMutation.mutate(info.row.original.id)}
            className="p-1 text-foreground-secondary hover:text-error transition-colors"
            title="Delete record"
            disabled={deleteRecordMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: records || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-foreground-secondary">Loading records...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-error">Failed to load records</div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Records</h2>
        <p className="text-sm text-foreground-secondary">Component: {componentId}</p>
      </div>

      <div className="card">
        <div className="p-4 border-b border-border">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-foreground">Records</h3>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Record</span>
            </button>
          </div>
        </div>

        {records && records.length === 0 ? (
          <div className="p-8 text-center text-foreground-muted">
            <div className="text-lg font-medium mb-2">No records found</div>
            <div className="text-sm">
              Create your first record to get started.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background-secondary text-left">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="p-4 font-medium text-foreground">
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
                  <tr key={row.id} className="border-t border-border hover:bg-background-secondary/50 transition-colors">
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
      </div>

      <CreateRecordModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        componentId={componentId}
        fields={fields || []}
      />

      {editingRecord && (
        <EditRecordModal
          isOpen={!!editingRecord}
          onClose={() => setEditingRecord(null)}
          record={editingRecord}
          fields={fields || []}
        />
      )}
    </>
  );
}
