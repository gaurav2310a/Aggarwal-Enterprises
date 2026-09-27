/**
 * Reusable QR placeholder.
 *
 * The pattern below is a *placeholder* (it does not encode a real URL).
 * To make it live, either:
 *   a) replace the <svg> with a generated QR <img src="/qr-early-access.png" />, or
 *   b) install a QR library and render the value of `href` at build time.
 *
 * The flex boards in the shop will link to this site, so the same component is
 * reused in the hero, the early-access section and the footer.
 */

const SIZE = 25;

function isFinder(row: number, col: number) {
  const inBox = (r0: number, c0: number) =>
    row >= r0 && row < r0 + 7 && col >= c0 && col < c0 + 7;
  return inBox(0, 0) || inBox(0, SIZE - 7) || inBox(SIZE - 7, 0);
}

function inQuietZone(row: number, col: number) {
  return isFinder(row, col) || (row < 8 && col < 8) || (row < 8 && col > SIZE - 9) || (row > SIZE - 9 && col < 8);
}

/** Deterministic pseudo-random matrix (stable between server and client). */
function buildMatrix() {
  let seed = 20260101;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const cells: { x: number; y: number }[] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (inQuietZone(r, c)) continue;
      if (rand() > 0.52) cells.push({ x: c, y: r });
    }
  }
  return cells;
}

const CELLS = buildMatrix();

/** All dark modules merged into one path — keeps the inlined SVG small. */
const CELLS_PATH = CELLS.map((c) => `M${c.x} ${c.y}h1v1h-1z`).join("");

export function QrCode({
  size = 132,
  className,
  label = "QR code placeholder — scan to get early access",
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={className}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
    >
      <rect width={SIZE} height={SIZE} fill="#ffffff" />
      <path d={CELLS_PATH} fill="#191512" />
      {/* finder patterns */}
      {[
        [0, 0],
        [0, SIZE - 7],
        [SIZE - 7, 0],
      ].map(([r, c]) => (
        <g key={`${r}-${c}`}>
          <rect x={c} y={r} width="7" height="7" fill="#191512" />
          <rect x={c + 1} y={r + 1} width="5" height="5" fill="#ffffff" />
          <rect x={c + 2} y={r + 2} width="3" height="3" fill="#191512" />
        </g>
      ))}
    </svg>
  );
}
