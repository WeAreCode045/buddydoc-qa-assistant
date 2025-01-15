import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
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
    sourcemap: true,
    rollupOptions: {
      external: ['pdfjs-dist/build/pdf.worker.entry'],
      output: {
        manualChunks: {
          pdfjs: ['pdfjs-dist']
        }
      }
    },
  },
  optimizeDeps: {
    include: ['axios', 'pdfjs-dist']
  },
}));