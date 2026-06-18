import type { Config } from 'tailwindcss';

/**
 * Tailwind is configured as an optional utility layer on top of BSDC's external
 * CSS architecture. Core layout and design tokens live in src/styles/*.css.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1B4332',
        'primary-light': '#2D6A4F',
        'primary-lighter': '#40916C',
        accent: '#FFD60A',
        surface: '#FFFFFF',
        muted: '#F8F9FA'
      },
      fontFamily: {
        bangla: ['Hind Siliguri', 'system-ui', 'sans-serif'],
        english: ['Inter', 'system-ui', 'sans-serif']
      },
      screens: {
        us: '250px',
        xs: '320px',
        smm: '480px',
        lm: '600px',
        tp: '768px',
        tl: '1024px',
        desk: '1280px',
        lgdesk: '1920px',
        uw: '2560px',
        fourk: '3840px'
      }
    }
  },
  plugins: []
};

export default config;
