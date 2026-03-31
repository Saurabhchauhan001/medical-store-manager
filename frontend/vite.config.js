import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const backendPort = env.VITE_BACKEND_PORT || '5050'
  const backendTarget = env.VITE_BACKEND_TARGET || `http://127.0.0.1:${backendPort}`

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': backendTarget,
      },
    },
  }
})
