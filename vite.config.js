import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://ec2-3-82-206-23.compute-1.amazonaws.com:8000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '/api/v1')
            }
        }
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                sw: resolve(__dirname, 'public/service-worker.js')
            }
        }
    },
    optimizeDeps: {
        include: ['react', 'react-dom']
    }
})