import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'demo-app',
  plugins: [react()],
  server: { port: 3000, strictPort: true },
});
