"use client";

import { useEffect } from "react";
import { trackCta, trackEvent } from "@/lib/analytics";
import { captureCampaign, trackCampaignView } from "@/lib/campaign";

/**
 * One delegated listener for the whole page: any element carrying
 * `data-cta` is reported with its id, label, section and store source.
 * Mounted once in the root layout.
 */
export function Analytics() {
  useEffect(() => {
    trackEvent("page_view", { page_path: window.location.pathname });

    // Remember the QR / campaign parameters for this visitor session.
    const campaign = captureCampaign();
    trackCampaignView(campaign);

    const onClick = (event: MouseEvent) => {
      const el = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-cta]");
      if (!el) return;
      trackCta({
        cta: el.dataset.cta ?? "unknown",
        label: el.dataset.ctaLabel ?? el.textContent?.trim().slice(0, 60) ?? "",
        section: el.dataset.section ?? "unknown",
        store:
          (el.dataset.store as "fashion" | "homeware" | "general" | undefined) ?? "general",
        location: el.dataset.location ?? "unknown",
      });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
