import { useEffect, useRef, useMemo } from 'react';

// SIGNAL pattern - 7 rows (GitHub days) by width to spell SIGNAL
const SIGNAL_PATTERN = [
  '  ███  █  ███  █   █  ███  █      ',
  ' █     █ █     ██  █ █   █ █      ',
  '  ██   █ █  ██ █ █ █ █████ █      ',
  '    █  █ █   █ █  ██ █   █ █      ',
  ' ███   █  ███  █   █ █   █ █████  ',
];

interface Cell {
  col: number;
  row: number;
  x: number;
  y: number;
  char: string;
  alpha: number;
  targetAlpha: number;
  delay: number;
  isSignal: boolean;
  baseIntensity: number;
  phase: number;
}

const ASCII_CHARS = ['·', ':', '░', '▒', '▓', '█', '0', '1'];

export default function AsciiGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const cellsRef = useRef<Cell[]>([]);
  const startTimeRef = useRef<number>(0);

  const gridConfig = useMemo(() => {
    const cols = 52;
    const rows = 7;
    const cellSize = 14;
    const gap = 3;
    return { cols, rows, cellSize, gap };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { cols, rows, cellSize, gap } = gridConfig;
    const totalWidth = cellSize + gap;

    const width = cols * totalWidth;
    const height = rows * totalWidth;
    canvas.width = width;
    canvas.height = height;

    // Initialize cells
    const cells: Cell[] = [];
    const patternOffset = 9; // Center SIGNAL in the grid

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const patternCol = col - patternOffset;
        const isSignal =
          row >= 1 &&
          row <= 5 &&
          patternCol >= 0 &&
          patternCol < SIGNAL_PATTERN[0].length &&
          SIGNAL_PATTERN[row - 1]?.[patternCol] === '█';

        const baseIntensity = isSignal
          ? 1.0
          : Math.random() < 0.7 ? Math.random() * 0.5 : 0;

        cells.push({
          col,
          row,
          x: col * totalWidth,
          y: row * totalWidth,
          char: ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)],
          alpha: 0,
          targetAlpha: baseIntensity,
          delay: col * 30 + row * 20 + Math.random() * 100,
          isSignal,
          baseIntensity,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    cellsRef.current = cells;
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const time = currentTime * 0.001; // Convert to seconds

      ctx.clearRect(0, 0, width, height);

      // Wave parameters
      const waveSpeed = 0.8;
      const waveLength = 0.15;
      const waveAmplitude = 0.25;

      for (const cell of cellsRef.current) {
        if (elapsed < cell.delay) continue;

        // Fade in
        if (cell.alpha < cell.targetAlpha) {
          cell.alpha = Math.min(cell.alpha + 0.03, cell.targetAlpha);
        }

        // Calculate wave effect - ripples from center-left to right
        const waveX = cell.col * waveLength - time * waveSpeed;
        const waveY = cell.row * waveLength * 0.5;
        const wave = Math.sin(waveX + waveY + cell.phase) * waveAmplitude;

        // Pulse effect that travels across the grid
        const pulse = 0.8 + wave * 0.2;

        let r: number, g: number, b: number, alpha: number;

        if (cell.isSignal) {
          // SIGNAL burns bright - intense cyan/white glow
          const signalPulse = 0.85 + Math.sin(time * 2 + cell.col * 0.1) * 0.15;
          const burn = signalPulse * pulse;

          // White-hot core fading to cyan
          r = Math.floor(100 + 155 * burn);
          g = Math.floor(220 + 35 * burn);
          b = 255;
          alpha = cell.alpha * burn;

          // Draw glow layer first
          ctx.shadowColor = `rgba(0, 220, 255, ${0.9 * burn})`;
          ctx.shadowBlur = 12 + 8 * burn;
        } else {
          // Background cells - dim blue with wave
          const intensity = cell.baseIntensity * pulse;
          r = Math.floor(5 + 15 * intensity);
          g = Math.floor(30 + 50 * intensity);
          b = Math.floor(80 + 70 * intensity);
          alpha = cell.alpha * pulse * 0.7;
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.font = `${cellSize}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Occasional character change for Matrix effect
        if (Math.random() < 0.005) {
          cell.char = ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];
        }

        ctx.fillText(cell.char, cell.x + cellSize / 2, cell.y + cellSize / 2);

        // Extra bright pass for SIGNAL
        if (cell.isSignal) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
          ctx.fillText(cell.char, cell.x + cellSize / 2, cell.y + cellSize / 2);
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
        margin: '0 auto',
      }}
    />
  );
}
