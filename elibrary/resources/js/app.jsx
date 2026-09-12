import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

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
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    );
  },
  progress: {
    color: '#EA580C',
  },
});
