import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import ComponentDesigner from './ComponentDesigner';
import type { components } from '../../lib/api/types';

// Mock the API client
vi.mock('../../lib/api/client', () => ({
  client: {
    PUT: vi.fn(),
    GET: vi.fn(),
  },
  authHeader: vi.fn(() => ({ Authorization: 'Bearer test-token' })),
}));

// Mock the YamlEditor component
vi.mock('../../components/YamlEditor', () => ({
  YamlEditor: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <textarea
      data-testid="yaml-editor"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  ),
}));

// Mock the Toast components
vi.mock('../../components/Toast', () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
}));

vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    toasts: [],
    removeToast: vi.fn(),
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

type Component = components['schemas']['Component'];

const mockComponent: Component = {
  id: 'test-component',
  name: 'Test Component',
  description: 'A test component',
  type: 'api',
  status: 'active',
  projectId: 'test-project',
  config: {},
  metadata: {},
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  createdBy: 'user-123',
};

const mockLatestComponent: Component = {
  ...mockComponent,
  name: 'Updated by Another User',
  description: 'Modified by someone else',
  updatedAt: '2023-01-01T02:00:00Z',
};

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('ComponentDesigner - Optimistic Concurrency', () => {
  const defaultProps = {
    component: mockComponent,
    projectId: 'test-project',
    etag: 'test-etag-123',
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends If-Match header when updating component', async () => {
    const { client } = await import('../../lib/api/client');

    // Mock successful update
    (client.PUT as any).mockResolvedValue({
      data: mockComponent,
      error: null,
    });

    render(
      <TestWrapper>
        <ComponentDesigner {...defaultProps} />
      </TestWrapper>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Updated Component' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Update'));

    await waitFor(() => {
      expect(client.PUT).toHaveBeenCalledWith(
        '/projects/{projectId}/components/{componentId}',
        expect.objectContaining({
          params: {
            path: { projectId: 'test-project', componentId: 'test-component' },
          },
          headers: expect.objectContaining({
            'If-Match': 'test-etag-123',
          }),
        })
      );
    });
  });

  it('shows conflict modal on 409 error', async () => {
    const { client } = await import('../../lib/api/client');

    // Mock 409 conflict response
    (client.PUT as any).mockResolvedValue({
      data: null,
      error: { status: 409 },
    });

    // Mock successful GET for latest component
    (client.GET as any).mockResolvedValue({
      data: mockLatestComponent,
      error: null,
    });

    render(
      <TestWrapper>
        <ComponentDesigner {...defaultProps} />
      </TestWrapper>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Updated Component' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Update'));

    await waitFor(() => {
      expect(screen.getByText('Conflict Detected')).toBeInTheDocument();
      expect(screen.getByText('Latest Version')).toBeInTheDocument();
      expect(screen.getByText('Your Draft')).toBeInTheDocument();
    });
  });

  it('handles overwrite action correctly', async () => {
    const { client } = await import('../../lib/api/client');

    // Mock 409 conflict response
    (client.PUT as any).mockResolvedValueOnce({
      data: null,
      error: { status: 409 },
    });

    // Mock successful GET for latest component
    (client.GET as any).mockResolvedValue({
      data: mockLatestComponent,
      error: null,
    });

    // Mock successful overwrite
    (client.PUT as any).mockResolvedValueOnce({
      data: mockComponent,
      error: null,
    });

    render(
      <TestWrapper>
        <ComponentDesigner {...defaultProps} />
      </TestWrapper>
    );

    // Fill out the form and submit
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Updated Component' },
    });
    fireEvent.click(screen.getByText('Update'));

    // Wait for conflict modal
    await waitFor(() => {
      expect(screen.getByText('Conflict Detected')).toBeInTheDocument();
    });

    // Click overwrite
    fireEvent.click(screen.getByText('Overwrite with My Changes'));

    await waitFor(() => {
      expect(client.PUT).toHaveBeenCalledTimes(2); // Once for initial attempt, once for overwrite
    });
  });

  it('handles open latest action correctly', async () => {
    const { client } = await import('../../lib/api/client');

    // Mock 409 conflict response
    (client.PUT as any).mockResolvedValue({
      data: null,
      error: { status: 409 },
    });

    // Mock successful GET for latest component
    (client.GET as any).mockResolvedValue({
      data: mockLatestComponent,
      error: null,
    });

    render(
      <TestWrapper>
        <ComponentDesigner {...defaultProps} />
      </TestWrapper>
    );

    // Fill out the form and submit
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Updated Component' },
    });
    fireEvent.click(screen.getByText('Update'));

    // Wait for conflict modal
    await waitFor(() => {
      expect(screen.getByText('Conflict Detected')).toBeInTheDocument();
    });

    // Click open latest
    fireEvent.click(screen.getByText('Open Latest Version'));

    await waitFor(() => {
      // Check that form is updated with latest component data
      expect(
        screen.getByDisplayValue('Updated by Another User')
      ).toBeInTheDocument();
    });
  });
});
