import { useEffect, useRef } from 'react';
import { useThemeStore } from '../store/themeStore';
import { useMoodStore } from '../store/moodStore';
import type { Mood } from '../store/moodStore';

const COFFEE_COLORS: Record<Mood, string[]> = {
  neutral: ['139, 90, 43', '166, 123, 81', '194, 154, 108'],
  happy: ['255, 183, 77', '255, 167, 38', '230, 150, 30'],
  excited: ['255, 138, 101', '239, 108, 77', '214, 93, 62'],
  calm: ['161, 136, 127', '141, 110, 99', '121, 85, 72'],
  focused: ['188, 143, 93', '162, 117, 67', '139, 90, 43'],
  curious: ['205, 133, 63', '184, 115, 51', '160, 95, 35'],
  confused: ['128, 107, 98', '109, 88, 79', '93, 74, 66'],
  frustrated: ['156, 87, 67', '138, 72, 52', '121, 58, 38'],
  grateful: ['218, 165, 105', '198, 145, 85', '178, 125, 65'],
  reflective: ['130, 110, 100', '110, 90, 80', '90, 70, 60'],
};

const COFFEE_PHYSICS: Record<Mood, { speed: number; size: number; energy: number }> = {
  neutral: { speed: 1, size: 1, energy: 0.5 },
  happy: { speed: 1.3, size: 1.1, energy: 0.7 },
  excited: { speed: 1.6, size: 1.2, energy: 0.9 },
  calm: { speed: 0.6, size: 1.15, energy: 0.3 },
  focused: { speed: 0.8, size: 0.95, energy: 0.6 },
  curious: { speed: 1.2, size: 1.05, energy: 0.65 },
  confused: { speed: 1.1, size: 0.9, energy: 0.5 },
  frustrated: { speed: 1.4, size: 0.85, energy: 0.8 },
  grateful: { speed: 0.7, size: 1.2, energy: 0.4 },
  reflective: { speed: 0.5, size: 1.1, energy: 0.35 },
};

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
  warmth: number;
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

