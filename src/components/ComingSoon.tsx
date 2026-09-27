"use client";

import { useEffect, useState } from "react";
import { LAUNCH_DATE_ISO } from "@/lib/site";
import { CheckIcon } from "./Icons";

type Left = { d: number; h: number; m: number; s: number; passed: boolean };

function diff(target: number): Left {
  const ms = target - Date.now();
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0, passed: true };
  return {
    d: Math.floor(ms / 86_400_000),
    h: Math.floor(ms / 3_600_000) % 24,
    m: Math.floor(ms / 60_000) % 60,
    s: Math.floor(ms / 1000) % 60,
    passed: false,
  };
}

/** Countdown placeholder. Server renders dashes so there is no hydration mismatch. */
export function Countdown() {
  const target = new Date(LAUNCH_DATE_ISO).getTime();
  const [left, setLeft] = useState<Left | null>(null);

  useEffect(() => {
    setLeft(diff(target));
    const id = setInterval(() => setLeft(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const units: [string, number | null][] = [
    ["Days", left?.d ?? null],
    ["Hours", left?.h ?? null],
    ["Minutes", left?.m ?? null],
    ["Seconds", left?.s ?? null],
  ];

  if (left?.passed) {
    return (
      <p className="pill" style={{ padding: "14px 20px" }}>
        We are live — thank you for waiting
      </p>
    );
  }

  return (
    <div>
      <div className="countdown" aria-live="off">
        {units.map(([label, value]) => (
          <div className="countdown__unit" key={label}>
            <span className="countdown__num">
              {value === null ? "--" : String(value).padStart(2, "0")}
            </span>
            <span className="countdown__label">{label}</span>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 14, fontSize: 13, color: "var(--ink-3)" }}>
        Launch date to be announced — timings are indicative.
      </p>
    </div>
  );
}

const SOON_POINTS = [
  "Browse products by category, size and price",
  "Discover new arrivals as soon as they land in store",
  "See festive and seasonal offers before they go live",
  "Place an order from home and collect from the shop",
];

export function ComingSoon() {
  return (
    <section className="section section--tint" id="coming-soon">
      <div className="shell soon-wrap">
        <div>
          <span className="eyebrow">Coming soon</span>
          <h2 style={{ fontSize: "clamp(30px, 5vw, 50px)", marginTop: 16 }}>
            Something New Is Coming.
          </h2>
          <p style={{ marginTop: 20, color: "var(--ink-2)", maxWidth: "54ch" }}>
            Soon you will be able to browse products, discover new arrivals, see our offers and
            order from home — all from the same Aggarwal stores you already know.
          </p>

          <ul className="soon-list">
            {SOON_POINTS.map((p) => (
              <li key={p}>
                <CheckIcon size={18} />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <Countdown />
      </div>
    </section>
  );
}
