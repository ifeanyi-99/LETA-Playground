import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// LETA Playground — interactive product prototype (Phase 3).
// Composes the built @leta/* workspace packages (ESM dist). `resolve.dedupe`
// forces a single React copy across the pnpm workspace — without it the app
// can pull a second React from a package's own node_modules and throw the
// "invalid hook call" / duplicate-React error.
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5180,
  },
});
