import { useEffect, useRef, useMemo } from 'react';

// SIGNAL pattern - block ASCII art font
const SIGNAL_PATTERN = [
  '███████╗██╗ ██████╗ ███╗   ██╗ █████╗ ██╗     ',
  '██╔════╝██║██╔════╝ ████╗  ██║██╔══██╗██║     ',
  '███████╗██║██║  ███╗██╔██╗ ██║███████║██║     ',
  '╚════██║██║██║   ██║██║╚██╗██║██╔══██║██║     ',
  '███████║██║╚██████╔╝██║ ╚████║██║  ██║███████╗',
  '╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝',
];

const PATTERN_WIDTH = SIGNAL_PATTERN[0].length;

interface Cell {
  col: number;
  row: number;
  x: number;
  y: number;
  char: string;
  alpha: number;
  delay: number;
  phase: number;
}

export default function AsciiGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const cellsRef = useRef<Cell[]>([]);
  const startTimeRef = useRef<number>(0);

  const gridConfig = useMemo(() => {
    const cellSize = 11;
    const gap = 0;
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

    // Only create cells for SIGNAL letters
    const cells: Cell[] = [];

    for (let row = 0; row < SIGNAL_PATTERN.length; row++) {
      for (let col = 0; col < PATTERN_WIDTH; col++) {
        const char = SIGNAL_PATTERN[row][col];
        if (char !== ' ') {
          cells.push({
            col,
            row,
            x: col * totalWidth,
            y: row * totalWidth,
            char: char,
            alpha: 1,
            delay: 0,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    }

    cellsRef.current = cells;
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const time = currentTime * 0.001;

      ctx.clearRect(0, 0, width, height);

      for (const cell of cellsRef.current) {
        // Pulsing glow
        const pulse = 0.85 + Math.sin(time * 2.5 + cell.col * 0.15 + cell.phase) * 0.15;
        const burn = pulse * cell.alpha;

        // White-hot cyan
        const r = Math.floor(150 + 105 * burn);
        const g = Math.floor(240 + 15 * burn);
        const b = 255;

        ctx.shadowColor = `rgba(0, 255, 255, ${0.9 * burn})`;
        ctx.shadowBlur = 8 + 6 * burn;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${burn})`;
        ctx.font = `bold ${cellSize}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillText(cell.char, cell.x + cellSize / 2, cell.y + cellSize / 2);

        // Extra white core
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(255, 255, 255, ${burn * 0.4})`;
        ctx.fillText(cell.char, cell.x + cellSize / 2, cell.y + cellSize / 2);
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
