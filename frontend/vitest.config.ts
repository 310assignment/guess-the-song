import { defineConfig } from 'vitest/config';

// Vitest configuration: use jsdom environment for React component tests and
// provide a minimal Vite-style import.meta.env so frontend modules that read
// VITE_API_BASE_URL can run in tests.
export default defineConfig({
  test: {
    // Only look for tests under the repo's frontend/tests folder to avoid
    // running tests coming from node_modules or other unexpected locations.
    include: ['tests/**/*.test.*', 'tests/**/*.spec.*'],
    exclude: ['node_modules', 'dist', '**/tests/songService.test.*'],
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
  define: {
    // Provide a default for import.meta.env so modules that read it don't throw during tests
    'import.meta.env': {
      VITE_API_BASE_URL: 'http://localhost:3000'
    }
  }
});
