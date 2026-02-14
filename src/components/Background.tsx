import { useThemeStore } from '../store/themeStore';

export function Background() {
  const { theme } = useThemeStore();

  if (theme === 'light') return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.02) 0%, transparent 60%)',
      }}
    />
  );
}
