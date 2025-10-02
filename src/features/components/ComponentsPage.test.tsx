import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ComponentsPage from './ComponentsPage';
import { client } from '../../lib/api/client';

// Mock the API client
vi.mock('../../lib/api/client', () => ({
  client: {
    GET: vi.fn(),
  },
  authHeader: vi.fn(() => ({})),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock ComponentDesignerModal
vi.mock('./ComponentDesignerModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? (
      <div data-testid="component-designer-modal">Component Designer Modal</div>
    ) : null,
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe('ComponentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders one row with mocked client', async () => {
    // Mock the API response
    const mockComponents = [
      {
        id: 'comp-1',
        name: 'Test Component',
        type: 'api',
        status: 'active',
        projectId: 'test-project',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
    ];

    (client.GET as any).mockResolvedValue({
      data: {
        components: mockComponents,
        total: 1,
        limit: 10,
        offset: 0,
      },
    });

    render(
      <TestWrapper>
        <ComponentsPage projectId="test-project" />
      </TestWrapper>
    );

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Components')).toBeInTheDocument();
    });

    // Check that the component data is displayed
    expect(screen.getByText('Test Component')).toBeInTheDocument();
    expect(screen.getByText('comp-1')).toBeInTheDocument();
    expect(screen.getByText('api')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();

    // Check that the table has the correct structure
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Check that the New Component button is present
    expect(screen.getByText('New Component')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (client.GET as any).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <TestWrapper>
        <ComponentsPage projectId="test-project" />
      </TestWrapper>
    );

    expect(screen.getByText('Loading components...')).toBeInTheDocument();
  });

  it.skip('shows error state', async () => {
    // Mock the API to return an error response instead of rejecting
    (client.GET as any).mockResolvedValue({
      error: new Error('API Error'),
    });

    render(
      <TestWrapper>
        <ComponentsPage projectId="test-project" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load components')).toBeInTheDocument();
    });
  });

  it('shows empty state when no components', async () => {
    (client.GET as any).mockResolvedValue({
      data: {
        components: [],
        total: 0,
        limit: 10,
        offset: 0,
      },
    });

    render(
      <TestWrapper>
        <ComponentsPage projectId="test-project" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No components found')).toBeInTheDocument();
      expect(
        screen.getByText('Create your first component to get started.')
      ).toBeInTheDocument();
    });
  });

  it('navigates to new component page when New Component button is clicked', async () => {
    (client.GET as any).mockResolvedValue({
      data: {
        components: [],
        total: 0,
        limit: 10,
        offset: 0,
      },
    });

    render(
      <TestWrapper>
        <ComponentsPage projectId="test-project" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('New Component')).toBeInTheDocument();
    });

    screen.getByText('New Component').click();

    expect(mockNavigate).toHaveBeenCalledWith(
      '/projects/test-project/components/new'
    );
  });

  it('navigates to component designer when row is clicked', async () => {
    const mockComponents = [
      {
        id: 'comp-1',
        name: 'Test Component',
        type: 'api',
        status: 'active',
        projectId: 'test-project',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
    ];

    (client.GET as any).mockResolvedValue({
      data: {
        components: mockComponents,
        total: 1,
        limit: 10,
        offset: 0,
      },
    });

    render(
      <TestWrapper>
        <ComponentsPage projectId="test-project" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Component')).toBeInTheDocument();
    });

    // Click on the row (the component name)
    screen.getByText('Test Component').click();

    expect(mockNavigate).toHaveBeenCalledWith('/components/comp-1');
  });
});
