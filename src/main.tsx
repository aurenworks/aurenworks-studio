import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import ProjectsPage from './features/projects/ProjectsPage';
import ComponentsRoute from './features/components/ComponentsRoute';
import ComponentDesignerRoute from './features/components/ComponentDesignerRoute';
import RecordsRoute from './features/records/RecordsRoute';
import './index.css';

// Lazy load YamlPlayground to avoid Monaco editor import during tests
const YamlPlayground = lazy(
  () => import('./features/components/YamlPlayground')
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <ProjectsPage />,
      },
      {
        path: 'projects/:projectId/components',
        element: <ComponentsRoute />,
      },
      {
        path: 'components/:id',
        element: <ComponentDesignerRoute />,
      },
      {
        path: 'projects/:projectId/components/new',
        element: <ComponentDesignerRoute />,
      },
      {
        path: 'records/:componentId',
        element: <RecordsRoute />,
      },
      {
        path: 'yaml-playground',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <YamlPlayground />
          </Suspense>
        ),
      },
    ],
  },
]);

const client = new QueryClient();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
