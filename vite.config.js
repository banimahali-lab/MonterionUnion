import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    // Vercel handles the root path automatically
    base: '/',
    define: {
        // This PREVENTS the blank screen crash on Vercel/VPS
        '__DEFINES__': {},
        '__HMR_CONFIG_NAME__': '""',
        'process.env': {}
    },
    build: {
        target: 'esnext',
        minify: false
    }
})