interface SteamParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  opacity: number;
  wobble: number;
  wobbleSpeed: number;
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
  const steamRef = useRef<SteamParticle[]>([]);
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
        spawnSteam();
      }
    });
    return unsub;
  }, []);

  function spawnSteam() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const count = 2 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
      steamRef.current.push({
        x: w * 0.5 + (Math.random() - 0.5) * w * 0.1,
        y: h * 0.5 + Math.random() * h * 0.1,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(0.3 + Math.random() * 0.5),
        life: 1,
        maxLife: 4 + Math.random() * 3,
        size: 15 + Math.random() * 25,
        opacity: 0.015 + Math.random() * 0.02,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.5 + Math.random() * 0.5,
      });
    }
    if (steamRef.current.length > 20) {
      steamRef.current = steamRef.current.slice(-15);
    }
  }

  function spawnParticles(mood: Mood) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const colors = COFFEE_COLORS[mood];
    const count = 2 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.08 + Math.random() * 0.5;
      particlesRef.current.push({
        x: w * 0.5 + (Math.random() - 0.5) * w * 0.25,
        y: h * 0.45 + (Math.random() - 0.5) * h * 0.25,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 4 + Math.random() * 5,
        size: 0.4 + Math.random() * 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.06 + Math.random() * 0.1,
      });
    }
    if (particlesRef.current.length > 40) {
      particlesRef.current = particlesRef.current.slice(-30);
    }
  }

  function spawnOrb(mood: Mood) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const colors = COFFEE_COLORS[mood];
    const physics = COFFEE_PHYSICS[mood];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const cx = w * 0.5 + (Math.random() - 0.5) * w * 0.4;
    const cy = h * 0.45 + (Math.random() - 0.5) * h * 0.4;

    const angle = Math.random() * Math.PI * 2;
    const speed = (0.15 + Math.random() * 0.6) * physics.speed;
    const baseRadius = (100 + Math.random() * 150) * physics.size;

    orbsRef.current.push({
      id: idCounterRef.current++,
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 8,
      targetRadius: baseRadius,
      color,
      targetColor: color,
      opacity: 0,
      targetOpacity: 0.018 + physics.energy * 0.012,
      mood,
      pulseOffset: Math.random() * Math.PI * 2,
      pulseSpeed: 0.12 + physics.energy * 0.2,
      mass: baseRadius,
      breathePhase: Math.random() * Math.PI * 2,
    });

    const MAX_ORBS = 8;
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

      const count = Math.floor((w * h) / 30000);
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.0 + 0.2,
        opacity: Math.random() * 0.12 + 0.02,
        twinkleSpeed: Math.random() * 0.6 + 0.15,
        offset: Math.random() * Math.PI * 2,
        driftY: -(Math.random() * 0.02 + 0.003),
        driftX: (Math.random() - 0.5) * 0.008,
        warmth: Math.random(),
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

      const ambientGlow = ctx.createRadialGradient(
        w * 0.5 + Math.sin(t * 0.05) * w * 0.05,
        h * 0.4 + Math.cos(t * 0.04) * h * 0.05,
        0,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.7
      );
      ambientGlow.addColorStop(0, 'rgba(139, 90, 43, 0.015)');
      ambientGlow.addColorStop(0.3, 'rgba(100, 65, 30, 0.008)');
      ambientGlow.addColorStop(0.6, 'rgba(60, 40, 20, 0.003)');
      ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, w, h);

      const orbs = orbsRef.current;
      const centerX = w * 0.5;
      const centerY = h * 0.45;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < orbs.length; i++) {
        const a = orbs[i];

        a.radius = lerp(a.radius, a.targetRadius, delta * 1.0);
        a.opacity = lerp(a.opacity, a.targetOpacity, delta * 1.2);
        a.color = lerpColor(a.color, a.targetColor, delta * 1.8);
        a.breathePhase += delta * 0.35;

        const dxC = centerX - a.x;
        const dyC = centerY - a.y;
        const distC = Math.sqrt(dxC * dxC + dyC * dyC);
        if (distC > 60) {
          a.vx += (dxC / distC) * 0.00006 * distC;
          a.vy += (dyC / distC) * 0.00006 * distC;
        }

        if (mx > 0 && my > 0) {
          const dxM = a.x - mx;
          const dyM = a.y - my;
          const distM = Math.sqrt(dxM * dxM + dyM * dyM);
          if (distM < 220 && distM > 1) {
            const force = smoothstep(220, 0, distM) * 0.06;
            a.vx += (dxM / distM) * force;
            a.vy += (dyM / distM) * force;
          }
        }

        for (let j = i + 1; j < orbs.length; j++) {
          const b = orbs[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = a.radius * 0.65 + b.radius * 0.65;

          if (dist < minDist && dist > 0.1) {
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;
            const push = overlap * 0.008;
            const total = a.mass + b.mass;
            a.vx -= nx * push * (b.mass / total);
            a.vy -= ny * push * (b.mass / total);
            b.vx += nx * push * (a.mass / total);
            b.vy += ny * push * (a.mass / total);
            const sep = overlap * 0.15;
            a.x -= nx * sep * (b.mass / total);
            a.y -= ny * sep * (b.mass / total);
            b.x += nx * sep * (a.mass / total);
            b.y += ny * sep * (a.mass / total);
          } else if (dist < minDist * 1.8 && dist > 0.1) {
            const repel = 0.001 / (dist * dist) * (a.mass * b.mass);
            const nx = dx / dist;
            const ny = dy / dist;
            a.vx -= nx * repel / a.mass;
            a.vy -= ny * repel / a.mass;
            b.vx += nx * repel / b.mass;
            b.vy += ny * repel / b.mass;
          }
        }

        a.vx *= 0.990;
        a.vy *= 0.990;
        a.x += a.vx;
        a.y += a.vy;

        const margin = a.radius * 0.35;
        if (a.x < margin) a.vx += 0.025;
        if (a.x > w - margin) a.vx -= 0.025;
        if (a.y < margin) a.vy += 0.025;
        if (a.y > h - margin) a.vy -= 0.025;
      }

      orbsRef.current = orbs.filter(o => o.opacity > 0.0008 || o.targetOpacity > 0);

      const sorted = [...orbsRef.current].sort((a, b) => b.radius - a.radius);

      for (const orb of sorted) {
        if (orb.opacity < 0.0004) continue;

        const pulse = Math.sin(t * orb.pulseSpeed + orb.pulseOffset) * 0.03 + 1;
        const breathe = Math.sin(t * 0.2 + orb.breathePhase) * 0.015 + 1;
        const r = orb.radius * pulse * breathe;

        const outer = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r * 3);
        outer.addColorStop(0, `rgba(${orb.color}, ${orb.opacity * 0.06})`);
        outer.addColorStop(0.35, `rgba(${orb.color}, ${orb.opacity * 0.025})`);
        outer.addColorStop(0.7, `rgba(${orb.color}, ${orb.opacity * 0.008})`);
        outer.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = outer;
        ctx.fill();

        const main = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r * 1.4);
        main.addColorStop(0, `rgba(${orb.color}, ${orb.opacity * 0.28})`);
        main.addColorStop(0.3, `rgba(${orb.color}, ${orb.opacity * 0.12})`);
        main.addColorStop(0.65, `rgba(${orb.color}, ${orb.opacity * 0.035})`);
        main.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 1.4, 0, Math.PI * 2);
        ctx.fillStyle = main;
        ctx.fill();

        const core = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r * 0.4);
        core.addColorStop(0, `rgba(${orb.color}, ${orb.opacity * 0.45})`);
        core.addColorStop(0.5, `rgba(${orb.color}, ${orb.opacity * 0.18})`);
        core.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 0.4, 0, Math.PI * 2);
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
          const connectDist = (a.radius + b.radius) * 1.4;

          if (dist < connectDist && dist > 0) {
            const strength = (1 - dist / connectDist) * Math.min(a.opacity, b.opacity) * 2.5;

            if (strength > 0.0015) {
              const midX = (a.x + b.x) / 2;
              const midY = (a.y + b.y) / 2;
              const midColor = lerpColor(a.color, b.color, 0.5);

              const perpX = -dy / dist * 10 * Math.sin(t * 0.25 + i * 0.4);
              const perpY = dx / dist * 10 * Math.sin(t * 0.25 + i * 0.4);

              const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
              grad.addColorStop(0, `rgba(${a.color}, 0)`);
              grad.addColorStop(0.2, `rgba(${a.color}, ${strength * 0.06})`);
              grad.addColorStop(0.5, `rgba(${midColor}, ${strength * 0.12})`);
              grad.addColorStop(0.8, `rgba(${b.color}, ${strength * 0.06})`);
              grad.addColorStop(1, `rgba(${b.color}, 0)`);

              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.quadraticCurveTo(midX + perpX, midY + perpY, b.x, b.y);
              ctx.strokeStyle = grad;
              ctx.lineWidth = 0.6 + strength * 2.5;
              ctx.lineCap = 'round';
              ctx.stroke();
            }
          }
        }
      }

      steamRef.current = steamRef.current.filter(s => {
        s.life -= delta / s.maxLife;
        if (s.life <= 0) return false;

        s.wobble += delta * s.wobbleSpeed;
        s.x += s.vx + Math.sin(s.wobble) * 0.3;
        s.y += s.vy;
        s.vy *= 0.998;
        s.size += delta * 8;

        const alpha = s.opacity * smoothstep(0, 0.2, s.life) * smoothstep(1, 0.6, 1 - s.life);
        if (alpha < 0.001) return true;

        const sg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size);
        sg.addColorStop(0, `rgba(200, 180, 160, ${alpha * 0.5})`);
        sg.addColorStop(0.4, `rgba(180, 160, 140, ${alpha * 0.2})`);
        sg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = sg;
        ctx.fill();

        return true;
      });

      particlesRef.current = particlesRef.current.filter(p => {
        p.life -= delta / p.maxLife;
        if (p.life <= 0) return false;

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.996;
        p.vy *= 0.996;
        p.vy -= 0.0015;

        const alpha = p.opacity * smoothstep(0, 0.2, p.life) * smoothstep(1, 0.7, 1 - p.life);
        if (alpha < 0.0008) return true;

        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
        pg.addColorStop(0, `rgba(${p.color}, ${alpha * 0.2})`);
        pg.addColorStop(0.5, `rgba(${p.color}, ${alpha * 0.06})`);
        pg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
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
        const alpha = star.opacity * (0.5 + tw * 0.3 + 0.2);

        let starColor: string;
        if (star.warmth < 0.3) starColor = '200, 185, 170';
        else if (star.warmth < 0.6) starColor = '220, 200, 175';
        else if (star.warmth < 0.85) starColor = '235, 210, 180';
        else starColor = '245, 225, 190';

        for (const orb of orbsRef.current) {
          const dx = star.x - orb.x;
          const dy = star.y - orb.y;
          const dd = Math.sqrt(dx * dx + dy * dy);
          if (dd < orb.radius * 2.2) {
            const inf = smoothstep(orb.radius * 2.2, 0, dd) * 0.2;
            starColor = lerpColor(starColor, orb.color, inf);
            break;
          }
        }

        if (star.size > 0.6) {
          const sg = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 2.5);
          sg.addColorStop(0, `rgba(${starColor}, ${alpha * 0.06})`);
          sg.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starColor}, ${alpha})`;
        ctx.fill();
      });

      const vig = ctx.createRadialGradient(
        w * 0.5, h * 0.5, Math.min(w, h) * 0.25,
        w * 0.5, h * 0.5, Math.max(w, h) * 0.85
      );
      vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vig.addColorStop(0.6, 'rgba(10, 6, 3, 0.15)');
      vig.addColorStop(1, 'rgba(10, 6, 3, 0.35)');
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
