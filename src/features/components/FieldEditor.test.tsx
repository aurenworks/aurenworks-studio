import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FieldEditor, { fieldSchema } from './FieldEditor';

// Test schema that includes fields
const testSchema = z.object({
  fields: z.array(fieldSchema).optional(),
});

type TestFormData = z.infer<typeof testSchema>;

// Wrapper component for testing
function TestWrapper({ children }: { children: React.ReactNode }) {
  const form = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      fields: [],
    },
  });

  return <FormProvider {...form}>{children}</FormProvider>;
}

describe('FieldEditor', () => {
  it('renders empty state when no fields', () => {
    render(
      <TestWrapper>
        <FieldEditor name="fields" />
      </TestWrapper>
    );

    expect(
      screen.getByText('No fields defined. Click "Add Field" to get started.')
    ).toBeInTheDocument();
  });

  it('adds a new field when Add Field button is clicked', async () => {
    render(
      <TestWrapper>
        <FieldEditor name="fields" />
      </TestWrapper>
    );

    const addButton = screen.getByText('Add Field');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Field 1')).toBeInTheDocument();
    });

    // Check that form fields are rendered
    expect(screen.getByPlaceholderText('field_key')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Field Label')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('removes a field when delete button is clicked', async () => {
    render(
      <TestWrapper>
        <FieldEditor name="fields" />
      </TestWrapper>
    );

    // Add a field
    const addButton = screen.getByText('Add Field');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Field 1')).toBeInTheDocument();
    });

    // Remove the field - find the delete button by its class
    const deleteButton = screen.getAllByRole('button')[2]; // Third button is the delete button
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    await waitFor(() => {
      expect(screen.queryByText('Field 1')).not.toBeInTheDocument();
    });
  });

  it('shows options field when select type is chosen', async () => {
    render(
      <TestWrapper>
        <FieldEditor name="fields" />
      </TestWrapper>
    );

    // Add a field
    const addButton = screen.getByText('Add Field');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Field 1')).toBeInTheDocument();
    });

    // Change type to select
    const typeSelect = screen.getByRole('combobox');
    fireEvent.change(typeSelect, { target: { value: 'select' } });

    await waitFor(() => {
      expect(screen.getByText('Options (one per line)')).toBeInTheDocument();
    });
  });

  it('renders form fields correctly', async () => {
    render(
      <TestWrapper>
        <FieldEditor name="fields" />
      </TestWrapper>
    );

    // Add a field
    const addButton = screen.getByText('Add Field');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Field 1')).toBeInTheDocument();
    });

    // Check that all form fields are present
    expect(screen.getByPlaceholderText('field_key')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Field Label')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByLabelText('Required')).toBeInTheDocument();
  });

  it('handles multiple fields correctly', async () => {
    render(
      <TestWrapper>
        <FieldEditor name="fields" />
      </TestWrapper>
    );

    // Add first field
    const addButton = screen.getByText('Add Field');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Field 1')).toBeInTheDocument();
    });

    // Add second field
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Field 2')).toBeInTheDocument();
    });

    // Both fields should be present
    expect(screen.getAllByPlaceholderText('field_key')).toHaveLength(2);
    expect(screen.getAllByPlaceholderText('Field Label')).toHaveLength(2);
  });
});
