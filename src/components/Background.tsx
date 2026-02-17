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
  rotAngle: number;
  rotSpeed: number;
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function spawnParticles(mood: Mood) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const colors = MOOD_COLORS[mood];
    const count = 5 + Math.floor(Math.random() * 6);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.2 + Math.random() * 1.2;
      particlesRef.current.push({
        x: w * 0.5 + (Math.random() - 0.5) * w * 0.15,
        y: h * 0.45 + (Math.random() - 0.5) * h * 0.15,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 2 + Math.random() * 3,
        size: 0.8 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.2 + Math.random() * 0.35,
      });
    }
    if (particlesRef.current.length > 70) {
      particlesRef.current = particlesRef.current.slice(-50);
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

    const cx = w * 0.5 + (Math.random() - 0.5) * w * 0.25;
    const cy = h * 0.45 + (Math.random() - 0.5) * h * 0.25;

    const angle = Math.random() * Math.PI * 2;
    const speed = (0.3 + Math.random() * 1.2) * physics.speed;
    const baseRadius = (55 + Math.random() * 90) * physics.size;

    orbsRef.current.push({
      id: idCounterRef.current++,
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 3,
      targetRadius: baseRadius,
      color,
      targetColor: color,
      opacity: 0,
      targetOpacity: 0.05 + physics.energy * 0.035,
      mood,
      birth: Date.now(),
      pulseOffset: Math.random() * Math.PI * 2,
      pulseSpeed: 0.25 + physics.energy * 0.4,
      mass: baseRadius,
      rotAngle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.25,
      breathePhase: Math.random() * Math.PI * 2,
    });

    const MAX_ORBS = 14;
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

    const handleMouse = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
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

      const count = Math.floor((w * h) / 20000);
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.5 + 0.2,
        opacity: Math.random() * 0.3 + 0.04,
        twinkleSpeed: Math.random() * 1.3 + 0.3,
        offset: Math.random() * Math.PI * 2,
        driftY: -(Math.random() * 0.06 + 0.01),
        driftX: (Math.random() - 0.5) * 0.015,
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

      // ─── Ambient background glow ───
      const ambGrad = ctx.createRadialGradient(
        w * 0.5 + Math.sin(t * 0.08) * w * 0.08,
        h * 0.4 + Math.cos(t * 0.06) * h * 0.08,
        0, w * 0.5, h * 0.5, Math.max(w, h) * 0.65
      );
      // Using violet from CSS: rgb(124, 107, 245) = #7c6bf5
      ambGrad.addColorStop(0, `rgba(124, 107, 245, 0.01)`);
      ambGrad.addColorStop(0.5, `rgba(157, 140, 248, 0.005)`);
      ambGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ambGrad;
      ctx.fillRect(0, 0, w, h);

      // ─── Orb physics ───
      const orbs = orbsRef.current;
      const centerX = w * 0.5;
      const centerY = h * 0.45;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < orbs.length; i++) {
        const a = orbs[i];

        a.radius = lerp(a.radius, a.targetRadius, delta * 1.8);
        a.opacity = lerp(a.opacity, a.targetOpacity, delta * 1.8);
        a.color = lerpColor(a.color, a.targetColor, delta * 2.5);
        a.rotAngle += a.rotSpeed * delta;
        a.breathePhase += delta * 0.5;

        // Center attraction
        const dxC = centerX - a.x;
        const dyC = centerY - a.y;
        const distC = Math.sqrt(dxC * dxC + dyC * dyC);
        if (distC > 40) {
          a.vx += (dxC / distC) * 0.00012 * distC;
          a.vy += (dyC / distC) * 0.00012 * distC;
        }

        // Mouse repulsion
        if (mx > 0 && my > 0) {
          const dxM = a.x - mx;
          const dyM = a.y - my;
          const distM = Math.sqrt(dxM * dxM + dyM * dyM);
          if (distM < 180 && distM > 1) {
            const force = smoothstep(180, 0, distM) * 0.12;
            a.vx += (dxM / distM) * force;
            a.vy += (dyM / distM) * force;
          }
        }

        // Orb-orb interactions
        for (let j = i + 1; j < orbs.length; j++) {
          const b = orbs[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = a.radius * 0.55 + b.radius * 0.55;

          if (dist < minDist && dist > 0.1) {
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;
            const push = overlap * 0.015;
            const total = a.mass + b.mass;
            a.vx -= nx * push * (b.mass / total);
            a.vy -= ny * push * (b.mass / total);
            b.vx += nx * push * (a.mass / total);
            b.vy += ny * push * (a.mass / total);
            const sep = overlap * 0.25;
            a.x -= nx * sep * (b.mass / total);
            a.y -= ny * sep * (b.mass / total);
            b.x += nx * sep * (a.mass / total);
            b.y += ny * sep * (a.mass / total);
          } else if (dist < minDist * 2.2 && dist > 0.1) {
            const repel = 0.002 / (dist * dist) * (a.mass * b.mass);
            const nx = dx / dist;
            const ny = dy / dist;
            a.vx -= nx * repel / a.mass;
            a.vy -= ny * repel / a.mass;
            b.vx += nx * repel / b.mass;
            b.vy += ny * repel / b.mass;
          }
        }

        a.vx *= 0.994;
        a.vy *= 0.994;
        a.x += a.vx;
        a.y += a.vy;

        const margin = a.radius * 0.25;
        if (a.x < margin) a.vx += 0.04;
        if (a.x > w - margin) a.vx -= 0.04;
        if (a.y < margin) a.vy += 0.04;
        if (a.y > h - margin) a.vy -= 0.04;
      }

      orbsRef.current = orbs.filter(o => o.opacity > 0.001 || o.targetOpacity > 0);

      // ─── Draw orbs ───
      const sorted = [...orbsRef.current].sort((a, b) => b.radius - a.radius);

      for (const orb of sorted) {
        if (orb.opacity < 0.0005) continue;

        const pulse = Math.sin(t * orb.pulseSpeed + orb.pulseOffset) * 0.06 + 1;
        const breathe = Math.sin(t * 0.3 + orb.breathePhase) * 0.03 + 1;
        const r = orb.radius * pulse * breathe;

        // Haze layer
        const haze = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r * 2);
        haze.addColorStop(0, `rgba(${orb.color}, ${orb.opacity * 0.2})`);
        haze.addColorStop(0.3, `rgba(${orb.color}, ${orb.opacity * 0.08})`);
        haze.addColorStop(0.6, `rgba(${orb.color}, ${orb.opacity * 0.02})`);
        haze.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 2, 0, Math.PI * 2);
        ctx.fillStyle = haze;
        ctx.fill();

        // Main glow
        const main = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r * 1.3);
        main.addColorStop(0, `rgba(${orb.color}, ${orb.opacity * 0.65})`);
        main.addColorStop(0.3, `rgba(${orb.color}, ${orb.opacity * 0.3})`);
        main.addColorStop(0.6, `rgba(${orb.color}, ${orb.opacity * 0.1})`);
        main.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 1.3, 0, Math.PI * 2);
        ctx.fillStyle = main;
        ctx.fill();

        // Core with slight offset
        const offX = Math.sin(orb.rotAngle) * r * 0.04;
        const offY = Math.cos(orb.rotAngle) * r * 0.04;
        const core = ctx.createRadialGradient(orb.x + offX, orb.y + offY, 0, orb.x, orb.y, r * 0.45);
        core.addColorStop(0, `rgba(${orb.color}, ${orb.opacity * 1.4})`);
        core.addColorStop(0.5, `rgba(${orb.color}, ${orb.opacity * 0.5})`);
        core.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = core;
        ctx.fill();

        // Hot center highlight
        const hl = ctx.createRadialGradient(orb.x + offX * 2, orb.y + offY * 2, 0, orb.x, orb.y, r * 0.12);
        hl.addColorStop(0, `rgba(255, 255, 255, ${orb.opacity * 0.35})`);
        hl.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = hl;
        ctx.fill();
      }

      // ─── Light bridges ───
      for (let i = 0; i < orbsRef.current.length; i++) {
        for (let j = i + 1; j < orbsRef.current.length; j++) {
          const a = orbsRef.current[i];
          const b = orbsRef.current[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const connectDist = (a.radius + b.radius) * 1.8;

          if (dist < connectDist && dist > 0) {
            const strength = (1 - dist / connectDist) * Math.min(a.opacity, b.opacity) * 6;

            if (strength > 0.003) {
              const midX = (a.x + b.x) / 2;
              const midY = (a.y + b.y) / 2;
              const midColor = lerpColor(a.color, b.color, 0.5);

              const perpX = -dy / dist * 18 * Math.sin(t * 0.4 + i * 0.7);
              const perpY = dx / dist * 18 * Math.sin(t * 0.4 + i * 0.7);

              const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
              grad.addColorStop(0, `rgba(${a.color}, 0)`);
              grad.addColorStop(0.15, `rgba(${a.color}, ${strength * 0.2})`);
              grad.addColorStop(0.5, `rgba(${midColor}, ${strength * 0.35})`);
              grad.addColorStop(0.85, `rgba(${b.color}, ${strength * 0.2})`);
              grad.addColorStop(1, `rgba(${b.color}, 0)`);

              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.quadraticCurveTo(midX + perpX, midY + perpY, b.x, b.y);
              ctx.strokeStyle = grad;
              ctx.lineWidth = 1.5 + strength * 7;
              ctx.lineCap = 'round';
              ctx.stroke();

              // Bridge glow
              const glowR = 18 + strength * 25;
              const glow = ctx.createRadialGradient(midX + perpX * 0.3, midY + perpY * 0.3, 0, midX, midY, glowR);
              glow.addColorStop(0, `rgba(${midColor}, ${strength * 0.25})`);
              glow.addColorStop(0.5, `rgba(${midColor}, ${strength * 0.08})`);
              glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
              ctx.beginPath();
              ctx.arc(midX, midY, glowR, 0, Math.PI * 2);
              ctx.fillStyle = glow;
              ctx.fill();
            }
          }
        }
      }

      // ─── Particles ───
      particlesRef.current = particlesRef.current.filter(p => {
        p.life -= delta / p.maxLife;
        if (p.life <= 0) return false;

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.998;
        p.vy *= 0.998;
        p.vy -= 0.003;

        const alpha = p.opacity * smoothstep(0, 0.3, p.life) * smoothstep(1, 0.7, 1 - p.life);
        if (alpha < 0.002) return true;

        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.5);
        pg.addColorStop(0, `rgba(${p.color}, ${alpha * 0.4})`);
        pg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        ctx.fill();

        return true;
      });

      // ─── Stars ───
      starsRef.current.forEach((star) => {
        star.y += star.driftY;
        star.x += star.driftX;
        if (star.y < -5) { star.y = h + 5; star.x = Math.random() * w; }
        if (star.x < -5) star.x = w + 5;
        if (star.x > w + 5) star.x = -5;

        const tw1 = Math.sin(t * star.twinkleSpeed + star.offset);
        const tw2 = Math.sin(t * star.twinkleSpeed * 1.7 + star.offset * 2.3);
        const alpha = star.opacity * (0.35 + (tw1 * 0.4 + 0.5) * 0.5 + tw2 * 0.1);

        // Star color from warmth — matches CSS violet palette
        let baseColor: string;
        if (star.warmth < 0.3) baseColor = '160, 175, 245';      // cool violet-blue
        else if (star.warmth < 0.6) baseColor = '190, 180, 248';  // neutral lavender (matches --accent-secondary)
        else if (star.warmth < 0.85) baseColor = '220, 210, 250'; // warm lavender
        else baseColor = '245, 230, 210';                          // warm gold

        // Orb influence
        let starColor = baseColor;
        let minDist = Infinity;
        for (const orb of orbsRef.current) {
          const dx = star.x - orb.x;
          const dy = star.y - orb.y;
          const dd = Math.sqrt(dx * dx + dy * dy);
          if (dd < minDist && dd < orb.radius * 2.8) {
            minDist = dd;
            const inf = smoothstep(orb.radius * 2.8, 0, dd) * 0.45;
            starColor = lerpColor(baseColor, orb.color, inf);
          }
        }

        // Glow for larger stars
        if (star.size > 0.7) {
          const sg = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3.5);
          sg.addColorStop(0, `rgba(${starColor}, ${alpha * 0.12})`);
          sg.addColorStop(0.5, `rgba(${starColor}, ${alpha * 0.03})`);
          sg.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Cross-shine for brightest
        if (star.size > 1.2 && alpha > 0.14) {
          const len = star.size * 5;
          ctx.save();
          ctx.globalAlpha = alpha * 0.06;
          ctx.strokeStyle = `rgba(${starColor}, 1)`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(star.x - len, star.y);
          ctx.lineTo(star.x + len, star.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(star.x, star.y - len);
          ctx.lineTo(star.x, star.y + len);
          ctx.stroke();
          ctx.restore();
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starColor}, ${alpha})`;
        ctx.fill();
      });

      // ─── Vignette ───
      const vig = ctx.createRadialGradient(
        w * 0.5, h * 0.5, Math.min(w, h) * 0.3,
        w * 0.5, h * 0.5, Math.max(w, h) * 0.75
      );
      vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vig.addColorStop(1, 'rgba(0, 0, 0, 0.12)');
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
