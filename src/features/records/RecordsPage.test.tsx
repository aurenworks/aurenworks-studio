import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import RecordsPage from './RecordsPage';

// Mock the API functions
vi.mock('./api', () => ({
  listRecords: vi.fn().mockResolvedValue([
    {
      id: 'record-1',
      componentId: 'test-component',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        status: 'active',
      },
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
  ]),
  getComponentFields: vi.fn().mockResolvedValue([
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'email', type: 'text', label: 'Email', required: true },
    { name: 'age', type: 'number', label: 'Age', required: false },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      options: ['active', 'inactive'],
    },
  ]),
  deleteRecord: vi.fn().mockResolvedValue(undefined),
}));

// Mock the modal components
vi.mock('./CreateRecordModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="create-modal">Create Modal</div> : null,
}));

vi.mock('./EditRecordModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="edit-modal">Edit Modal</div> : null,
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('RecordsPage', () => {
  it('renders records grid with data', async () => {
    render(
      <TestWrapper>
        <RecordsPage componentId="test-component" />
      </TestWrapper>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getAllByRole('heading', { name: 'Records' })).toHaveLength(2);
    });

    // Check that the component ID is displayed
    expect(screen.getByText('Component: test-component')).toBeInTheDocument();

    // Check that the record data is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(
      <TestWrapper>
        <RecordsPage componentId="test-component" />
      </TestWrapper>
    );

    expect(screen.getByText('Loading records...')).toBeInTheDocument();
  });

  it('shows empty state when no records', async () => {
    // Mock empty records
    const { listRecords } = await import('./api');
    vi.mocked(listRecords).mockResolvedValueOnce([]);

    render(
      <TestWrapper>
        <RecordsPage componentId="test-component" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No records found')).toBeInTheDocument();
    });
  });
});
