import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      template: 'treemap', // or sunburst
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],
  build: {
    target: 'esnext',
    minify: 'terser',
    cssMinify: true,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': [
            '@/components/ui',
            '@radix-ui/react-dialog',
            '@radix-ui/react-slot',
            'class-variance-authority',
            'clsx',
            'tailwind-merge'
          ],
          'landing-core': [
            '@/components/landingpage/Header',
            '@/components/landingpage/Hero',
          ],
          'landing-features': [
            '@/components/landingpage/Features',
            '@/components/landingpage/ReadyToStart',
          ],
          'landing-talent': [
            '@/components/landingpage/TalentPool',
            '@/components/landingpage/HowItWorks',
            '@/components/landingpage/Stats',
          ],
          'landing-conversion': [
            '@/components/landingpage/Testimonials',
            '@/components/landingpage/CtA',
          ],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});