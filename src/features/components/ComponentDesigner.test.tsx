import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import ComponentDesigner from './ComponentDesigner';

// Mock the API client
vi.mock('../../lib/api/client', () => ({
  client: {
    POST: vi.fn(),
  },
  authHeader: vi.fn(() => ({})),
}));

// Mock the YamlEditor component
vi.mock('../../components/YamlEditor', () => {
  return {
    default: function MockYamlEditor({
      onChange,
    }: {
      value: string;
      onChange: (value: string) => void;
    }) {
      return (
        <textarea
          data-testid="yaml-editor"
          onChange={e => onChange(e.target.value)}
          placeholder="YAML content"
        />
      );
    },
  };
});

// Mock the FieldEditor component
vi.mock('./FieldEditor', () => {
  return {
    default: function MockFieldEditor({ name: _name }: { name: string }) {
      return (
        <div data-testid="field-editor">
          <h3>Fields</h3>
          <button type="button">Add Field</button>
        </div>
      );
    },
  };
});

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('ComponentDesigner', () => {
  it('renders form tab by default', () => {
    render(
      <TestWrapper>
        <ComponentDesigner projectId="test-project" />
      </TestWrapper>
    );

    expect(screen.getByText('Create Component')).toBeInTheDocument();
    expect(
      screen.getByText('Design your component using the form or YAML editor')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Type *')).toBeInTheDocument();
  });

  it('switches between form and YAML tabs', () => {
    render(
      <TestWrapper>
        <ComponentDesigner projectId="test-project" />
      </TestWrapper>
    );

    // Form tab should be active by default
    expect(screen.getByText('Form')).toHaveClass('border-accent');
    expect(screen.getByText('YAML')).toHaveClass('border-transparent');

    // Click YAML tab
    fireEvent.click(screen.getByText('YAML'));

    expect(screen.getByText('Form')).toHaveClass('border-transparent');
    expect(screen.getByText('YAML')).toHaveClass('border-accent');
    expect(screen.getByTestId('yaml-editor')).toBeInTheDocument();
  });

  it('includes field editor in form tab', () => {
    render(
      <TestWrapper>
        <ComponentDesigner projectId="test-project" />
      </TestWrapper>
    );

    expect(screen.getByTestId('field-editor')).toBeInTheDocument();
    expect(screen.getByText('Fields')).toBeInTheDocument();
  });

  it('shows create button', () => {
    render(
      <TestWrapper>
        <ComponentDesigner projectId="test-project" />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('handles cancel button when provided', () => {
    const onCancel = vi.fn();
    render(
      <TestWrapper>
        <ComponentDesigner projectId="test-project" onCancel={onCancel} />
      </TestWrapper>
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    expect(cancelButton).toBeInTheDocument();

    fireEvent.click(cancelButton);
    expect(onCancel).toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    render(
      <TestWrapper>
        <ComponentDesigner projectId="test-project" />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: 'Create' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });
});
