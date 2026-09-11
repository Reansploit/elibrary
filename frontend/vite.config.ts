import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' agar hasil build statis bisa langsung dibungkus Tauri+Rust nanti
// tanpa rewrite (Tauri butuh path relatif).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
})
