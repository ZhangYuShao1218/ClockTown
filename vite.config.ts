import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // 監聽 0.0.0.0，讓同一區網（同 Wi-Fi）的手機可用「電腦區網 IP:5173」連入
  server: {
    host: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'mobx',
      'mobx-react-lite',
      'framer-motion',
      'overlayscrollbars',
      'markdown-it',
    ],
  },
})
