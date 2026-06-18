/**
 * PostCSS pipeline used by Vite and Cloudflare Pages builds.
 * Tailwind processes optional utility classes while Autoprefixer guarantees
 * broad browser support for the responsive external CSS files.
 */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
