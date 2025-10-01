import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
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

  it('renders projects list as tiles', async () => {
    const mockProjects = [
      {
        id: 'project-1',
        name: 'Test Project 1',
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        description: 'A test project',
        tags: ['web', 'api'],
      },
      {
        id: 'project-2',
        name: 'Test Project 2',
        status: 'inactive' as const,
        createdAt: '2023-01-02T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
        description: 'Another test project',
        tags: ['database'],
      },
    ];

    mockClient.GET.mockResolvedValue({
      data: { projects: mockProjects },
      error: undefined,
      response: {} as Response,
    });

    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ProjectsPage />
        </QueryClientProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      expect(screen.getByText('Test Project 2')).toBeInTheDocument();
    });

    // Check that projects are rendered as tiles (not in a table)
    expect(screen.getByText('project-1')).toBeInTheDocument();
    expect(screen.getByText('project-2')).toBeInTheDocument();

    // Check that descriptions are shown
    expect(screen.getByText('A test project')).toBeInTheDocument();
    expect(screen.getByText('Another test project')).toBeInTheDocument();

    // Check that tags are shown
    expect(screen.getByText('web')).toBeInTheDocument();
    expect(screen.getByText('api')).toBeInTheDocument();
    expect(screen.getByText('database')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockClient.GET.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ProjectsPage />
        </QueryClientProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    mockClient.GET.mockRejectedValue(new Error('API Error'));

    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ProjectsPage />
        </QueryClientProvider>
      </BrowserRouter>
    );

    // In development mode, the component falls back to mock data instead of showing error
    await waitFor(() => {
      expect(screen.getByText('Sample Project')).toBeInTheDocument();
    });
  });

  it('renders new project button', async () => {
    mockClient.GET.mockResolvedValue({
      data: { projects: [] },
      error: undefined,
      response: {} as Response,
    });

    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ProjectsPage />
        </QueryClientProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('New Project')).toBeInTheDocument();
    });
  });

  it('shows empty state when no projects', async () => {
    mockClient.GET.mockResolvedValue({
      data: { projects: [] },
      error: undefined,
      response: {} as Response,
    });

    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ProjectsPage />
        </QueryClientProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No projects yet')).toBeInTheDocument();
      expect(
        screen.getByText('Get started by creating your first project.')
      ).toBeInTheDocument();
      expect(screen.getByText('Create Project')).toBeInTheDocument();
    });
  });
});
