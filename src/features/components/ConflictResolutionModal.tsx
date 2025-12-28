import React from 'react';
import type { components } from '../../lib/api/types';

type Component = components['schemas']['Component'];

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOverwrite: () => void;
  onOpenLatest: () => void;
  latestComponent: Component;
  yourDraft: Component;
}

export default function ConflictResolutionModal({
  isOpen,
  onClose,
  onOverwrite,
  onOpenLatest,
  latestComponent,
  yourDraft,
}: ConflictResolutionModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      data-testid="conflict-resolution-modal"
    >
      <div className="bg-background border border-border rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Conflict Detected
          </h2>
          <p className="text-foreground-secondary">
            This component has been modified by someone else since you started
            editing. How would you like to proceed?
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-medium text-foreground mb-2">Latest Version</h3>
            <div className="text-sm text-foreground-secondary space-y-1">
              <p>
                <strong>Name:</strong> {latestComponent.name}
              </p>
              <p>
                <strong>Type:</strong> {latestComponent.type}
              </p>
              <p>
                <strong>Status:</strong> {latestComponent.status}
              </p>
              <p>
                <strong>Last Updated:</strong>{' '}
                {new Date(latestComponent.updatedAt).toLocaleString()}
              </p>
              {latestComponent.description && (
                <p>
                  <strong>Description:</strong> {latestComponent.description}
                </p>
              )}
            </div>
          </div>

          <div className="border border-border rounded-lg p-4">
            <h3 className="font-medium text-foreground mb-2">Your Draft</h3>
            <div className="text-sm text-foreground-secondary space-y-1">
              <p>
                <strong>Name:</strong> {yourDraft.name}
              </p>
              <p>
                <strong>Type:</strong> {yourDraft.type}
              </p>
              <p>
                <strong>Status:</strong> {yourDraft.status}
              </p>
              <p>
                <strong>Last Updated:</strong>{' '}
                {new Date(yourDraft.updatedAt).toLocaleString()}
              </p>
              {yourDraft.description && (
                <p>
                  <strong>Description:</strong> {yourDraft.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onOpenLatest}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Open Latest Version
          </button>
          <button
            type="button"
            onClick={onOverwrite}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            Overwrite with My Changes
          </button>
        </div>
      </div>
    </div>
  );
}
