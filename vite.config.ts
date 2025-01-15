const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react-swc');
const path = require('path');
const { componentTagger } = require('lovable-tagger');

module.exports = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: [
        'pdfjs-dist/legacy/build/pdf.worker.entry.js',
        'react-pdf/node_modules/pdfjs-dist/legacy/build/pdf.worker.entry.js'
      ],
      output: {
        manualChunks: {
          pdfjs: ['pdfjs-dist', 'react-pdf']
        }
      }
    },
  },
  optimizeDeps: {
    include: ['axios', 'pdfjs-dist', 'react-pdf']
  },
}));