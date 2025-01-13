import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
    envPrefix: 'VITE_',
    build: {
      sourcemap: true,
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            map: ['leaflet', 'react-leaflet']
          }
        }
      }
    }
  }

  if (command === 'build') {
    config.build = {
      ...config.build,
      chunkSizeWarningLimit: 1000
    }
  }

  return config
})