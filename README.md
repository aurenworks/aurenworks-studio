# aurenworks-studio

> Builder Studio for the AurenWorks platform. Developers design Projects and Components, define/edit YAML, and publish to the runtime Portal.

## Tech decision (UI framework)

We will use React + Vite + TypeScript with Tailwind + shadcn/ui (Radix primitives).

- Why React/Vite? Fast DX, huge ecosystem, first-class support for Monaco (YAML editor), TanStack Query/Table, and excellent lib support.
- Why shadcn/ui + Tailwind? Accessible primitives (Radix) with utility-first styling and quick customization.
- Key libs
  - Data fetching/state: @tanstack/react-query
  - Tables/virtualization: @tanstack/react-table + @tanstack/react-virtual
  - Forms & validation: react-hook-form + zod
  - YAML editor: monaco-editor (yaml mode)
  - Icons: lucide-react
  - API client: openapi-typescript (types) + openapi-fetch (or published @aurenworks/client when available)

If we later need SSR/app router or auth pages out-of-the-box, we can consider Next.js with the same component stack. For now, Vite keeps the Studio lightweight and fast.

---

## Getting started

### Prereqs

- Node 18+ and pnpm (or npm/yarn)
- AurenWorks API running locally (see aurenworks-infra compose or your local API)
- OpenAPI spec from aurenworks-schemas/openapi/openapi.yaml

### Development without Backend

The application includes mock data for development when no backend is available:

- **Projects Page**: Shows sample projects with mock data
- **Components Page**: Will show mock components (when implemented)
- **Records Page**: Will show mock records (when implemented)

To use with a real backend:

1. Set `VITE_API_BASE_URL` environment variable (e.g., `http://localhost:8080`)
2. Set authentication token in browser: `localStorage.setItem('auth_token', 'your-token')`

### Create the project

```bash
pnpm create vite@latest aurenworks-studio --template react-ts
cd aurenworks-studio
pnpm add @tanstack/react-query @tanstack/react-table @tanstack/react-virtual react-hook-form zod lucide-react openapi-fetch
pnpm add -D tailwindcss postcss autoprefixer @types/node openapi-typescript
npx tailwindcss init -p
```

Enable Tailwind in index.css:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### (Temp) generate the OpenAPI client types

Until the package is published, generate types locally from the schemas repo:

```bash
pnpm openapi-typescript ../aurenworks-schemas/openapi/openapi.yaml -o src/lib/api/types.ts
```

Set up a tiny client wrapper:

```ts
// src/lib/api/client.ts
import createClient from 'openapi-fetch';
import type { paths } from './types';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
export const client = createClient<paths>({ baseUrl });

export function authHeader() {
  const t = localStorage.getItem('auth_token') ?? '';
  return t ? { Authorization: `Bearer ${t}` } : {};
}
```

### Env

Create .env.local:

```
VITE_API_BASE_URL=http://localhost:3000
```

### Scripts (package.json)

```jsonc
{
  "scripts": {
    "client:gen": "openapi-typescript ../aurenworks-schemas/openapi/openapi.yaml -o src/lib/api/types.ts",
    "dev": "pnpm client:gen && vite",
    "build": "pnpm client:gen && vite build",
    "preview": "vite preview",
    "test": "vitest run",
  },
}
```

---

## Project structure (suggested)

```
src/
  app/                # routes/layout
  components/         # reusable UI
  features/
    projects/         # list/create projects
    components/       # component designer + YAML
    records/          # grid for records
  lib/
    api/              # client.ts, types.ts (generated)
    hooks/            # shared hooks
    utils/            # helpers (schema->ui mapping, formatters)
  styles/
public/
```

---

## Conventions

- TypeScript only. No any; use zod or generated types for inputs.
- Server state via React Query; keep global state minimal (Zustand optional).
- Forms via RHF + zod resolver; display inline errors.
- Tables via TanStack Table + virtualization for large sets.
- Accessibility: use Radix primitives; ensure focus management and keyboard nav.
- Testing: Vitest + React Testing Library for pages and hooks.
- Commits: Conventional Commits (feat:, fix:, chore:).

---

## YAML Editor

The studio includes a Monaco-based YAML editor with schema validation:

### Usage

```tsx
import { YamlEditor } from './components/YamlEditor';

<YamlEditor
  value={yamlContent}
  onChange={setYamlContent}
  schema={componentSchema} // Optional: JSON schema object or URL
  readOnly={false}
  height="400px"
  className="border rounded"
/>;
```

### Features

- **Syntax Highlighting**: YAML syntax highlighting with proper color coding
- **Schema Validation**: Real-time validation against JSON schema
- **Auto-completion**: Intelligent code completion and suggestions
- **Error Highlighting**: Inline error markers and diagnostics
- **Formatting**: Auto-format YAML content on paste and type
- **Accessibility**: Keyboard navigation and screen reader support

### Demo

Visit `/yaml-playground` to see the editor in action with a sample component schema.

## Pre-commit Hooks

This project includes a pre-commit hook that automatically runs linting, format checking, and type checking before each commit to ensure code quality.

### Setup

To enable the pre-commit hook, run:

```bash
# Using npm script (recommended)
pnpm pre-commit:setup

# Or manually
cp scripts/pre-commit.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### What it checks

The pre-commit hook runs the following checks:

1. **TypeScript type checking** (`pnpm type-check`)
2. **Code formatting** (`pnpm format:check`)
3. **ESLint linting** (`pnpm lint`)

If any check fails, the commit will be blocked until the issues are resolved.

### Manual checks

You can run these checks manually:

```bash
# Run all checks (same as pre-commit hook)
pnpm pre-commit:check

# Or run individual checks
pnpm type-check
pnpm format:check
pnpm lint

# Fix formatting issues
pnpm format

# Fix linting issues (auto-fixable ones)
pnpm lint:fix
```

## Roadmap (early)

- Integrate generated TS client (Issue #14)
- Projects list + create modal
- Component designer (fields + YAML toggle)
- Records grid (list/create/edit)
- Publish-to-Portal action
