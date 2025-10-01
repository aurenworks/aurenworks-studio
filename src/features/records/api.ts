import type {
  RecordData,
  CreateRecordRequest,
  UpdateRecordRequest,
  RecordField,
} from './types';

// Mock API functions - these will be replaced with real endpoints when available
export async function listRecords(componentId: string): Promise<RecordData[]> {
  // For now, return mock data
  // TODO: Replace with real API call when records endpoints are available
  const mockRecords: RecordData[] = [
    {
      id: 'record-1',
      componentId,
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        status: 'active',
        createdAt: '2024-01-15T10:30:00Z',
      },
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 'record-2',
      componentId,
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        age: 25,
        status: 'inactive',
        createdAt: '2024-01-16T14:20:00Z',
      },
      createdAt: '2024-01-16T14:20:00Z',
      updatedAt: '2024-01-16T14:20:00Z',
    },
  ];

  return mockRecords;
}

export async function createRecord(
  data: CreateRecordRequest
): Promise<RecordData> {
  // For now, return mock data
  // TODO: Replace with real API call when records endpoints are available
  const mockRecord: RecordData = {
    id: `record-${Date.now()}`,
    componentId: data.componentId,
    data: data.data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return mockRecord;
}

export async function updateRecord(
  recordId: string,
  data: UpdateRecordRequest
): Promise<RecordData> {
  // For now, return mock data
  // TODO: Replace with real API call when records endpoints are available
  const mockRecord: RecordData = {
    id: recordId,
    componentId: 'mock-component',
    data: data.data,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: new Date().toISOString(),
  };

  return mockRecord;
}

export async function deleteRecord(_recordId: string): Promise<void> {
  // For now, just simulate success
  // TODO: Replace with real API call when records endpoints are available
  return Promise.resolve();
}

// Mock function to get component fields - this would come from the component definition
export function getComponentFields(): RecordField[] {
  // Mock fields based on component type
  return [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'email', type: 'text', label: 'Email', required: true },
    { name: 'age', type: 'number', label: 'Age', required: false },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      options: ['active', 'inactive', 'pending'],
    },
    { name: 'createdAt', type: 'date', label: 'Created At', required: false },
  ];
}
