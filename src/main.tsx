import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useTheme } from './store/theme.ts'

// Sinkronkan class .dark dari preferensi tersimpan SEBELUM render (anti kedip).
useTheme.getState().sync();
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    useTheme.getState().sync();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
