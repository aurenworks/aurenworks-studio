import React, { lazy, Suspense } from 'react';
import type { components } from '../../lib/api/types';

// Lazy load ComponentDesigner to avoid Monaco editor import during tests
const ComponentDesigner = lazy(() => import('./ComponentDesigner'));

type Component = components['schemas']['Component'];

interface ComponentDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  component?: Component;
  projectId: string;
}

export default function ComponentDesignerModal({
  isOpen,
  onClose,
  component,
  projectId,
}: ComponentDesignerModalProps) {
  if (!isOpen) return null;

  const handleSave = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <Suspense fallback={<div>Loading component designer...</div>}>
            <ComponentDesigner
              component={component}
              projectId={projectId}
              onSave={handleSave}
              onCancel={onClose}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
