import React from 'react';
import type { components } from '../../lib/api/types';
import ComponentDesigner from './ComponentDesigner';

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

  const handleSave = (savedComponent: Component) => {
    console.log('Component saved:', savedComponent);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <ComponentDesigner
            component={component}
            projectId={projectId}
            onSave={handleSave}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
