import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import ProjectsPage from './features/projects/ProjectsPage';
import ComponentsRoute from './features/components/ComponentsRoute';
import RecordsRoute from './features/records/RecordsRoute';
import YamlPlayground from './features/components/YamlPlayground';
import './index.css';

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
        path: 'components/:projectId',
        element: <ComponentsRoute />,
      },
      {
        path: 'records/:componentId',
        element: <RecordsRoute />,
      },
      {
        path: 'yaml-playground',
        element: <YamlPlayground />,
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
