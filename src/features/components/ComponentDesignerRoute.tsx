import { useParams, useNavigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getComponentWithETag } from '../../lib/api/client';
import type { components } from '../../lib/api/types';

// Lazy load ComponentDesigner to avoid Monaco editor import during tests
const ComponentDesigner = lazy(() => import('./ComponentDesigner'));

type Component = components['schemas']['Component'];

export default function ComponentDesignerRoute() {
  const { id, projectId } = useParams<{ id?: string; projectId: string }>();
  const navigate = useNavigate();

  // Load component data if editing an existing component
  const {
    data: componentData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['component', id],
    queryFn: async () => {
      if (!id || !projectId) return null;

      const { component, etag } = await getComponentWithETag(projectId, id);
      return { component, etag };
    },
    enabled: !!id && !!projectId,
  });

  const handleSave = (_component: Component) => {
    // Navigate back to the components list
    if (projectId) {
      navigate(`/projects/${projectId}/components`);
    } else {
      navigate('/');
    }
  };

  const handleCancel = () => {
    // Navigate back to the components list
    if (projectId) {
      navigate(`/projects/${projectId}/components`);
    } else {
      navigate('/');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        Loading component...
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Error Loading Component
          </h2>
          <p className="text-sm text-foreground-secondary mb-4">
            {error instanceof Error
              ? error.message
              : 'Failed to load component'}
          </p>
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-md transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading component designer...</div>}>
      <ComponentDesigner
        component={componentData?.component || undefined}
        projectId={projectId || ''}
        etag={componentData?.etag}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </Suspense>
  );
}
