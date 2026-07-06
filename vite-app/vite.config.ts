import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { devServerPlugin } from './src/plugins/devServerPlugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Example usage of the dev server plugin
    // devServerPlugin({
    //   entryPoint: 'src/main.tsx',
    //   port: 3000,
    //   host: 'localhost',
    //   open: true
    // })
  ],
})
