import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { componentTagger } from "lovable-tagger"

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'lib': path.resolve(__dirname, './lib')
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      external: [
        'openai',
        '@radix-ui/react-scroll-area',
        'axios'
      ],
    },
  },
  optimizeDeps: {
    include: [
      'react-pdf',
      'openai',
      '@radix-ui/react-scroll-area',
      'axios'
    ],
  },
}))