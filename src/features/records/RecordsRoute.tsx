import { useParams } from 'react-router-dom';
import RecordsPage from './RecordsPage';

export default function RecordsRoute() {
  const { componentId } = useParams<{ componentId: string }>();

  if (!componentId) {
    return <div className="text-red-600">Component ID is required</div>;
  }

  return <RecordsPage componentId={componentId} />;
}
