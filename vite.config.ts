import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative asset paths: the build works at a domain root and under a sub-path (e.g. GitHub Pages).
  base: './',
})
