// Mock types for records until they're added to the OpenAPI schema
export interface Record {
  id: string;
  componentId: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface RecordField {
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  label: string;
  required?: boolean;
  options?: string[]; // For select fields
}

export interface CreateRecordRequest {
  componentId: string;
  data: Record<string, unknown>;
}

export interface UpdateRecordRequest {
  data: Record<string, unknown>;
}

export interface RecordListResponse {
  records: Record[];
  total: number;
  limit: number;
  offset: number;
}
