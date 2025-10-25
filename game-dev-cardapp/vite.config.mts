import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import path from 'path'

export default defineConfig(
{
  base: './', // 👈 önemli
  resolve: 
  {
    alias: {
      '@': path.resolve(__dirname, './src'), // 👈 alias tanımı burada
    },
  },
  plugins: [react(), viteSingleFile()],
  build: {
    assetsInlineLimit: 100000000, // 100MB (tüm asset'leri inline et)
  },
})


