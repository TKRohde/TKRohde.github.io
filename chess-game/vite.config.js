import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: '/TKRohde.github.io/',  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})