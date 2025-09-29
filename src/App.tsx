import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProjectsPage from './features/projects/ProjectsPage';
import ComponentsRoute from './features/components/ComponentsRoute';

export default function App() {
  return (
    <Router>
      <div className="p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">AurenWorks Studio</h1>
          <nav className="text-sm opacity-80 space-x-4">
            <Link to="/" className="hover:underline">
              Projects
            </Link>
            <Link to="/components/test-project" className="hover:underline">
              Components
            </Link>
          </nav>
        </header>
        <main className="space-y-8">
          <Routes>
            <Route
              path="/"
              element={
                <section>
                  <h2 className="text-xl font-medium">Projects</h2>
                  <ProjectsPage />
                </section>
              }
            />
            <Route
              path="/components/:projectId"
              element={
                <section>
                  <h2 className="text-xl font-medium">Components</h2>
                  <ComponentsRoute />
                </section>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
