import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/content/index.ts'),
      name: 'FormPilotContentScript',
      formats: ['iife'],
      fileName: () => 'content/index.js'
    },
    rollupOptions: {
      output: {
        extend: true
      }
    }
  }
});
