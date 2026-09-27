import type { StoreKey } from "@/lib/site";

/** Large hero visual: a stylised shopfront carrying the Aggarwal name. */
export function HeroArt() {
  return (
    <svg viewBox="0 0 400 500" role="img" aria-label="Illustration of an Aggarwal shopfront">
      <rect width="400" height="500" fill="#f1e9df" />
      {/* shop drawn anchored to its base line so the scaling never breaks the ground */}
      <g transform="translate(200 368) scale(1.14) translate(-200 -368)">
        <path d="M48 168h304l-22-46H70z" fill="#191512" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path key={i} d={`M${70 + i * 43.4} 122l-22 46h30l16-46z`} fill="#b8531f" opacity="0.9" />
      ))}
      <rect x="62" y="168" width="276" height="200" fill="#fff" stroke="#191512" strokeWidth="4" />
      <rect x="86" y="196" width="228" height="66" fill="#f6efe6" stroke="#191512" strokeWidth="3" />
      <text
        x="200"
        y="226"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="22"
        letterSpacing="5"
        fill="#191512"
      >
        AGGARWAL
      </text>
      <text
        x="200"
        y="248"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="11"
        letterSpacing="6"
        fill="#b8531f"
      >
        HOUSE
      </text>
      <rect x="86" y="284" width="98" height="84" fill="#f6efe6" stroke="#191512" strokeWidth="3" />
      <rect x="216" y="284" width="98" height="84" fill="#f6efe6" stroke="#191512" strokeWidth="3" />
      <path d="M120 368v-46l16-12 16 12v46" fill="none" stroke="#191512" strokeWidth="3" />
      <ellipse cx="266" cy="336" rx="26" ry="10" fill="none" stroke="#191512" strokeWidth="3" />
      <path d="M240 336c0 18 12 30 26 30s26-12 26-30" fill="none" stroke="#191512" strokeWidth="3" />
      </g>
      <rect x="0" y="368" width="400" height="6" fill="#191512" />
      <rect x="0" y="374" width="400" height="126" fill="#e7ded1" />
      <path d="M0 430h400" stroke="#191512" strokeOpacity="0.12" strokeWidth="3" />
      <path
        d="M60 374v56M140 374v56M260 374v56M340 374v56"
        stroke="#191512"
        strokeOpacity="0.08"
        strokeWidth="3"
      />
    </svg>
  );
}

/** Store-card background art (soft, low contrast). */
export function StoreArt({ store }: { store: StoreKey }) {
  const isFashion = store === "fashion";
  return (
    <svg
      viewBox="0 0 600 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id={`fade-${store}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={isFashion ? "#f7efe6" : "#f4f1ea"} />
          <stop offset="100%" stopColor={isFashion ? "#efdccd" : "#e6e2d8"} />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill={`url(#fade-${store})`} />
      {isFashion ? (
        <g stroke="#191512" strokeOpacity="0.16" strokeWidth="3" fill="none">
          <path d="M60 400 300 90l240 310" />
          <path d="M120 400 300 150l180 250" />
          <path d="M300 90v310" />
          <circle cx="300" cy="230" r="120" strokeOpacity="0.1" />
        </g>
      ) : (
        <g stroke="#191512" strokeOpacity="0.16" strokeWidth="3" fill="none">
          <rect x="120" y="110" width="360" height="230" rx="10" />
          <path d="M120 190h360M120 260h360" />
          <circle cx="300" cy="110" r="8" fill="#191512" fillOpacity="0.16" />
          <circle cx="180" cy="190" r="8" fill="#191512" fillOpacity="0.16" />
          <circle cx="420" cy="260" r="8" fill="#191512" fillOpacity="0.16" />
        </g>
      )}
    </svg>
  );
}

/** "Photograph-style" visual for the store -> online story section. */
export function StorefrontPhoto() {
  return (
    <svg
      viewBox="118 54 404 323"
      role="img"
      aria-label="Illustration of a modernised traditional Indian market shop"
    >
      <rect width="640" height="512" fill="#efe7db" />
      <rect y="330" width="640" height="182" fill="#ddd2c2" />
      <rect x="20" y="150" width="120" height="180" fill="#e3d8c8" stroke="#c9bba7" />
      <rect x="500" y="150" width="120" height="180" fill="#e3d8c8" stroke="#c9bba7" />
      <rect x="160" y="96" width="320" height="236" fill="#fff" stroke="#191512" strokeWidth="4" />
      <rect x="160" y="96" width="320" height="34" fill="#191512" />
      <text
        x="320"
        y="118"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="14"
        letterSpacing="3"
        fill="#f1e9df"
      >
        Aggarwal's House
      </text>
      <rect x="184" y="152" width="272" height="112" fill="#f7f1e8" stroke="#191512" strokeWidth="3" />
      <path d="M320 152v112" stroke="#191512" strokeWidth="3" />
      <path d="M196 176h108" stroke="#191512" strokeWidth="3" />
      <path d="M196 194c6 26 8 40 8 56" fill="none" stroke="#b8531f" strokeWidth="6" opacity="0.5" />
      <path d="M444 194c-6 26-8 40-8 56" fill="none" stroke="#b8531f" strokeWidth="6" opacity="0.35" />
      <path d="M336 232h108M336 200h108" stroke="#191512" strokeWidth="2" opacity="0.45" />
      <circle cx="360" cy="190" r="9" fill="none" stroke="#191512" strokeWidth="2" opacity="0.5" />
      <rect x="384" y="180" width="18" height="18" rx="3" fill="none" stroke="#191512" strokeWidth="2" opacity="0.5" />
      <path d="M420 198v-16h16v16" fill="none" stroke="#191512" strokeWidth="2" opacity="0.5" />
      <rect x="252" y="264" width="136" height="68" fill="#f1e9df" stroke="#191512" strokeWidth="3" />
      <path d="M320 264v68" stroke="#191512" strokeWidth="2" opacity="0.5" />
      <circle cx="310" cy="300" r="3" fill="#191512" />
      <circle cx="330" cy="300" r="3" fill="#191512" />
      <path d="M0 332h640" stroke="#191512" strokeWidth="4" />
      <ellipse cx="320" cy="348" rx="200" ry="14" fill="#191512" opacity="0.08" />
      <rect x="292" y="286" width="24" height="42" rx="4" fill="#b8531f" opacity="0.85" />
      <rect x="296" y="292" width="16" height="28" rx="2" fill="#f7f1e8" />
    </svg>
  );
}
