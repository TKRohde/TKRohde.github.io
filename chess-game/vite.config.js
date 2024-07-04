import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: '/chess-game/',
  build: {
    outDir: '../chess-game'
  }
})