import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'circle' | 'square' | 'triangle';
}

interface ConfettiEffectProps {
  trigger: number; // Increment this to fire a burst
  x?: number; // Optional custom screen X percentage (0-100) or pixels
  y?: number; // Optional custom screen Y percentage (0-100) or pixels
}

const PASTEL_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#FF9F43', // Orange
  '#10AC84', // Emerald
  '#54A0FF', // Sky blue
  '#9B5DE5', // Purple
  '#F15BB5', // Pink
];

export function ConfettiEffect({ trigger, x, y }: ConfettiEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const spawnX = x !== undefined ? (x / 100) * rect.width : rect.width / 2;
    const spawnY = y !== undefined ? (y / 100) * rect.height : rect.height / 2;

    const count = 70; // Shoot 70 colorful sparkles per burst!
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      const shapeRand = Math.random();

      let shape: 'circle' | 'square' | 'triangle' = 'circle';
      if (shapeRand > 0.6) shape = 'square';
      else if (shapeRand > 0.3) shape = 'triangle';

      newParticles.push({
        x: spawnX,
        y: spawnY,
        radius: 4 + Math.random() * 8,
        color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (3 + Math.random() * 4), // Shoot slightly upward
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        shape,
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];
  }, [trigger, x, y]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // Gravity
        p.vx *= 0.98; // Drag
        p.rotation += p.rotationSpeed;

        // Fading is simulated by smaller size and color
        p.radius -= 0.08;

        if (p.y > canvas.height || p.radius <= 0.5 || p.x < 0 || p.x > canvas.width) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        ctx.beginPath();
        if (p.shape === 'circle') {
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        } else if (p.shape === 'square') {
          const side = p.radius * 2;
          ctx.rect(-side / 2, -side / 2, side, side);
        } else if (p.shape === 'triangle') {
          const side = p.radius * 2.2;
          ctx.moveTo(0, -side / 2);
          ctx.lineTo(side / 2, side / 2);
          ctx.lineTo(-side / 2, side / 2);
          ctx.closePath();
        }
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      id="confetti-canvas"
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 w-full h-full"
    />
  );
}
