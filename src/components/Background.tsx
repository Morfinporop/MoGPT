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
  breathePhase: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  offset: number;
  driftY: number;
  driftX: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  opacity: number;
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

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const orbsRef = useRef<Orb[]>([]);
  const starsRef = useRef<Star[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const idCounterRef = useRef(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const { theme } = useThemeStore();
  const eventCounterRef = useRef(0);

  useEffect(() => {
    const unsub = useMoodStore.subscribe((state) => {
      if (state.eventCounter > eventCounterRef.current) {
        eventCounterRef.current = state.eventCounter;
        spawnOrb(state.currentMood);
        spawnParticles(state.currentMood);
      }
    });
    return unsub;
  }, []);

  function spawnParticles(mood: Mood) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const colors = MOOD_COLORS[mood];
    const count = 3 + Math.floor(Math.random() * 4);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.1 + Math.random() * 0.8;
      particlesRef.current.push({
        x: w * 0.5 + (Math.random() - 0.5) * w * 0.2,
        y: h * 0.45 + (Math.random() - 0.5) * h * 0.2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 3 + Math.random() * 4,
        size: 0.5 + Math.random() * 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.08 + Math.random() * 0.12,
      });
    }
    if (particlesRef.current.length > 50) {
      particlesRef.current = particlesRef.current.slice(-35);
    }
  }

  function spawnOrb(mood: Mood) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const colors = MOOD_COLORS[mood];
    const physics = MOOD_PHYSICS[mood];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const cx = w * 0.5 + (Math.random() - 0.5) * w * 0.35;
    const cy = h * 0.45 + (Math.random() - 0.5) * h * 0.35;

    const angle = Math.random() * Math.PI * 2;
    const speed = (0.2 + Math.random() * 0.8) * physics.speed;
    const baseRadius = (80 + Math.random() * 120) * physics.size;

    orbsRef.current.push({
      id: idCounterRef.current++,
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 5,
      targetRadius: baseRadius,
      color,
      targetColor: color,
      opacity: 0,
      targetOpacity: 0.025 + physics.energy * 0.015,
      mood,
      birth: Date.now(),
      pulseOffset: Math.random() * Math.PI * 2,
      pulseSpeed: 0.15 + physics.energy * 0.25,
      mass: baseRadius,
      breathePhase: Math.random() * Math.PI * 2,
    });

    const MAX_ORBS = 10;
    if (orbsRef.current.length > MAX_ORBS) {
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
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);

      const w = window.innerWidth;
      const h = window.innerHeight;

      const count = Math.floor((w * h) / 25000);
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.2 + 0.3,
        opacity: Math.random() * 0.15 + 0.02,
        twinkleSpeed: Math.random() * 0.8 + 0.2,
        offset: Math.random() * Math.PI * 2,
        driftY: -(Math.random() * 0.03 + 0.005),
        driftX: (Math.random() - 0.5) * 0.01,
      }));

      if (orbsRef.current.length === 0) {
        (['neutral', 'calm', 'focused'] as Mood[]).forEach(m => spawnOrb(m));
      }
    };

    resize();
    window.addEventListener('resize', resize);

    let lastTime = 0;

    const animate = (timestamp: number) => {
      const delta = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0.016;
      lastTime = timestamp;
      const t = timestamp * 0.001;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      const orbs = orbsRef.current;
      const centerX = w * 0.5;
      const centerY = h * 0.45;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < orbs.length; i++) {
        const a = orbs[i];

        a.radius = lerp(a.radius, a.targetRadius, delta * 1.2);
        a.opacity = lerp(a.opacity, a.targetOpacity, delta * 1.5);
        a.color = lerpColor(a.color, a.targetColor, delta * 2);
        a.breathePhase += delta * 0.4;

        const dxC = centerX - a.x;
        const dyC = centerY - a.y;
        const distC = Math.sqrt(dxC * dxC + dyC * dyC);
        if (distC > 50) {
          a.vx += (dxC / distC) * 0.00008 * distC;
          a.vy += (dyC / distC) * 0.00008 * distC;
        }

        if (mx > 0 && my > 0) {
          const dxM = a.x - mx;
          const dyM = a.y - my;
          const distM = Math.sqrt(dxM * dxM + dyM * dyM);
          if (distM < 200 && distM > 1) {
            const force = smoothstep(200, 0, distM) * 0.08;
            a.vx += (dxM / distM) * force;
            a.vy += (dyM / distM) * force;
          }
        }

        for (let j = i + 1; j < orbs.length; j++) {
          const b = orbs[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = a.radius * 0.6 + b.radius * 0.6;

          if (dist < minDist && dist > 0.1) {
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;
            const push = overlap * 0.01;
            const total = a.mass + b.mass;
            a.vx -= nx * push * (b.mass / total);
            a.vy -= ny * push * (b.mass / total);
            b.vx += nx * push * (a.mass / total);
            b.vy += ny * push * (a.mass / total);
            const sep = overlap * 0.2;
            a.x -= nx * sep * (b.mass / total);
            a.y -= ny * sep * (b.mass / total);
            b.x += nx * sep * (a.mass / total);
            b.y += ny * sep * (a.mass / total);
          } else if (dist < minDist * 2 && dist > 0.1) {
            const repel = 0.0015 / (dist * dist) * (a.mass * b.mass);
            const nx = dx / dist;
            const ny = dy / dist;
            a.vx -= nx * repel / a.mass;
            a.vy -= ny * repel / a.mass;
            b.vx += nx * repel / b.mass;
            b.vy += ny * repel / b.mass;
          }
        }

        a.vx *= 0.992;
        a.vy *= 0.992;
        a.x += a.vx;
        a.y += a.vy;

        const margin = a.radius * 0.3;
        if (a.x < margin) a.vx += 0.03;
        if (a.x > w - margin) a.vx -= 0.03;
        if (a.y < margin) a.vy += 0.03;
        if (a.y > h - margin) a.vy -= 0.03;
      }

      orbsRef.current = orbs.filter(o => o.opacity > 0.001 || o.targetOpacity > 0);

      const sorted = [...orbsRef.current].sort((a, b) => b.radius - a.radius);

      for (const orb of sorted) {
        if (orb.opacity < 0.0005) continue;

        const pulse = Math.sin(t * orb.pulseSpeed + orb.pulseOffset) * 0.04 + 1;
        const breathe = Math.sin(t * 0.25 + orb.breathePhase) * 0.02 + 1;
        const r = orb.radius * pulse * breathe;

        const outer = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r * 2.5);
        outer.addColorStop(0, `rgba(${orb.color}, ${orb.opacity * 0.08})`);
        outer.addColorStop(0.4, `rgba(${orb.color}, ${orb.opacity * 0.03})`);
        outer.addColorStop(0.8, `rgba(${orb.color}, ${orb.opacity * 0.008})`);
        outer.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = outer;
        ctx.fill();

        const main = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r * 1.2);
        main.addColorStop(0, `rgba(${orb.color}, ${orb.opacity * 0.35})`);
        main.addColorStop(0.35, `rgba(${orb.color}, ${orb.opacity * 0.15})`);
        main.addColorStop(0.7, `rgba(${orb.color}, ${orb.opacity * 0.04})`);
        main.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = main;
        ctx.fill();

        const core = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r * 0.35);
        core.addColorStop(0, `rgba(${orb.color}, ${orb.opacity * 0.6})`);
        core.addColorStop(0.5, `rgba(${orb.color}, ${orb.opacity * 0.25})`);
        core.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = core;
        ctx.fill();
      }

      for (let i = 0; i < orbsRef.current.length; i++) {
        for (let j = i + 1; j < orbsRef.current.length; j++) {
          const a = orbsRef.current[i];
          const b = orbsRef.current[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const connectDist = (a.radius + b.radius) * 1.5;

          if (dist < connectDist && dist > 0) {
            const strength = (1 - dist / connectDist) * Math.min(a.opacity, b.opacity) * 3;

            if (strength > 0.002) {
              const midX = (a.x + b.x) / 2;
              const midY = (a.y + b.y) / 2;
              const midColor = lerpColor(a.color, b.color, 0.5);

              const perpX = -dy / dist * 12 * Math.sin(t * 0.3 + i * 0.5);
              const perpY = dx / dist * 12 * Math.sin(t * 0.3 + i * 0.5);

              const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
              grad.addColorStop(0, `rgba(${a.color}, 0)`);
              grad.addColorStop(0.2, `rgba(${a.color}, ${strength * 0.08})`);
              grad.addColorStop(0.5, `rgba(${midColor}, ${strength * 0.15})`);
              grad.addColorStop(0.8, `rgba(${b.color}, ${strength * 0.08})`);
              grad.addColorStop(1, `rgba(${b.color}, 0)`);

              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.quadraticCurveTo(midX + perpX, midY + perpY, b.x, b.y);
              ctx.strokeStyle = grad;
              ctx.lineWidth = 0.8 + strength * 3;
              ctx.lineCap = 'round';
              ctx.stroke();
            }
          }
        }
      }

      particlesRef.current = particlesRef.current.filter(p => {
        p.life -= delta / p.maxLife;
        if (p.life <= 0) return false;

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.997;
        p.vy *= 0.997;
        p.vy -= 0.002;

        const alpha = p.opacity * smoothstep(0, 0.25, p.life) * smoothstep(1, 0.75, 1 - p.life);
        if (alpha < 0.001) return true;

        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        pg.addColorStop(0, `rgba(${p.color}, ${alpha * 0.25})`);
        pg.addColorStop(0.5, `rgba(${p.color}, ${alpha * 0.08})`);
        pg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.fill();

        return true;
      });

      starsRef.current.forEach((star) => {
        star.y += star.driftY;
        star.x += star.driftX;
        if (star.y < -5) { star.y = h + 5; star.x = Math.random() * w; }
        if (star.x < -5) star.x = w + 5;
        if (star.x > w + 5) star.x = -5;

        const tw = Math.sin(t * star.twinkleSpeed + star.offset);
        const alpha = star.opacity * (0.5 + tw * 0.35 + 0.15);

        const baseColor = '180, 180, 190';

        let starColor = baseColor;
        for (const orb of orbsRef.current) {
          const dx = star.x - orb.x;
          const dy = star.y - orb.y;
          const dd = Math.sqrt(dx * dx + dy * dy);
          if (dd < orb.radius * 2.5) {
            const inf = smoothstep(orb.radius * 2.5, 0, dd) * 0.25;
            starColor = lerpColor(baseColor, orb.color, inf);
            break;
          }
        }

        if (star.size > 0.8) {
          const sg = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3);
          sg.addColorStop(0, `rgba(${starColor}, ${alpha * 0.08})`);
          sg.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starColor}, ${alpha})`;
        ctx.fill();
      });

      const vig = ctx.createRadialGradient(
        w * 0.5, h * 0.5, Math.min(w, h) * 0.35,
        w * 0.5, h * 0.5, Math.max(w, h) * 0.8
      );
      vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vig.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
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
