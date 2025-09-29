import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Monaco Editor
vi.mock('monaco-editor', () => ({
  editor: {
    create: vi.fn(() => ({
      onDidChangeModelContent: vi.fn(),
      getValue: vi.fn(() => ''),
      setValue: vi.fn(),
      updateOptions: vi.fn(),
      dispose: vi.fn(),
    })),
  },
  languages: {
    yaml: {
      yamlDefaults: {
        setDiagnosticsOptions: vi.fn(),
      },
    },
  },
}));
