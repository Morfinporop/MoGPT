import { useThemeStore } from '../store/themeStore';

export function Background() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Orb 1 — top left */}
      <div
        className="bg-orb absolute rounded-full"
        style={{
          width: '45vw',
          maxWidth: '500px',
          aspectRatio: '1',
          top: '-8%',
          left: '-5%',
          background: isDark
            ? 'radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 65%)'
            : 'radial-gradient(circle, rgba(0,0,0,0.018) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />
      {/* Orb 2 — right center */}
      <div
        className="bg-orb absolute rounded-full"
        style={{
          width: '40vw',
          maxWidth: '450px',
          aspectRatio: '1',
          top: '40%',
          right: '-8%',
          background: isDark
            ? 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 65%)'
            : 'radial-gradient(circle, rgba(0,0,0,0.015) 0%, transparent 65%)',
          filter: 'blur(90px)',
        }}
      />
      {/* Orb 3 — bottom */}
      <div
        className="bg-orb absolute rounded-full"
        style={{
          width: '50vw',
          maxWidth: '550px',
          aspectRatio: '1',
          bottom: '-10%',
          left: '20%',
          background: isDark
            ? 'radial-gradient(circle, rgba(255,255,255,0.015) 0%, transparent 65%)'
            : 'radial-gradient(circle, rgba(0,0,0,0.012) 0%, transparent 65%)',
          filter: 'blur(100px)',
        }}
      />
    </div>
  );
}
