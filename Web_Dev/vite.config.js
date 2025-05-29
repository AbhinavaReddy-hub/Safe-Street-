import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import os from 'os'

const getLocalIp = () => {
  const interfaces = os.networkInterfaces()
  for (const ifaceName in interfaces) {
    const iface = interfaces[ifaceName]
    for (const item of iface) {
      if (item.family === 'IPv4' && !item.internal) {
        return item.address
      }
    }
  }
  return 'localhost'
}

const localIp = getLocalIp()

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    LOCAL_IP: JSON.stringify(localIp),
  },
  server: {
    historyApiFallback: false,
  },
})
