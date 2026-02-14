import { useEffect, useRef } from 'react';
import { useThemeStore } from '../store/themeStore';

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === 'light') {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.001;

      const glowPoints = [
        { x: canvas.width * 0.1, y: canvas.height * 0.2, size: 350, color: '139, 92, 246' },
        { x: canvas.width * 0.9, y: canvas.height * 0.7, size: 400, color: '168, 85, 247' },
        { x: canvas.width * 0.5, y: canvas.height * 0.9, size: 350, color: '99, 102, 241' },
        { x: canvas.width * 0.25, y: canvas.height * 0.75, size: 280, color: '192, 132, 252' },
        { x: canvas.width * 0.75, y: canvas.height * 0.15, size: 260, color: '129, 140, 248' },
        { x: canvas.width * 0.5, y: canvas.height * 0.4, size: 320, color: '139, 92, 246' },
      ];

      glowPoints.forEach((point, i) => {
        const pulse = Math.sin(time * 0.2 + i * 0.5) * 0.3 + 0.7;
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, point.size * pulse
        );
        gradient.addColorStop(0, `rgba(${point.color}, 0.08)`);
        gradient.addColorStop(0.4, `rgba(${point.color}, 0.04)`);
        gradient.addColorStop(0.7, `rgba(${point.color}, 0.01)`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
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
