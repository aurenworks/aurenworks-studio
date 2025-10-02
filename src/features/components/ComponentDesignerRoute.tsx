import { useParams, useNavigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import type { components } from '../../lib/api/types';

// Lazy load ComponentDesigner to avoid Monaco editor import during tests
const ComponentDesigner = lazy(() => import('./ComponentDesigner'));

type Component = components['schemas']['Component'];

export default function ComponentDesignerRoute() {
  const { id, projectId } = useParams<{ id?: string; projectId: string }>();
  const navigate = useNavigate();

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

  return (
    <Suspense fallback={<div>Loading component designer...</div>}>
      <ComponentDesigner
        component={id ? ({ id } as Component) : undefined}
        projectId={projectId || ''}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </Suspense>
  );
}
