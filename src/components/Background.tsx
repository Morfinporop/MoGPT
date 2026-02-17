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
  // New properties for enhanced visuals
  rotationAngle: number;
  rotationSpeed: number;
  distortionPhase: number;
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
  warmth: number; // 0 = cool blue, 1 = warm gold
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
    const count = 6 + Math.floor(Math.random() * 8);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 1.5;
      const color = colors[Math.floor(Math.random() * colors.length)];

      particlesRef.current.push({
        x: w * 0.5 + (Math.random() - 0.5) * w * 0.15,
        y: h * 0.45 + (Math.random() - 0.5) * h * 0.15,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 2 + Math.random() * 3,
        size: 1 + Math.random() * 2.5,
        color,
        opacity: 0.3 + Math.random() * 0.4,
      });
    }

    // Limit particles
    if (particlesRef.current.length > 80) {
      particlesRef.current = particlesRef.current.slice(-60);
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
    const baseRadius = (60 + Math.random() * 100) * physics.size;

    const orb: Orb = {
      id: idCounterRef.current++,
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 3,
      targetRadius: baseRadius,
      color: color,
      targetColor: color,
      opacity: 0,
      targetOpacity: 0.05 + physics.energy * 0.035,
      mood,
      birth: Date.now(),
      pulseOffset: Math.random() * Math.PI * 2,
      pulseSpeed: 0.2 + physics.energy * 0.4,
      mass: baseRadius,
      rotationAngle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      distortionPhase: Math.random() * Math.PI * 2,
    };

    orbsRef.current.push(orb);

    const MAX_ORBS = 12;
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

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);

      const w = window.innerWidth;
      const h = window.innerHeight;

      // Stars with varied temperatures
      const count = Math.floor((w * h) / 18000);
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.6 + 0.2,
        opacity: Math.random() * 0.35 + 0.03,
        twinkleSpeed: Math.random() * 1.5 + 0.2,
        offset: Math.random() * Math.PI * 2,
        driftY: -(Math.random() * 0.06 + 0.008),
        driftX: (Math.random() - 0.5) * 0.02,
        warmth: Math.random(),
      }));

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
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      // === Subtle ambient gradient that shifts over time ===
      const ambientHue1 = Math.sin(t * 0.05) * 10 + 245; // purple range
      const ambientHue2 = Math.sin(t * 0.03 + 2) * 15 + 260;
      const ambientGrad = ctx.createRadialGradient(
        w * 0.5 + Math.sin(t * 0.1) * w * 0.1,
        h * 0.4 + Math.cos(t * 0.08) * h * 0.1,
        0,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.7
      );
      ambientGrad.addColorStop(0, `hsla(${ambientHue1}, 60%, 50%, 0.012)`);
      ambientGrad.addColorStop(0.5, `hsla(${ambientHue2}, 50%, 40%, 0.006)`);
      ambientGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, w, h);

      // === Update and draw orbs ===
      const orbs = orbsRef.current;
      const centerX = w * 0.5;
      const centerY = h * 0.45;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < orbs.length; i++) {
        const a = orbs[i];

        // Smooth interpolation
        a.radius = lerp(a.radius, a.targetRadius, delta * 1.8);
        a.opacity = lerp(a.opacity, a.targetOpacity, delta * 1.8);
        a.color = lerpColor(a.color, a.targetColor, delta * 2.5);
        a.rotationAngle += a.rotationSpeed * delta;
        a.distortionPhase += delta * 0.5;

        // Gentle attraction to center
        const dxC = centerX - a.x;
        const dyC = centerY - a.y;
        const distC = Math.sqrt(dxC * dxC + dyC * dyC);

        if (distC > 40) {
          const pullStrength = 0.00012;
          a.vx += (dxC / distC) * pullStrength * distC;
          a.vy += (dyC / distC) * pullStrength * distC;
        }

        // Mouse interaction — gentle repulsion
        if (mx > 0 && my > 0) {
          const dxM = a.x - mx;
          const dyM = a.y - my;
          const distM = Math.sqrt(dxM * dxM + dyM * dyM);
          const mouseInfluence = 200;

          if (distM < mouseInfluence && distM > 1) {
            const force = smoothstep(mouseInfluence, 0, distM) * 0.15;
            a.vx += (dxM / distM) * force;
            a.vy += (dyM / distM) * force;
          }
        }

        // Orb collisions
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

            const pushForce = overlap * 0.015;
            const totalMass = a.mass + b.mass;

            a.vx -= nx * pushForce * (b.mass / totalMass);
            a.vy -= ny * pushForce * (b.mass / totalMass);
            b.vx += nx * pushForce * (a.mass / totalMass);
            b.vy += ny * pushForce * (a.mass / totalMass);

            const sep = overlap * 0.25;
            a.x -= nx * sep * (b.mass / totalMass);
            a.y -= ny * sep * (b.mass / totalMass);
            b.x += nx * sep * (a.mass / totalMass);
            b.y += ny * sep * (a.mass / totalMass);
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

        // Damping
        a.vx *= 0.994;
        a.vy *= 0.994;

        // Movement
        a.x += a.vx;
        a.y += a.vy;

        // Soft boundaries
        const margin = a.radius * 0.25;
        const bounceForce = 0.04;
        if (a.x < margin) a.vx += bounceForce;
        if (a.x > w - margin) a.vx -= bounceForce;
        if (a.y < margin) a.vy += bounceForce;
        if (a.y > h - margin) a.vy -= bounceForce;
      }

      // Remove dead orbs
      orbsRef.current = orbs.filter(o => o.opacity > 0.001 || o.targetOpacity > 0);

      // Draw orbs (back to front)
      const sortedOrbs = [...orbsRef.current].sort((a, b) => b.radius - a.radius);

      for (const orb of sortedOrbs) {
        if (orb.opacity < 0.0005) continue;

        const pulse = Math.sin(t * orb.pulseSpeed + orb.pulseOffset) * 0.06 + 1;
        const breathe = Math.sin(t * 0.3 + orb.distortionPhase) * 0.03 + 1;
        const r = orb.radius * pulse * breathe;

        // Atmospheric haze (outermost layer)
        const hazeGrad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r * 2.2);
        hazeGrad.addColorStop(0, `rgba(${orb.color}, ${orb.opacity * 0.2})`);
        hazeGrad.addColorStop(0.3, `rgba(${orb.color}, ${orb.opacity * 0.08})`);
        hazeGrad.addColorStop(0.6, `rgba(${orb.color}, ${orb.opacity * 0.02})`);
        hazeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = hazeGrad;
        ctx.fill();

        // Main glow
        const outerGrad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r * 1.3);
        outerGrad.addColorStop(0, `rgba(${orb.color}, ${orb.opacity * 0.7})`);
        outerGrad.addColorStop(0.3, `rgba(${orb.color}, ${orb.opacity * 0.35})`);
        outerGrad.addColorStop(0.6, `rgba(${orb.color}, ${orb.opacity * 0.12})`);
        outerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 1.3, 0, Math.PI * 2);
        ctx.fillStyle = outerGrad;
        ctx.fill();

        // Bright core with slight offset for depth
        const coreOffsetX = Math.sin(orb.rotationAngle) * r * 0.05;
        const coreOffsetY = Math.cos(orb.rotationAngle) * r * 0.05;
        const coreGrad = ctx.createRadialGradient(
          orb.x + coreOffsetX, orb.y + coreOffsetY, 0,
          orb.x, orb.y, r * 0.5
        );
        coreGrad.addColorStop(0, `rgba(${orb.color}, ${orb.opacity * 1.5})`);
        coreGrad.addColorStop(0.4, `rgba(${orb.color}, ${orb.opacity * 0.6})`);
        coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();

        // Inner highlight — white-ish hot center
        const highlightGrad = ctx.createRadialGradient(
          orb.x + coreOffsetX * 2, orb.y + coreOffsetY * 2, 0,
          orb.x, orb.y, r * 0.15
        );
        highlightGrad.addColorStop(0, `rgba(255, 255, 255, ${orb.opacity * 0.4})`);
        highlightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = highlightGrad;
        ctx.fill();
      }

      // === Light bridges between nearby orbs ===
      for (let i = 0; i < orbsRef.current.length; i++) {
        for (let j = i + 1; j < orbsRef.current.length; j++) {
          const a = orbsRef.current[i];
          const b = orbsRef.current[j];

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const connectDist = (a.radius + b.radius) * 2;

          if (dist < connectDist && dist > 0) {
            const strength = (1 - dist / connectDist) * Math.min(a.opacity, b.opacity) * 6;

            if (strength > 0.003) {
              const midX = (a.x + b.x) / 2;
              const midY = (a.y + b.y) / 2;
              const midColor = lerpColor(a.color, b.color, 0.5);

              // Curved connection
              const perpX = -dy / dist * 20 * Math.sin(t * 0.4 + i * 0.7);
              const perpY = dx / dist * 20 * Math.sin(t * 0.4 + i * 0.7);

              const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
              grad.addColorStop(0, `rgba(${a.color}, 0)`);
              grad.addColorStop(0.2, `rgba(${a.color}, ${strength * 0.25})`);
              grad.addColorStop(0.5, `rgba(${midColor}, ${strength * 0.4})`);
              grad.addColorStop(0.8, `rgba(${b.color}, ${strength * 0.25})`);
              grad.addColorStop(1, `rgba(${b.color}, 0)`);

              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.quadraticCurveTo(midX + perpX, midY + perpY, b.x, b.y);
              ctx.strokeStyle = grad;
              ctx.lineWidth = 1.5 + strength * 8;
              ctx.lineCap = 'round';
              ctx.stroke();

              // Bridge glow
              const glowSize = 20 + strength * 30;
              const glowGrad = ctx.createRadialGradient(
                midX + perpX * 0.3, midY + perpY * 0.3, 0,
                midX, midY, glowSize
              );
              glowGrad.addColorStop(0, `rgba(${midColor}, ${strength * 0.3})`);
              glowGrad.addColorStop(0.5, `rgba(${midColor}, ${strength * 0.1})`);
              glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

              ctx.beginPath();
              ctx.arc(midX, midY, glowSize, 0, Math.PI * 2);
              ctx.fillStyle = glowGrad;
              ctx.fill();
            }
          }
        }
      }

      // === Floating particles ===
      particlesRef.current = particlesRef.current.filter(p => {
        p.life -= delta / p.maxLife;
        if (p.life <= 0) return false;

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.998;
        p.vy *= 0.998;
        p.vy -= 0.003; // slight upward drift

        const alpha = p.opacity * smoothstep(0, 0.3, p.life) * smoothstep(1, 0.7, 1 - p.life);

        if (alpha < 0.002) return true;

        // Particle glow
        const pGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        pGlow.addColorStop(0, `rgba(${p.color}, ${alpha * 0.5})`);
        pGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = pGlow;
        ctx.fill();

        // Particle core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        ctx.fill();

        return true;
      });

      // === Stars ===
      starsRef.current.forEach((star) => {
        star.y += star.driftY;
        star.x += star.driftX;
        if (star.y < -5) { star.y = h + 5; star.x = Math.random() * w; }
        if (star.x < -5) star.x = w + 5;
        if (star.x > w + 5) star.x = -5;

        const twinkle = Math.sin(t * star.twinkleSpeed + star.offset);
        const twinkle2 = Math.sin(t * star.twinkleSpeed * 1.7 + star.offset * 2.3);
        const alpha = star.opacity * (0.35 + (twinkle * 0.4 + 0.5) * 0.5 + twinkle2 * 0.1);

        // Star color based on warmth
        let baseStarColor: string;
        if (star.warmth < 0.3) {
          baseStarColor = '160, 180, 255'; // cool blue
        } else if (star.warmth < 0.6) {
          baseStarColor = '200, 195, 255'; // neutral lavender
        } else if (star.warmth < 0.85) {
          baseStarColor = '255, 220, 200'; // warm
        } else {
          baseStarColor = '255, 200, 150'; // golden
        }

        // Influence from nearby orbs
        let starColor = baseStarColor;
        let minDist = Infinity;
        for (const orb of orbsRef.current) {
          const dx = star.x - orb.x;
          const dy = star.y - orb.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < minDist && d < orb.radius * 3) {
            minDist = d;
            const influence = smoothstep(orb.radius * 3, 0, d) * 0.5;
            starColor = lerpColor(baseStarColor, orb.color, influence);
          }
        }

        // Large stars get a glow
        if (star.size > 0.7) {
          const glow = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.size * 4
          );
          glow.addColorStop(0, `rgba(${starColor}, ${alpha * 0.15})`);
          glow.addColorStop(0.5, `rgba(${starColor}, ${alpha * 0.04})`);
          glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Star cross-shine for brightest stars
        if (star.size > 1.2 && alpha > 0.15) {
          const shineLength = star.size * 6;
          const shineAlpha = alpha * 0.08;

          ctx.save();
          ctx.globalAlpha = shineAlpha;
          ctx.strokeStyle = `rgba(${starColor}, 1)`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(star.x - shineLength, star.y);
          ctx.lineTo(star.x + shineLength, star.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(star.x, star.y - shineLength);
          ctx.lineTo(star.x, star.y + shineLength);
          ctx.stroke();
          ctx.restore();
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starColor}, ${alpha})`;
        ctx.fill();
      });

      // === Subtle vignette ===
      const vignetteGrad = ctx.createRadialGradient(
        w * 0.5, h * 0.5, Math.min(w, h) * 0.25,
        w * 0.5, h * 0.5, Math.max(w, h) * 0.75
      );
      vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, w, h);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
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
