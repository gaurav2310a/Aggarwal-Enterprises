/**
 * Campaign tracking for the shop QR codes and printed links.
 *
 * A visitor arrives with e.g.
 *   /?utm_source=qr_code&utm_medium=scanner&utm_campaign=comming_soon_scanner
 * We read it once, remember it for the session, and hand it to the API with the
 * lead — so /admin can show exactly which board, poster or counter produced it.
 */

export type Campaign = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
  device?: string;
  page?: string;
  /** True when the visit came from a tracked link (QR / poster). */
  tracked: boolean;
};

const KEY = "aggarwal_campaign";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

function detectDevice(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)))
    return "tablet";
  if (/Mobi|iPhone|Android/i.test(ua)) return "mobile";
  return "desktop";
}

function readParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const out: Record<string, string> = {};
  new URLSearchParams(window.location.search).forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

/** Called once on page load: merges any UTM params into the stored campaign. */
export function captureCampaign(): Campaign {
  const empty: Campaign = { tracked: false, device: detectDevice() };
  if (typeof window === "undefined") return empty;

  const params = readParams();
  const hasUtm = UTM_KEYS.some((k) => params[k]);
  let stored: Partial<Campaign> = {};

  try {
    stored = JSON.parse(window.sessionStorage.getItem(KEY) ?? "{}");
  } catch {
    /* ignore */
  }

  const next: Campaign = {
    utmSource: params.utm_source || stored.utmSource,
    utmMedium: params.utm_medium || stored.utmMedium,
    utmCampaign: params.utm_campaign || stored.utmCampaign,
    utmTerm: params.utm_term || stored.utmTerm,
    utmContent: params.utm_content || stored.utmContent,
    referrer: document.referrer && !document.referrer.includes(window.location.host)
      ? document.referrer
      : stored.referrer,
    device: detectDevice(),
    page: window.location.pathname + window.location.search.slice(0, 100),
    tracked: hasUtm || Boolean(stored.utmSource),
  };

  // A QR scan may land on an anchor (#early-access) — normalise the stored page
  // to the pathname so the admin list stays readable.
  if (next.tracked) {
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  return next;
}

/** The campaign to attach to a lead (empty object if never tracked). */
export function getCampaign(): Partial<Campaign> {
  if (typeof window === "undefined") return {};
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(KEY) ?? "{}");
    return stored?.tracked ? stored : {};
  } catch {
    return {};
  }
}

/** Also fires a page_view for GA4/GTM so the analytics side matches. */
export function trackCampaignView(campaign: Campaign) {
  if (typeof window === "undefined") return;
  try {
    const dataLayer = (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer;
    dataLayer?.push({
      event: "campaign_view",
      utm_source: campaign.utmSource ?? "(direct)",
      utm_medium: campaign.utmMedium ?? "(none)",
      utm_campaign: campaign.utmCampaign ?? "(none)",
      device: campaign.device,
    });
  } catch {
    /* ignore */
  }
}
