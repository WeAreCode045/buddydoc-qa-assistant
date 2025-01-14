import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'lib': path.resolve(__dirname, './lib')
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      external: [],
    },
  },
  optimizeDeps: {
    include: ['react-pdf'],
  },
})