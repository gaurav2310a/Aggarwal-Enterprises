const TONES: Record<"fashion" | "homeware", { bg: string; bg2: string }> = {
  fashion: { bg: "#f2e7dd", bg2: "#e7d6c6" },
  homeware: { bg: "#eeeae1", bg2: "#e2ddd2" },
};

export type ArtKind =
  | "mens"
  | "womens"
  | "kids"
  | "casual"
  | "cookware"
  | "utensils"
  | "appliances"
  | "essentials";

/* --- Individual line illustrations (400 x 500 canvas) -------------------- */

function Mens() {
  return (
    <g fill="none" stroke="#191512" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
      <path d="M152 146 200 124l48 22 54 44-38 30-14-24v162H150V196l-14 24-38-30z" fill="#fff" />
      <path d="M178 132c2 18 10 28 22 28s20-10 22-28" />
      <path d="M200 160v200" strokeWidth="2.5" />
      <circle cx="200" cy="200" r="3.4" fill="#b8531f" stroke="none" />
      <circle cx="200" cy="248" r="3.4" fill="#b8531f" stroke="none" />
    </g>
  );
}

function Womens() {
  return (
    <g fill="none" stroke="#191512" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
      <path d="M164 140h72l14 62 54 158H96l54-158z" fill="#fff" />
      <path d="M150 234h100" />
      <path d="M164 140c6 20 18 30 36 30s30-10 36-30" />
      <path d="M124 360h152" strokeWidth="2.5" strokeDasharray="2 10" />
    </g>
  );
}

function Kids() {
  return (
    <g fill="none" stroke="#191512" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
      <path d="M158 172 200 152l42 20 44 34-30 26-12-18v126h-88V214l-12 18-30-26z" fill="#fff" />
      <path d="M178 160c3 14 10 22 22 22s19-8 22-22" />
      <circle cx="200" cy="272" r="22" fill="#b8531f" fillOpacity="0.14" />
      <path d="M192 272l6 6 12-13" stroke="#b8531f" />
    </g>
  );
}

function Casual() {
  return (
    <g fill="none" stroke="#191512" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
      <path d="M154 164 200 142l46 22 48 38-32 30-16-22v134H154V210l-16 22-32-30z" fill="#fff" />
      <path d="M180 150c4 16 9 24 20 24s16-8 20-24" />
      <path d="M154 300h92" strokeWidth="2.5" />
      <path d="M120 404h160" strokeWidth="3" strokeDasharray="1 14" />
    </g>
  );
}

function Cookware() {
  return (
    <g fill="none" stroke="#191512" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx="200" cy="286" rx="96" ry="26" fill="#fff" />
      <path d="M104 286c0 44 43 74 96 74s96-30 96-74" fill="#fff" />
      <ellipse cx="200" cy="286" rx="62" ry="16" />
      <path d="M296 274l62-26" strokeWidth="9" strokeLinecap="round" />
      <path d="M146 226c8-26 32-40 54-40s46 14 54 40" />
      <circle cx="200" cy="176" r="11" fill="#b8531f" stroke="none" />
    </g>
  );
}

function Utensils() {
  return (
    <g fill="none" stroke="#191512" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
      <path d="M132 150v66a20 20 0 0 0 40 0v-66" fill="#fff" />
      <path d="M152 150v240" strokeWidth="7" strokeLinecap="round" />
      <path d="M232 132c22 0 38 18 38 42v26h-76v-26c0-24 16-42 38-42Z" fill="#fff" />
      <path d="M232 200v190" strokeWidth="7" strokeLinecap="round" />
      <path d="M292 214h52" strokeWidth="4" />
      <path d="M318 214v176" strokeWidth="7" strokeLinecap="round" />
      <path d="M120 400h180" strokeWidth="3" strokeDasharray="1 14" />
    </g>
  );
}

function Appliances() {
  return (
    <g fill="none" stroke="#191512" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
      <path d="M132 208h136a26 26 0 0 1 26 26v128a26 26 0 0 1-26 26H132a26 26 0 0 1-26-26V234a26 26 0 0 1 26-26Z" fill="#fff" />
      <path d="M106 268h188" />
      <path d="M232 268v120" />
      <circle cx="278" cy="316" r="20" />
      <path d="M278 296v-14" />
      <path d="M152 150h96" strokeWidth="7" strokeLinecap="round" />
      <path d="M200 150v-28" />
      <circle cx="200" cy="112" r="10" fill="#b8531f" stroke="none" />
    </g>
  );
}

function Essentials() {
  return (
    <g fill="none" stroke="#191512" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
      <rect x="112" y="238" width="176" height="140" rx="14" fill="#fff" />
      <rect x="132" y="212" width="136" height="34" rx="10" fill="#fff" />
      <path d="M132 300h136" strokeWidth="2.5" />
      <path d="M200 212v-30" />
      <path d="M176 182h48" strokeWidth="7" strokeLinecap="round" />
      <rect x="238" y="160" width="64" height="56" rx="10" fill="#fff" />
      <path d="M258 160v-18h24v18" />
      <path d="M100 400h200" strokeWidth="3" strokeDasharray="1 14" />
    </g>
  );
}

const ART: Record<ArtKind, () => React.ReactElement> = {
  mens: Mens,
  womens: Womens,
  kids: Kids,
  casual: Casual,
  cookware: Cookware,
  utensils: Utensils,
  appliances: Appliances,
  essentials: Essentials,
};

export const storeForKind = (kind: ArtKind): "fashion" | "homeware" =>
  kind === "mens" || kind === "womens" || kind === "kids" || kind === "casual"
    ? "fashion"
    : "homeware";

/** Product-image placeholder. Swap for a real <img> when photography is ready. */
export function ProductArt({ kind, label }: { kind: ArtKind; label: string }) {
  const tone = TONES[storeForKind(kind)];
  const Art = ART[kind];

  return (
    <svg viewBox="0 0 400 500" role="img" aria-label={`${label} — illustrative placeholder`}>
      <rect width="400" height="500" fill={tone.bg} />
      <circle cx="200" cy="250" r="168" fill={tone.bg2} opacity="0.75" />
      <path d="M0 404h400" stroke="#191512" strokeOpacity="0.1" strokeWidth="2" />
      <Art />
    </svg>
  );
}
