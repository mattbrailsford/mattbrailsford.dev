// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: `https://mattbrailsford.dev`,
  build: {
    format: 'file'
  },
  vite: {
    css: {
      postcss: {
        plugins: [
          (await import('tailwindcss')).default,
          (await import('autoprefixer')).default,
        ],
      },
    },
  },
});