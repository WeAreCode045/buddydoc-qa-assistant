import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }: { mode: string }) => ({
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