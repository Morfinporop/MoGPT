// src/components/Background.tsx

import { useEffect, useRef } from 'react';
import { useThemeStore } from '../store/themeStore';
import { useMoodStore, MOOD_COLORS, MOOD_PHYSICS } from '../store/moodStore';
import type { Mood } from '../store/moodStore';

interface Orb {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  targetRadius: number;
  color: string;
  targetColor: string;
  opacity: number;
  targetOpacity: number;
  mood: Mood;
  birth: number;
  pulseOffset: number;
  pulseSpeed: number;
  mass: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  offset: number;
  driftY: number;
}

function parseColor(c: string): [number, number, number] {
  const parts = c.split(',').map(s => parseInt(s.trim()));
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parseColor(a);
  const [br, bg, bb] = parseColor(b);
  return `${Math.round(ar + (br - ar) * t)}, ${Math.round(ag + (bg - ag) * t)}, ${Math.round(ab + (bb - ab) * t)}`;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const orbsRef = useRef<Orb[]>([]);
  const starsRef = useRef<Star[]>([]);
  const idCounterRef = useRef(0);
  const lastEventRef = useRef(0);
  const { theme } = useThemeStore();

  // Следим за eventCounter
  const eventCounterRef = useRef(0);

  useEffect(() => {
    const unsub = useMoodStore.subscribe((state) => {
      if (state.eventCounter > eventCounterRef.current) {
        eventCounterRef.current = state.eventCounter;
        spawnOrb(state.currentMood);
      }
    });
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function spawnOrb(mood: Mood) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = canvas.width;
    const h = canvas.height;
    const colors = MOOD_COLORS[mood];
    const physics = MOOD_PHYSICS[mood];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Спавним из центра с разбросом
    const cx = w * 0.5 + (Math.random() - 0.5) * w * 0.2;
    const cy = h * 0.45 + (Math.random() - 0.5) * h * 0.2;

    const angle = Math.random() * Math.PI * 2;
    const speed = (0.5 + Math.random() * 1.5) * physics.speed;
    const baseRadius = (50 + Math.random() * 80) * physics.size;

    const orb: Orb = {
      id: idCounterRef.current++,
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 5, // Стартует маленьким — вырастает
      targetRadius: baseRadius,
      color: color,
      targetColor: color,
      opacity: 0,
      targetOpacity: 0.06 + physics.energy * 0.04,
      mood,
      birth: Date.now(),
      pulseOffset: Math.random() * Math.PI * 2,
      pulseSpeed: 0.3 + physics.energy * 0.5,
      mass: baseRadius,
    };

    orbsRef.current.push(orb);

    // Ограничиваем максимум — старые угасают
    const MAX_ORBS = 15;
    if (orbsRef.current.length > MAX_ORBS) {
      // Помечаем старый на угасание
      orbsRef.current[0].targetOpacity = 0;
      orbsRef.current[0].targetRadius = 0;
    }
  }

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

      // Звёзды
      const count = Math.floor((canvas.width * canvas.height) / 22000);
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.4 + 0.3,
        opacity: Math.random() * 0.3 + 0.05,
        twinkleSpeed: Math.random() * 1.2 + 0.3,
        offset: Math.random() * Math.PI * 2,
        driftY: -(Math.random() * 0.08 + 0.01),
      }));

      // Стартовые орбы если пусто
      if (orbsRef.current.length === 0) {
        const startMoods: Mood[] = ['neutral', 'calm', 'focused'];
        startMoods.forEach(m => spawnOrb(m));
      }
    };

    resize();
    window.addEventListener('resize', resize);

    let lastTime = 0;

    const animate = (timestamp: number) => {
      const delta = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0.016;
      lastTime = timestamp;

      const t = timestamp * 0.001;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // === Обновляем и рисуем орбы ===
      const orbs = orbsRef.current;

      // Физика: движение + притяжение к центру + столкновения
      const centerX = w * 0.5;
      const centerY = h * 0.45;

      for (let i = 0; i < orbs.length; i++) {
        const a = orbs[i];

        // Плавная интерполяция свойств
        a.radius = lerp(a.radius, a.targetRadius, delta * 2);
        a.opacity = lerp(a.opacity, a.targetOpacity, delta * 2);
        a.color = lerpColor(a.color, a.targetColor, delta * 3);

        // Мягкое притяжение к центру
        const dxC = centerX - a.x;
        const dyC = centerY - a.y;
        const distC = Math.sqrt(dxC * dxC + dyC * dyC);
        const pullStrength = 0.00015;

        if (distC > 50) {
          a.vx += (dxC / distC) * pullStrength * distC;
          a.vy += (dyC / distC) * pullStrength * distC;
        }

        // Столкновения между орбами
        for (let j = i + 1; j < orbs.length; j++) {
          const b = orbs[j];

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = a.radius * 0.6 + b.radius * 0.6;

          if (dist < minDist && dist > 0.1) {
            // Мягкое отталкивание
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            const pushForce = overlap * 0.02;
            const totalMass = a.mass + b.mass;

            a.vx -= nx * pushForce * (b.mass / totalMass);
            a.vy -= ny * pushForce * (b.mass / totalMass);
            b.vx += nx * pushForce * (a.mass / totalMass);
            b.vy += ny * pushForce * (a.mass / totalMass);

            // Разделение позиций
            const sep = overlap * 0.3;
            a.x -= nx * sep * (b.mass / totalMass);
            a.y -= ny * sep * (b.mass / totalMass);
            b.x += nx * sep * (a.mass / totalMass);
            b.y += ny * sep * (a.mass / totalMass);
          }
          // Дальнее мягкое отталкивание
          else if (dist < minDist * 2 && dist > 0.1) {
            const repel = 0.003 / (dist * dist) * (a.mass * b.mass);
            const nx = dx / dist;
            const ny = dy / dist;
            a.vx -= nx * repel / a.mass;
            a.vy -= ny * repel / a.mass;
            b.vx += nx * repel / b.mass;
            b.vy += ny * repel / b.mass;
          }
        }

        // Затухание
        a.vx *= 0.995;
        a.vy *= 0.995;

        // Движение
        a.x += a.vx;
        a.y += a.vy;

        // Мягкие границы
        const margin = a.radius * 0.3;
        const bounceForce = 0.05;
        if (a.x < margin) a.vx += bounceForce;
        if (a.x > w - margin) a.vx -= bounceForce;
        if (a.y < margin) a.vy += bounceForce;
        if (a.y > h - margin) a.vy -= bounceForce;
      }

      // Убираем мёртвые орбы
      orbsRef.current = orbs.filter(o => o.opacity > 0.002 || o.targetOpacity > 0);

      // Рисуем орбы (от дальних к ближним)
      const sortedOrbs = [...orbsRef.current].sort((a, b) => b.radius - a.radius);

      for (const orb of sortedOrbs) {
        if (orb.opacity < 0.001) continue;

        const pulse = Math.sin(t * orb.pulseSpeed + orb.pulseOffset) * 0.08 + 1;
        const r = orb.radius * pulse;

        // Внешнее свечение
        const outerGrad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r * 1.5);
        outerGrad.addColorStop(0, `rgba(${orb.color}, ${orb.opacity * 0.6})`);
        outerGrad.addColorStop(0.4, `rgba(${orb.color}, ${orb.opacity * 0.3})`);
        outerGrad.addColorStop(0.7, `rgba(${orb.color}, ${orb.opacity * 0.1})`);
        outerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = outerGrad;
        ctx.fill();

        // Ядро
        const coreGrad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r * 0.6);
        coreGrad.addColorStop(0, `rgba(${orb.color}, ${orb.opacity * 1.2})`);
        coreGrad.addColorStop(0.5, `rgba(${orb.color}, ${orb.opacity * 0.5})`);
        coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();
      }

      // === Мосты света между близкими орбами ===
      for (let i = 0; i < orbsRef.current.length; i++) {
        for (let j = i + 1; j < orbsRef.current.length; j++) {
          const a = orbsRef.current[i];
          const b = orbsRef.current[j];

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const connectDist = (a.radius + b.radius) * 1.8;

          if (dist < connectDist && dist > 0) {
            const strength = (1 - dist / connectDist) * Math.min(a.opacity, b.opacity) * 8;

            if (strength > 0.005) {
              const midX = (a.x + b.x) / 2;
              const midY = (a.y + b.y) / 2;
              const midColor = lerpColor(a.color, b.color, 0.5);

              // Градиентная линия
              const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
              grad.addColorStop(0, `rgba(${a.color}, ${strength * 0.3})`);
              grad.addColorStop(0.5, `rgba(${midColor}, ${strength * 0.5})`);
              grad.addColorStop(1, `rgba(${b.color}, ${strength * 0.3})`);

              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              // Кривая через смещённую середину
              const perpX = -dy / dist * 15 * Math.sin(t * 0.5 + i);
              const perpY = dx / dist * 15 * Math.sin(t * 0.5 + i);
              ctx.quadraticCurveTo(midX + perpX, midY + perpY, b.x, b.y);
              ctx.strokeStyle = grad;
              ctx.lineWidth = 2 + strength * 10;
              ctx.lineCap = 'round';
              ctx.stroke();

              // Свечение в точке контакта
              const glowGrad = ctx.createRadialGradient(midX, midY, 0, midX, midY, 30);
              glowGrad.addColorStop(0, `rgba(${midColor}, ${strength * 0.4})`);
              glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

              ctx.beginPath();
              ctx.arc(midX, midY, 30, 0, Math.PI * 2);
              ctx.fillStyle = glowGrad;
              ctx.fill();
            }
          }
        }
      }

      // === Звёзды ===
      starsRef.current.forEach((star) => {
        star.y += star.driftY;
        if (star.y < -5) { star.y = h + 5; star.x = Math.random() * w; }

        const twinkle = Math.sin(t * star.twinkleSpeed + star.offset);
        const alpha = star.opacity * (0.4 + (twinkle * 0.5 + 0.5) * 0.6);

        // Цвет звёзд подстраивается под ближайший орб
        let starColor = '200, 190, 255';
        let minDist = Infinity;
        for (const orb of orbsRef.current) {
          const dx = star.x - orb.x;
          const dy = star.y - orb.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < minDist && d < orb.radius * 2.5) {
            minDist = d;
            const influence = 1 - d / (orb.radius * 2.5);
            starColor = lerpColor('200, 190, 255', orb.color, influence * 0.6);
          }
        }

        if (star.size > 0.8) {
          const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3);
          glow.addColorStop(0, `rgba(${starColor}, ${alpha * 0.2})`);
          glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starColor}, ${alpha})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
