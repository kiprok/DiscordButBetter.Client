import { fileURLToPath, URL } from 'node:url';
import basicSsl from '@vitejs/plugin-basic-ssl';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    basicSsl({
      name: 'test',
      certDir: './certs',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    https: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        secure: false,
      },
      '/hub':{
        target: 'http://localhost:3000',
        secure: false,
        ws: true,
      }
    },
  },
});
