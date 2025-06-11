import { defineConfig } from 'vite'

export default defineConfig({
  css: {
    postcss: true
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
