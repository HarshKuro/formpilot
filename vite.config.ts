import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        options: resolve(__dirname, 'options.html'),
        'background/service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
        'content/index': resolve(__dirname, 'src/content/index.ts')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background/service-worker') {
            return 'background/service-worker.js';
          }
          if (chunkInfo.name === 'content/index') {
            return 'content/index.js';
          }
          return '[name].js';
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});
