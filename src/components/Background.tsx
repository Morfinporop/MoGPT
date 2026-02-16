import { useEffect, useRef } from 'react';
import { useThemeStore } from '../store/themeStore';

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  twinkleSpeed: number;
  offset: number;
}

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
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

      // Пересоздаём частицы
      const count = Math.floor((canvas.width * canvas.height) / 25000);
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.15 + 0.05,
        opacity: Math.random() * 0.5 + 0.1,
        twinkleSpeed: Math.random() * 1.5 + 0.5,
        offset: Math.random() * Math.PI * 2,
      }));
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);

    const animate = (timestamp: number) => {
      const t = timestamp * 0.001;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Два мягких градиентных пятна
      const blobs = [
        { x: w * 0.2, y: h * 0.3, r: 350, color: '139, 92, 246' },
        { x: w * 0.8, y: h * 0.7, r: 400, color: '99, 102, 241' },
      ];

      blobs.forEach((blob, i) => {
        const pulse = Math.sin(t * 0.2 + i * 2) * 0.15 + 0.85;
        const ox = Math.sin(t * 0.1 + i) * 30;
        const oy = Math.cos(t * 0.08 + i) * 20;

        const grad = ctx.createRadialGradient(
          blob.x + ox, blob.y + oy, 0,
          blob.x + ox, blob.y + oy, blob.r * pulse
        );
        grad.addColorStop(0, `rgba(${blob.color}, 0.06)`);
        grad.addColorStop(0.5, `rgba(${blob.color}, 0.02)`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      });

      // 2. Частицы-звёзды
      particlesRef.current.forEach((p) => {
        p.y -= p.speed;
        if (p.y < -5) {
          p.y = h + 5;
          p.x = Math.random() * w;
        }

        const twinkle = Math.sin(t * p.twinkleSpeed + p.offset) * 0.5 + 0.5;
        const alpha = p.opacity * (0.3 + twinkle * 0.7);

        // Реакция на мышь — мягкое свечение рядом
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const boost = dist < 150 ? (1 - dist / 150) * 0.5 : 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + boost * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 180, 255, ${alpha + boost})`;
        ctx.fill();
      });

      // 3. Курсорное свечение
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      if (mx > 0 && my > 0) {
        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, 120);
        glow.addColorStop(0, 'rgba(139, 92, 246, 0.04)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(mx - 120, my - 120, 240, 240);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
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
