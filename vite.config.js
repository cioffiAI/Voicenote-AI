// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load .env file variables based on the current mode (development, production)
  // The third argument '' means to load all variables without a VITE_ prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // This makes process.env.API_KEY available in your client-side code
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});