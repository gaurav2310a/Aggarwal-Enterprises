"use client";

import { useState } from "react";
import { CONTACT, MAP_EMBED_SRC } from "@/lib/site";
import { PinIcon } from "./Icons";

/**
 * Embedded Google Map of the physical shop, shown in the footer.
 * Lazy-loaded so it never slows down the first paint of the coming-soon page.
 */
export function StoreMap() {
  const [ready, setReady] = useState(false);

  return (
    <section className="footer-map" id="store-map" aria-label="Store location map">
      <div className="footer-map__info">
        <span className="eyebrow">Visit the store</span>
        <h3>Come see us in person</h3>
        <p>
          The online store is still being built, but the shop is open as usual. Come in, browse and
          tell us what you would like to see online first.
        </p>

        <p className="footer-map__address">
          <PinIcon size={18} />
          <span>
            {CONTACT.addressLines.map((line) => (
              <span key={line} style={{ display: "block" }}>
                {line}
              </span>
            ))}
          </span>
        </p>

        <div className="footer-map__actions">
          <a
            className="btn btn--ink"
            href={CONTACT.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cta="footer_directions"
            data-cta-label="Footer directions"
            data-store="general"
            data-section="footer_map"
          >
            Get directions
          </a>
          <a
            className="btn btn--outline"
            href={`tel:${CONTACT.phoneDial}`}
            data-cta="footer_call"
            data-cta-label="Footer call store"
            data-store="general"
            data-section="footer_map"
          >
            Call the shop
          </a>
        </div>
      </div>

      <div className="footer-map__frame">
        {!ready && (
          <span className="footer-map__placeholder">
            <PinIcon size={22} />
            <strong>Loading map…</strong>
            <a href={CONTACT.mapUrl} target="_blank" rel="noopener noreferrer">
              Open in Google Maps
            </a>
          </span>
        )}
        <iframe
          src={MAP_EMBED_SRC}
          width="600"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          title="Map showing the location of the Aggarwal store"
          onLoad={() => setReady(true)}
        />
      </div>
    </section>
  );
}
