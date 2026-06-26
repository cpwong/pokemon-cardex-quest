import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Served from https://cpwong.github.io/pokemon-cardex-quest/, so assets must
  // be referenced under that sub-path (default "/" would 404 on Pages).
  base: '/pokemon-cardex-quest/',
})
