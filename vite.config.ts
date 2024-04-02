import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/threejs_on_worker/',
  resolve: {
    alias: {
      'R': resolve(__dirname, './src')
    }
  },
  server: {
    host: true,
  },
  worker: {
    format: 'es'
  },
  build: {
    outDir: 'docs'
  }
})
