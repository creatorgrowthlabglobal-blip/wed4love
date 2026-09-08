import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";

interface HeartQRProps {
  data: string;
  size?: number;
  className?: string;
}

const ROSE_DARK = "#B8446A";
const ROSE_LIGHT = "#E86BA0";
const CREAM = "#FFF3E8";

const isFinderModule = (row: number, col: number, size: number) =>
  (row < 7 && col < 7) ||
  (row < 7 && col >= size - 7) ||
  (row >= size - 7 && col < 7);

const buildMatrix = (data: string): boolean[][] | null => {
  try {
    const qr = QRCode.create(data, { errorCorrectionLevel: "H" });
    const size = qr.modules.size;
    const bits = qr.modules.data as Uint8Array;
    const matrix: boolean[][] = [];
    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) row.push(bits[r * size + c] === 1);
      matrix.push(row);
    }
    return matrix;
  } catch {
    return null;
  }
};

const HeartQR = ({ data, size = 240, className }: HeartQRProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [ready, setReady] = useState(false);
  const matrix = useMemo(() => buildMatrix(data), [data]);

  useEffect(() => {
    setReady(!!matrix);
  }, [matrix]);

  if (!matrix) {
    return (
      <div
        className={className}
        style={{ width: size, height: size, background: CREAM, borderRadius: 16 }}
      />
    );
  }

  const modules = matrix.length;
  const quiet = 2;
  const grid = modules + quiet * 2;
  const cell = size / grid;

  const heartPath = (cx: number, cy: number, s: number) => {
    const w = s * 0.9;
    const h = s * 0.9;
    const x = cx - w / 2;
    const y = cy - h / 2;
    return `M ${cx},${y + h * 0.9}
      C ${x - w * 0.05},${y + h * 0.55}
        ${x},${y + h * 0.15}
        ${cx - w * 0.22},${y + h * 0.05}
      C ${cx - w * 0.05},${y - h * 0.02}
        ${cx},${y + h * 0.18}
        ${cx},${y + h * 0.32}
      C ${cx},${y + h * 0.18}
        ${cx + w * 0.05},${y - h * 0.02}
        ${cx + w * 0.22},${y + h * 0.05}
      C ${x + w},${y + h * 0.15}
        ${x + w * 1.05},${y + h * 0.55}
        ${cx},${y + h * 0.9} Z`;
  };

  const centerLogoRadius = cell * 3.2;
  const centerX = size / 2;
  const centerY = size / 2;

  const hearts: string[] = [];
  const finders: { x: number; y: number; size: number }[] = [];

  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (!matrix[r][c]) continue;
      const cx = (c + quiet + 0.5) * cell;
      const cy = (r + quiet + 0.5) * cell;

      const dx = cx - centerX;
      const dy = cy - centerY;
      if (Math.sqrt(dx * dx + dy * dy) < centerLogoRadius) continue;

      if (isFinderModule(r, c, modules)) continue;

      hearts.push(heartPath(cx, cy, cell * 1.05));
    }
  }

  const finderCoords = [
    { r: 0, c: 0 },
    { r: 0, c: modules - 7 },
    { r: modules - 7, c: 0 },
  ];
  for (const { r, c } of finderCoords) {
    finders.push({
      x: (c + quiet) * cell,
      y: (r + quiet) * cell,
      size: cell * 7,
    });
  }

  return (
    <svg
      ref={svgRef}
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", opacity: ready ? 1 : 0, transition: "opacity 0.4s" }}
    >
      <defs>
        <linearGradient id="heartQrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={ROSE_LIGHT} />
          <stop offset="100%" stopColor={ROSE_DARK} />
        </linearGradient>
        <linearGradient id="heartQrLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F27AAB" />
          <stop offset="100%" stopColor="#A83158" />
        </linearGradient>
      </defs>

      <rect width={size} height={size} fill={CREAM} rx={size * 0.08} />

      {finders.map((f, i) => {
        const outer = f.size;
        const mid = f.size * (5 / 7);
        const inner = f.size * (3 / 7);
        const midOffset = f.size * (1 / 7);
        const innerOffset = f.size * (2 / 7);
        return (
          <g key={`finder-${i}`}>
            <rect
              x={f.x}
              y={f.y}
              width={outer}
              height={outer}
              rx={outer * 0.28}
              fill="url(#heartQrGrad)"
            />
            <rect
              x={f.x + midOffset}
              y={f.y + midOffset}
              width={mid}
              height={mid}
              rx={mid * 0.28}
              fill={CREAM}
            />
            <rect
              x={f.x + innerOffset}
              y={f.y + innerOffset}
              width={inner}
              height={inner}
              rx={inner * 0.28}
              fill="url(#heartQrGrad)"
            />
          </g>
        );
      })}

      <path d={hearts.join(" ")} fill="url(#heartQrGrad)" />

      <g>
        <circle
          cx={centerX}
          cy={centerY}
          r={centerLogoRadius}
          fill={CREAM}
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={centerLogoRadius * 0.92}
          fill="none"
          stroke="url(#heartQrLogoGrad)"
          strokeWidth={cell * 0.35}
        />
        <path
          d={heartPath(centerX, centerY, centerLogoRadius * 1.15)}
          fill="url(#heartQrLogoGrad)"
        />
      </g>
    </svg>
  );
};

export default HeartQR;
