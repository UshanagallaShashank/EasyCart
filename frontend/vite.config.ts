import path from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // A production build without the backend address would produce an app that calls "undefined/api", so stop early.
  if (mode === 'production') {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    if (!env.VITE_API_BASE_URL) {
      throw new Error('VITE_API_BASE_URL is not set. Set it to your backend address, e.g. https://api.example.com');
    }
    if (env.VITE_API_BASE_URL.includes('localhost')) {
      console.warn(`\nWarning: VITE_API_BASE_URL points to ${env.VITE_API_BASE_URL}. Visitors' browsers cannot reach your localhost.\n`);
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src')
      }
    }
  };
});
