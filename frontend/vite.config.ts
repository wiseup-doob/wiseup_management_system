import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('../shared/dist', import.meta.url)),
      '@config': fileURLToPath(new URL('./src/config', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@store': fileURLToPath(new URL('./src/store', import.meta.url)),
    },
  },
  server: {
    fs: {
      allow: [
        // 프로젝트 루트(자동) + shared 상위 폴더
        fileURLToPath(new URL('..', import.meta.url))  // 또는 '../shared' 만 지정해도 됨
      ]
    }
  },
  optimizeDeps: {
    include: ['../shared/dist/**/*']
  },
  build: {
    commonjsOptions: {
      include: [/shared/, /node_modules/]
    }
  }
})
