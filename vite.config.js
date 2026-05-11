import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//
// `base` defaults to '/' (custom domain or username.github.io). For a
// GitHub Pages PROJECT page (username.github.io/repo-name/), set the
// BASE_PATH env var to '/repo-name/' before building, e.g.
//   BASE_PATH=/peak/ npm run build:gh-pages
// All asset URLs and the SPA route check (src/main.jsx) honor this.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
})
