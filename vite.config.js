// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
    base: '/auto-slideshow/',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                player: resolve(__dirname, 'player.html'),
            },
        },
        target: 'es2020',
        outDir: 'auto-slideshow'
    },
    plugins: [
        basicSsl()
      ]
})

