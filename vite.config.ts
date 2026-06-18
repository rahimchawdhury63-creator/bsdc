import { defineConfig, loadEnv, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

/**
 * Vite configuration for BSDC.
 *
 * The configuration is intentionally static-hosting friendly because the site is
 * deployed to Cloudflare Pages free tier. Firebase Cloud Functions provide the
 * dynamic SEO/RSS/sitemap layer while this Vite app remains a fast static PWA.
 */
export default defineConfig(({ mode }): UserConfig => {
  /** Load VITE_* variables so build-time constants are available to plugins. */
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [
      /** React plugin enables React Fast Refresh and production JSX transforms. */
      react(),

      /**
       * PWA plugin injects Workbox registration into the app shell while keeping
       * the hand-written public/sw.js available for offline fallback control.
       */
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'offline.html'],
        manifest: false,
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/firestore\.googleapis\.com\//i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'bsdc-firestore-api',
                networkTimeoutSeconds: 6,
                expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 }
              }
            },
            {
              urlPattern: /^https:\/\/(i\.ibb\.co|res\.cloudinary\.com)\//i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'bsdc-image-cdn',
                expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 }
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@config': path.resolve(__dirname, './src/config'),
        '@components': path.resolve(__dirname, './src/components'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@types': path.resolve(__dirname, './src/types'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@pages': path.resolve(__dirname, './src/pages')
      }
    },
    define: {
      /** Gives the UI a safe build timestamp without needing server rendering. */
      __BSDC_BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      /** Exposes the canonical URL to static meta utilities during build. */
      __BSDC_SITE_URL__: JSON.stringify(env.VITE_SITE_URL || 'https://www.bsdc.info.bd')
    },
    build: {
      target: 'es2022',
      sourcemap: true,
      cssCodeSplit: true,
      assetsInlineLimit: 2048,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/database', 'firebase/analytics'],
            seo: ['react-helmet-async'],
            forms: ['react-hook-form', 'zod', '@hookform/resolvers'],
            state: ['zustand', '@tanstack/react-query']
          }
        }
      }
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      strictPort: true
    }
  };
});
