import { useEffect, useRef } from 'react';
import { useThemeStore } from '../store/themeStore';

interface Particle {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  twinkleSpeed: number;
  offset: number;
  driftX: number;
  driftY: number;
}

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === 'light') {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const count = Math.floor((canvas.width * canvas.height) / 18000);

      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.8 + 0.3,
        baseOpacity: Math.random() * 0.4 + 0.1,
        twinkleSpeed: Math.random() * 1.2 + 0.3,
        offset: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 0.08,
        driftY: -(Math.random() * 0.12 + 0.02),
      }));
    };

    resize();
    window.addEventListener('resize', resize);

    const blobs = [
      { xRatio: 0.15, yRatio: 0.25, radius: 380, color: '139, 92, 246', phaseX: 0, phaseY: 0.5 },
      { xRatio: 0.82, yRatio: 0.7, radius: 420, color: '99, 102, 241', phaseX: 2, phaseY: 1.5 },
      { xRatio: 0.5, yRatio: 0.85, radius: 300, color: '168, 85, 247', phaseX: 4, phaseY: 3 },
    ];

    const animate = (timestamp: number) => {
      const t = timestamp * 0.001;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Градиентные пятна
      blobs.forEach((blob) => {
        const pulse = Math.sin(t * 0.15 + blob.phaseX) * 0.12 + 0.88;
        const cx = blob.xRatio * w + Math.sin(t * 0.06 + blob.phaseX) * 40;
        const cy = blob.yRatio * h + Math.cos(t * 0.05 + blob.phaseY) * 30;
        const r = blob.radius * pulse;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, `rgba(${blob.color}, 0.055)`);
        grad.addColorStop(0.4, `rgba(${blob.color}, 0.025)`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Частицы
      particlesRef.current.forEach((p) => {
        p.x += p.driftX;
        p.y += p.driftY;

        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
        if (p.x < -5) p.x = w + 5;
        if (p.x > w + 5) p.x = -5;

        const twinkle = Math.sin(t * p.twinkleSpeed + p.offset);
        const alpha = p.baseOpacity * (0.4 + (twinkle * 0.5 + 0.5) * 0.6);

        // Мягкое гало
        if (p.size > 1) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          glow.addColorStop(0, `rgba(180, 160, 255, ${alpha * 0.25})`);
          glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Точка
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210, 200, 255, ${alpha})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [theme]);

  if (theme === 'light') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
