import { useParams } from 'react-router-dom';
import ComponentsPage from './ComponentsPage';

export default function ComponentsRoute() {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return <div className="text-red-600">Project ID is required</div>;
  }

  return <ComponentsPage projectId={projectId} />;
}
