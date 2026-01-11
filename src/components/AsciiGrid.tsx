import { useEffect, useRef, useMemo } from 'react';

// SIGNAL pattern - 5 rows for the letters
const SIGNAL_PATTERN = [
  ' ███  █  ███  █   █  ███  █     ',
  '█     █ █     ██  █ █   █ █     ',
  ' ██   █ █  ██ █ █ █ █████ █     ',
  '   █  █ █   █ █  ██ █   █ █     ',
  '███   █  ███  █   █ █   █ █████ ',
];

const PATTERN_WIDTH = SIGNAL_PATTERN[0].length;

export default function AsciiGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const gridConfig = useMemo(() => {
    const cellSize = 10;
    const gap = 2;
    return { cellSize, gap };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { cellSize, gap } = gridConfig;
    const totalWidth = cellSize + gap;

    const width = PATTERN_WIDTH * totalWidth;
    const height = SIGNAL_PATTERN.length * totalWidth;
    canvas.width = width;
    canvas.height = height;

    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const time = currentTime * 0.001;

      ctx.clearRect(0, 0, width, height);

      // Draw glowing brightness mask for SIGNAL
      for (let row = 0; row < SIGNAL_PATTERN.length; row++) {
        for (let col = 0; col < PATTERN_WIDTH; col++) {
          if (SIGNAL_PATTERN[row][col] !== ' ') {
            const x = col * totalWidth + cellSize / 2;
            const y = row * totalWidth + cellSize / 2;

            // Pulsing intensity
            const pulse = 0.7 + Math.sin(time * 2 + col * 0.1 + row * 0.2) * 0.3;

            // Create radial gradient for soft glow
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, cellSize * 1.2);
            gradient.addColorStop(0, `rgba(200, 255, 255, ${0.9 * pulse})`);
            gradient.addColorStop(0.5, `rgba(100, 220, 255, ${0.5 * pulse})`);
            gradient.addColorStop(1, `rgba(0, 150, 255, 0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(x - cellSize, y - cellSize, cellSize * 2, cellSize * 2);
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [gridConfig]);

  return (
    <canvas
      ref={canvasRef}
      className="ascii-grid"
      style={{
        display: 'block',
      }}
    />
  );
}
