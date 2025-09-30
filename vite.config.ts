import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    globals: true,
  },
  define: {
    __TEST__: JSON.stringify(process.env.NODE_ENV === 'test'),
    global: 'globalThis',
  },
  resolve: {
    alias: {
      'monaco-editor':
        process.env.NODE_ENV === 'test'
          ? './src/__mocks__/monaco-editor.js'
          : 'monaco-editor',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          monaco: ['monaco-editor'],
        },
      },
    },
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['monaco-editor'],
  },
});
