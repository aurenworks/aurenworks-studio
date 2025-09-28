import { Link } from "react-router-dom";
import ProjectsPage from "./features/projects/ProjectsPage";
export default function App() {
  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">AurenWorks Studio</h1>
        <nav className="text-sm opacity-80">
          <Link to="/">Home</Link>
        </nav>
      </header>
      <main className="space-y-8">
        <section>
          <h2 className="text-xl font-medium">Projects</h2>
          <ProjectsPage />
        </section>
      </main>
    </div>
  );
}
