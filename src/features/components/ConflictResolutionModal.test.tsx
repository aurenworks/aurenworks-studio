import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ConflictResolutionModal from './ConflictResolutionModal';
import type { components } from '../../lib/api/types';

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

const mockDraft: Component = {
  ...mockComponent,
  name: 'Updated Test Component',
  description: 'An updated test component',
  updatedAt: '2023-01-01T01:00:00Z',
};

describe('ConflictResolutionModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onOverwrite: vi.fn(),
    onOpenLatest: vi.fn(),
    latestComponent: mockComponent,
    yourDraft: mockDraft,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open', () => {
    render(<ConflictResolutionModal {...defaultProps} />);

    expect(screen.getByText('Conflict Detected')).toBeInTheDocument();
    expect(screen.getByText('Latest Version')).toBeInTheDocument();
    expect(screen.getByText('Your Draft')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ConflictResolutionModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Conflict Detected')).not.toBeInTheDocument();
  });

  it('displays component information correctly', () => {
    render(<ConflictResolutionModal {...defaultProps} />);
    
    // Check latest component info
    expect(screen.getByText('Test Component')).toBeInTheDocument();
    expect(screen.getAllByText('api')).toHaveLength(2); // Both components have type 'api'
    expect(screen.getAllByText('active')).toHaveLength(2); // Both components have status 'active'
    
    // Check draft component info
    expect(screen.getByText('Updated Test Component')).toBeInTheDocument();
    expect(screen.getByText('An updated test component')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    render(<ConflictResolutionModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenLatest when Open Latest Version is clicked', () => {
    render(<ConflictResolutionModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Open Latest Version'));
    expect(defaultProps.onOpenLatest).toHaveBeenCalledTimes(1);
  });

  it('calls onOverwrite when Overwrite with My Changes is clicked', () => {
    render(<ConflictResolutionModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Overwrite with My Changes'));
    expect(defaultProps.onOverwrite).toHaveBeenCalledTimes(1);
  });

  it('displays timestamps correctly', () => {
    render(<ConflictResolutionModal {...defaultProps} />);
    
    // Check that timestamps are displayed (format may vary based on locale)
    expect(screen.getAllByText(/12\/31\/2022/)).toHaveLength(2);
  });
});
