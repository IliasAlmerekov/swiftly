import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('react-router')) return 'router';
          if (id.includes('react-dom') || id.includes('react')) return 'react';
          if (id.includes('recharts')) return 'charts';
          if (id.includes('@dnd-kit')) return 'dnd';
          if (id.includes('@tanstack')) return 'tanstack';
          if (id.includes('@radix-ui')) return 'radix';
          if (id.includes('cloudinary')) return 'cloudinary';

          // fallback: group other vendor code
          return 'vendor';
        },
      },
    },
  },
});
