import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared/dist'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@store': path.resolve(__dirname, 'src/store'),
    },
  },
  server: {
    fs: {
      allow: [
        // 프로젝트 루트(자동) + shared 상위 폴더
        path.resolve(__dirname, '..')  // 또는 '../shared' 만 지정해도 됨
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
