/**
 * vite.config.js
 * ---------------------------------------------------------------------------
 * Build configuration for the BSDC web application.
 *
 * WHY this exists:
 *  - We use Vite (fast bundler) with React 18 for a snappy SPA build.
 *  - We split heavy vendor dependencies (Firebase, React) into their own
 *    chunks so the browser caches them aggressively and the first contentful
 *    paint stays fast even on slow Bangladeshi mobile networks.
 *  - The SEO problem of "blank HTML" is solved at build-time via:
 *      (a) Pre-rendered meta tags injected in index.html (default crawl info)
 *      (b) react-helmet-async overriding meta on the client per page
 *      (c) generate-sitemap.js + generate-rss.js running BEFORE vite build
 *  - We DO NOT use Cloudflare Workers. Cloudflare Pages serves the static
 *    output (`dist/`) directly. SPA fallback is handled by public/_redirects.
 *
 * NOTE: This file intentionally avoids any plugin that requires CLI work
 * on the developer's machine. Everything runs on GitHub Actions.
 * ---------------------------------------------------------------------------
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // React 18 plugin gives us Fast Refresh in dev and automatic JSX runtime.
  plugins: [react()],

  // Path aliases — keeps imports clean and refactor-safe.
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@hooks': '/src/hooks',
      '@utils': '/src/utils',
      '@firebase': '/src/firebase',
      '@styles': '/src/styles',
      '@context': '/src/context',
      '@pages': '/src/pages',
      '@admin': '/src/admin'
    }
  },

  // Local dev server settings (not used in production).
  server: {
    port: 5173,
    host: true,
    open: false
  },

  // Production build settings.
  build: {
    outDir: 'dist',
    sourcemap: false,        // No source maps in prod (smaller bundle, hides logic).
    cssCodeSplit: true,      // Split CSS per route for faster initial load.
    minify: 'esbuild',       // Fastest minifier.
    target: 'es2020',        // Modern browsers — Bangladesh's market is mostly modern Android Chrome.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunks: split big libs so first paint isn't blocked by them.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/database'
          ],
          'seo-vendor': ['react-helmet-async'],
          'syntax-vendor': ['react-syntax-highlighter'],
          'qr-vendor': ['qrcode']
        }
      }
    }
  },

  // Tell Vite which env vars are exposed to the client.
  // ALL Firebase / ImgBB / Cloudinary keys live in VITE_* env vars.
  envPrefix: 'VITE_'
});
