import { ArrowIcon, TagIcon, TruckIcon } from "./Icons";

export function LaunchOffer() {
  return (
    <section className="section" id="launch-offer">
      <div className="shell">
        <div className="offer">
          <div>
            <span className="eyebrow eyebrow--muted">Launch offer</span>
            <h2 style={{ marginTop: 16 }}>A Special Welcome Is Coming</h2>
            <p>
              Join the launch list to receive our exclusive online launch offer — a thank you to the
              customers who supported us in store, and to the ones who found us online first.
            </p>
            <p
              style={{
                display: "flex",
                gap: 22,
                flexWrap: "wrap",
                marginTop: 26,
                fontSize: 14,
                color: "#a89d91",
              }}
            >
              <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                <TagIcon size={16} /> Launch-only discount code
              </span>
              <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                <TruckIcon size={16} /> Free delivery over a launch threshold
              </span>
            </p>
          </div>

          <div className="offer__actions">
            <a
              className="btn btn--primary btn--lg btn--block"
              href="#early-access"
              data-cta="get_early_access"
              data-cta-label="Launch offer CTA"
              data-store="general"
              data-section="launch_offer"
            >
              Get Early Access
              <ArrowIcon size={16} />
            </a>
            <span className="offer__fine">
              Offer details will be shared with launch-list members first.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
