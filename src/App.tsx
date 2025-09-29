import { Outlet, Link } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen bg-background-secondary">
      <header className="bg-background border-b border-border shadow-auren">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="AurenWorks Logo" className="h-8 w-8" />
              <h1 className="text-2xl font-semibold text-foreground">
                AurenWorks Studio
              </h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link
                to="/"
                className="text-sm font-medium text-foreground-secondary hover:text-accent transition-colors"
              >
                Projects
              </Link>
              <Link
                to="/components/test-project"
                className="text-sm font-medium text-foreground-secondary hover:text-accent transition-colors"
              >
                Components
              </Link>
              <Link
                to="/records/test-component"
                className="text-sm font-medium text-foreground-secondary hover:text-accent transition-colors"
              >
                Records
              </Link>
              <Link
                to="/yaml-playground"
                className="text-sm font-medium text-foreground-secondary hover:text-accent transition-colors"
              >
                YAML Playground
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
