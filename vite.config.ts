import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves under /MASLUL/; Vercel serves from the root.
  base: process.env.VERCEL ? '/' : '/MASLUL/',
})
