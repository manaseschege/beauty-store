import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const ngrokHosts = ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.app', '.ngrok.io']

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // allowedHosts lets the dev server be shared through an ngrok tunnel.
  server: { port: 5173, allowedHosts: ngrokHosts },
  preview: { port: 4173, allowedHosts: ngrokHosts },
  build: {
    chunkSizeWarningLimit: 900,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'antd', test: /node_modules[\\/](antd|@ant-design|rc-|@rc-component)/ },
            { name: 'vendor', test: /node_modules/ },
          ],
        },
      },
    },
  },
})
