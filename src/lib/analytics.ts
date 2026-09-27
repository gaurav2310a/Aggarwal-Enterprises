/**
 * Lightweight, dependency-free analytics bridge.
 *
 * Every CTA / link on the site carries `data-cta` and `data-store` attributes.
 * A single delegated listener (see <Analytics />) forwards clicks to:
 *   - window.dataLayer  (works with Google Tag Manager out of the box)
 *   - window.gtag      (works with a directly-installed GA4 gtag snippet)
 *   - window.plausible / window.umami / window.clarity (optional)
 *
 * To connect Google Analytics, add the GA4 snippet to
 * src/app/layout.tsx (see comment there) and you are done — no code changes.
 */

export type StoreSource = "fashion" | "homeware" | "general";

export type CtaEvent = {
  cta: string;
  label: string;
  section: string;
  store: StoreSource;
  location: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
    umami?: { track: (name: string, data: Record<string, unknown>) => void };
    clarity?: (event: string) => void;
  }
}

function payload(e: CtaEvent) {
  return {
    event: "cta_click",
    cta_id: e.cta,
    cta_label: e.label,
    cta_section: e.section,
    store: e.store,
    link_location: e.location,
  };
}

export function trackCta(e: CtaEvent) {
  if (typeof window === "undefined") return;
  const data = payload(e);
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(data);
    window.gtag?.("event", "cta_click", data);
    window.plausible?.("CTA Click", { props: data });
    window.umami?.track("cta_click", data);
  } catch {
    /* analytics must never break the page */
  }
}

export function trackEvent(name: string, data: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...data });
    window.gtag?.("event", name, data);
  } catch {
    /* noop */
  }
}
