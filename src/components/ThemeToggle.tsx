import { useTheme, type ThemeMode } from '../store/theme';

const order: ThemeMode[] = ['system', 'light', 'dark'];
const icon: Record<ThemeMode, string> = { system: '🖥', light: '☀', dark: '🌙' };
const label: Record<ThemeMode, string> = {
  system: 'Auto (ikuti sistem)',
  light: 'Mode terang',
  dark: 'Mode gelap',
};

/** Toggle 3-state: sistem → terang → gelap. Pilihan tersimpan (persist). */
export default function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const next = () => setMode(order[(order.indexOf(mode) + 1) % order.length]);
  return (
    <button
      onClick={next}
      title={`Tema: ${label[mode]} (klik untuk ganti)`}
      className="grid h-8 w-8 place-items-center rounded-full text-base hover:bg-surface-2"
    >
      {icon[mode]}
    </button>
  );
}
