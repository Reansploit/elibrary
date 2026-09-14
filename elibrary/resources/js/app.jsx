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
    const show = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setVisible(true), 200);
    };
    const hide = () => {
      clearTimeout(timer);
      setVisible(false);
    };
    const offStart = router.on('start', show);
    const offFinish = router.on('finish', hide);
    const offNavigate = router.on('navigate', hide);
    return () => {
      clearTimeout(timer);
      offStart();
      offFinish();
      offNavigate();
    };
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[2px] transition-opacity duration-200',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-8 py-6 shadow-xl">
        <Swirling className="h-10 w-10 text-primary" />
        <span className="text-sm text-muted-foreground">Memuat…</span>
      </div>
    </div>
  );
}

const defaultName = import.meta.env.VITE_APP_NAME || 'E-Library';
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
