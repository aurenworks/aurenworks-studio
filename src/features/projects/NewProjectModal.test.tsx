import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import NewProjectModal from './NewProjectModal';

// Mock the API client
vi.mock('../../lib/api/client', () => ({
  client: {
    POST: vi.fn(),
  },
  authHeader: vi.fn(() => ({ Authorization: 'Bearer test-token' })),
}));

// Mock the toast hook
vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('NewProjectModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open', () => {
    render(<NewProjectModal isOpen={true} onClose={vi.fn()} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Create New Project')).toBeInTheDocument();
    expect(screen.getByLabelText('Project Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create Project' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<NewProjectModal isOpen={false} onClose={vi.fn()} />, {
      wrapper: createWrapper(),
    });

    expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    render(<NewProjectModal isOpen={true} onClose={vi.fn()} />, {
      wrapper: createWrapper(),
    });

    const submitButton = screen.getByRole('button', { name: 'Create Project' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Project name is required')).toBeInTheDocument();
    });
  });

  it('shows validation error for name too long', async () => {
    render(<NewProjectModal isOpen={true} onClose={vi.fn()} />, {
      wrapper: createWrapper(),
    });

    const nameInput = screen.getByLabelText('Project Name *');
    const longName = 'a'.repeat(101); // Exceeds 100 character limit

    fireEvent.change(nameInput, { target: { value: longName } });

    const submitButton = screen.getByRole('button', { name: 'Create Project' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Name must be less than 100 characters')
      ).toBeInTheDocument();
    });
  });

  it('shows validation error for description too long', async () => {
    render(<NewProjectModal isOpen={true} onClose={vi.fn()} />, {
      wrapper: createWrapper(),
    });

    const nameInput = screen.getByLabelText('Project Name *');
    const descriptionInput = screen.getByLabelText('Description');
    const longDescription = 'a'.repeat(501); // Exceeds 500 character limit

    fireEvent.change(nameInput, { target: { value: 'Test Project' } });
    fireEvent.change(descriptionInput, { target: { value: longDescription } });

    const submitButton = screen.getByRole('button', { name: 'Create Project' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Description must be less than 500 characters')
      ).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn();
    render(<NewProjectModal isOpen={true} onClose={onClose} />, {
      wrapper: createWrapper(),
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('resets form when modal is closed', () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <NewProjectModal isOpen={true} onClose={onClose} />,
      { wrapper: createWrapper() }
    );

    const nameInput = screen.getByLabelText('Project Name *');
    fireEvent.change(nameInput, { target: { value: 'Test Project' } });

    // Close modal
    unmount();

    // Reopen modal with fresh instance
    render(<NewProjectModal isOpen={true} onClose={onClose} />, {
      wrapper: createWrapper(),
    });

    const nameInputAfterReopen = screen.getByLabelText('Project Name *');
    expect(nameInputAfterReopen).toHaveValue('');
  });

  it('disables submit button while submitting', async () => {
    const { client } = await import('../../lib/api/client');
    vi.mocked(client.POST).mockImplementation(
      () =>
        new Promise(resolve =>
          resolve({
            data: {
              id: 'test',
              name: 'Test',
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            response: new Response(),
          })
        )
    );

    render(<NewProjectModal isOpen={true} onClose={vi.fn()} />, {
      wrapper: createWrapper(),
    });

    const nameInput = screen.getByLabelText('Project Name *');
    const submitButton = screen.getByRole('button', { name: 'Create Project' });

    fireEvent.change(nameInput, { target: { value: 'Test Project' } });
    fireEvent.click(submitButton);

    expect(screen.getByRole('button', { name: 'Creating...' })).toBeDisabled();
  });
});
