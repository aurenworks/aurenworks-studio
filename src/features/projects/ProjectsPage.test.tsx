import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import ProjectsPage from './ProjectsPage';
import { client } from '../../lib/api/client';

// Mock the client
vi.mock('../../lib/api/client', () => ({
  client: {
    GET: vi.fn(),
  },
  authHeader: vi.fn(() => ({ Authorization: 'Bearer test-token' })),
}));

const mockClient = vi.mocked(client);

describe('ProjectsPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  it('renders projects list', async () => {
    const mockProjects = [
      {
        id: 'project-1',
        name: 'Test Project 1',
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
      {
        id: 'project-2',
        name: 'Test Project 2',
        status: 'inactive' as const,
        createdAt: '2023-01-02T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
      },
    ];

    mockClient.GET.mockResolvedValue({
      data: { projects: mockProjects },
      error: undefined,
      response: {} as Response,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      expect(screen.getByText('Test Project 2')).toBeInTheDocument();
    });

    expect(screen.getByText('project-1')).toBeInTheDocument();
    expect(screen.getByText('project-2')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockClient.GET.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectsPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    mockClient.GET.mockRejectedValue(new Error('API Error'));

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load projects')).toBeInTheDocument();
    });
  });

  it('renders new project button', async () => {
    mockClient.GET.mockResolvedValue({
      data: { projects: [] },
      error: undefined,
      response: {} as Response,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ProjectsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('New Project')).toBeInTheDocument();
    });
  });
});
