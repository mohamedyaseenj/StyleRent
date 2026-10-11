import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  // GitHub Pages serves the app under /StyleRent/; Render and local
  // preview serve it at the domain root, so keep '/' there.
  base: process.env.GITHUB_ACTIONS ? '/StyleRent/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})