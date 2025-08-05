// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repo = '3D-Configurator-Website'   // <-- your repo name

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? `/${repo}/` : '/',  // dev: "/", prod: "/<repo>/"
}))
