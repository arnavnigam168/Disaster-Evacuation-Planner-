import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // allow serving files from the project root (parent) because some node_modules
    // are located one level up (workspace-level installs). This prevents Vite from
    // blocking requests to leaflet-draw sprites/images outside the frontend folder.
    fs: {
      allow: [path.resolve(__dirname), path.resolve(__dirname, '..')]
    }
  }
})
