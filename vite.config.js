import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        editor: resolve(__dirname, 'editor.html'),
        demo: resolve(__dirname, 'demo.html')
      }
    }
  },
  server: {
    port: 3000,
    open: false
  }
});
