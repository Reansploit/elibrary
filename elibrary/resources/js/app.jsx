import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Swirling } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

// Pil loading global: muncul tiap pindah halaman / login / submit,
// dengan jeda biar tidak kedip di navigasi yang cepat.
function PageLoader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer = null;
    let failsafe = null;
    const show = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setVisible(true);
        // Failsafe: jangan pernah macet tampil atau blokir selamanya.
        clearTimeout(failsafe);
        failsafe = setTimeout(() => setVisible(false), 10000);
      }, 200);
    };
    const hide = () => {
      clearTimeout(timer);
      clearTimeout(failsafe);
      setVisible(false);
    };
    const offStart = router.on('start', show);
    const offFinish = router.on('finish', hide);
    const offNavigate = router.on('navigate', hide);
    return () => {
      clearTimeout(timer);
      clearTimeout(failsafe);
      offStart();
      offFinish();
      offNavigate();
    };
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        // Selalu tembus klik: loader murni visual, tidak boleh mengunci input.
        'pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[2px] transition-opacity duration-200',
        visible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <Swirling className="h-20 w-20 text-primary" style={{ '--duration': '1.2s' }} />
    </div>
  );
}

const defaultName = import.meta.env.VITE_APP_NAME || 'Perpustakaan WBS';
let libraryName = defaultName;

createInertiaApp({
  title: (title) => `${title} - ${libraryName}`,
  resolve: (name) =>
    resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
  setup({ el, App, props }) {
    libraryName = props.initialPage.props.libraryName || defaultName;
    const root = createRoot(el);

    root.render(
      <ThemeProvider>
        <App {...props} />
        <PageLoader />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    );
  },
  progress: {
    color: '#EA580C',
  },
});
