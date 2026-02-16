// src/components/Background.tsx

import { useEffect, useRef } from 'react';
import { useThemeStore } from '../store/themeStore';
import { useMoodStore, MOOD_CONFIGS } from '../store/moodStore';
import type { Mood } from '../store/moodStore';

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

// Плавная интерполяция цвета "r, g, b"
function lerpColor(a: string, b: string, t: number): string {
  const pa = a.split(',').map(Number);
  const pb = b.split(',').map(Number);
  return pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(', ');
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function getMoodConfig(
  prevMood: Mood,
  currentMood: Mood,
  progress: number
) {
  const from = MOOD_CONFIGS[prevMood];
  const to = MOOD_CONFIGS[currentMood];
  const t = easeInOutCubic(progress);

  return {
    colors: [
      lerpColor(from.colors[0], to.colors[0], t),
      lerpColor(from.colors[1], to.colors[1], t),
      lerpColor(from.colors[2], to.colors[2], t),
    ] as [string, string, string],
    pulseSpeed: lerp(from.pulseSpeed, to.pulseSpeed, t),
    intensity: lerp(from.intensity, to.intensity, t),
    size: lerp(from.size, to.size, t),
    breatheSpeed: lerp(from.breatheSpeed, to.breatheSpeed, t),
  };
}

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const lastFrameRef = useRef<number>(0);
  const { theme } = useThemeStore();

  // Подписка на mood store через ref для производительности
  const moodStateRef = useRef({
    mood: 'neutral' as Mood,
    previousMood: 'neutral' as Mood,
    transitionProgress: 1,
    isTransitioning: false,
  });

  useEffect(() => {
    const unsub = useMoodStore.subscribe((state) => {
      moodStateRef.current = {
        mood: state.mood,
        previousMood: state.previousMood,
        transitionProgress: state.transitionProgress,
        isTransitioning: state.isTransitioning,
      };
    });
    return unsub;
  }, []);

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

      const count = Math.floor((canvas.width * canvas.height) / 20000);
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.3,
        baseOpacity: Math.random() * 0.35 + 0.08,
        twinkleSpeed: Math.random() * 1.2 + 0.3,
        offset: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 0.06,
        driftY: -(Math.random() * 0.1 + 0.01),
      }));
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = (timestamp: number) => {
      const delta = lastFrameRef.current ? (timestamp - lastFrameRef.current) / 1000 : 0.016;
      lastFrameRef.current = timestamp;

      const t = timestamp * 0.001;
      const w = canvas.width;
      const h = canvas.height;

      // Обновляем переход
      const ms = moodStateRef.current;
      if (ms.isTransitioning) {
        useMoodStore.getState().updateTransition(delta);
      }

      // Получаем интерполированный конфиг
      const config = getMoodConfig(
        ms.previousMood,
        ms.mood,
        ms.transitionProgress
      );

      ctx.clearRect(0, 0, w, h);

      // === Центральное пятно (главный элемент) ===
      const centerX = w * 0.5;
      const centerY = h * 0.45;
      const baseRadius = Math.min(w, h) * 0.35 * config.size;

      // Дыхание — медленная пульсация размера
      const breathe = Math.sin(t * config.breatheSpeed * Math.PI * 2) * 0.08 + 1;
      // Пульс — более быстрая вибрация
      const pulse = Math.sin(t * config.pulseSpeed * Math.PI * 2) * 0.05 + 1;

      const radius = baseRadius * breathe * pulse;

      // Мягкое покачивание позиции
      const swayX = Math.sin(t * 0.07) * 15;
      const swayY = Math.cos(t * 0.05) * 10;

      const cx = centerX + swayX;
      const cy = centerY + swayY;

      // Основной градиент
      const mainGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      mainGrad.addColorStop(0, `rgba(${config.colors[0]}, ${config.intensity * 1.2})`);
      mainGrad.addColorStop(0.35, `rgba(${config.colors[1]}, ${config.intensity * 0.7})`);
      mainGrad.addColorStop(0.65, `rgba(${config.colors[2]}, ${config.intensity * 0.3})`);
      mainGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = mainGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Второй слой — смещённый для объёма
      const offset2X = Math.sin(t * 0.11 + 1.5) * 25;
      const offset2Y = Math.cos(t * 0.09 + 0.8) * 20;
      const radius2 = radius * 0.7;

      const secondGrad = ctx.createRadialGradient(
        cx + offset2X, cy + offset2Y, 0,
        cx + offset2X, cy + offset2Y, radius2
      );
      secondGrad.addColorStop(0, `rgba(${config.colors[2]}, ${config.intensity * 0.8})`);
      secondGrad.addColorStop(0.5, `rgba(${config.colors[0]}, ${config.intensity * 0.3})`);
      secondGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = secondGrad;
      ctx.beginPath();
      ctx.arc(cx + offset2X, cy + offset2Y, radius2, 0, Math.PI * 2);
      ctx.fill();

      // === Частицы ===
      const particleColorIndex = Math.floor(t * 0.1) % 3;
      const particleColor = config.colors[particleColorIndex];

      particlesRef.current.forEach((p) => {
        // Скорость частиц зависит от pulseSpeed настроения
        const speedMult = 0.5 + config.pulseSpeed * 2;

        p.x += p.driftX * speedMult;
        p.y += p.driftY * speedMult;

        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
        if (p.x < -5) p.x = w + 5;
        if (p.x > w + 5) p.x = -5;

        const twinkle = Math.sin(t * p.twinkleSpeed + p.offset);
        const alpha = p.baseOpacity * (0.4 + (twinkle * 0.5 + 0.5) * 0.6);

        // Гало у крупных
        if (p.size > 1) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          glow.addColorStop(0, `rgba(${particleColor}, ${alpha * 0.2})`);
          glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, ${alpha})`;
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
