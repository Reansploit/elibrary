import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  /** Hasil efektif setelah mempertimbangkan system. */
  dark: boolean;
  setMode: (m: ThemeMode) => void;
  /** Hitung ulang dari system (dipanggil saat mount + saat OS berganti tema). */
  sync: () => void;
}

function prefersDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function apply(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark);
}

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      dark: prefersDark(),
      setMode: (mode) => {
        const dark = mode === 'dark' || (mode === 'system' && prefersDark());
        apply(dark);
        set({ mode, dark });
      },
      sync: () => {
        const { mode } = get();
        const dark = mode === 'dark' || (mode === 'system' && prefersDark());
        apply(dark);
        set({ dark });
      },
    }),
    { name: 'elib_theme' },
  ),
);
