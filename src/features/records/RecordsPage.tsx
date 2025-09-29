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
import type { Record, RecordField } from './types';
import CreateRecordModal from './CreateRecordModal';
import EditRecordModal from './EditRecordModal';

interface RecordsPageProps {
  componentId: string;
}

const columnHelper = createColumnHelper<Record>();

export default function RecordsPage({ componentId }: RecordsPageProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
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
        <span className="font-mono text-xs text-gray-600">
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
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
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
            className="p-1 text-gray-600 hover:text-blue-600"
            title="Edit record"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => deleteRecordMutation.mutate(info.row.original.id)}
            className="p-1 text-gray-600 hover:text-red-600"
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
        <div className="text-gray-600">Loading records...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-600">Failed to load records</div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border bg-white">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Records</h3>
              <p className="text-sm text-gray-600">Component: {componentId}</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>New Record</span>
            </button>
          </div>
        </div>

        {records && records.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-lg font-medium mb-2">No records found</div>
            <div className="text-sm">
              Create your first record to get started.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="p-2 font-medium">
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
                  <tr key={row.id} className="border-t hover:bg-gray-50">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="p-2">
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
