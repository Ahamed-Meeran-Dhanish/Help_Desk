import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { // Any request starting with /api
        target: 'http://localhost:5000', // Proxy it to your backend server
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false, // For local development with http
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Rewrite path if needed, here just keeping it
      },
    },
  },
});
