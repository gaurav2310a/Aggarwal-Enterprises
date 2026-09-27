import { ArrowIcon } from "./Icons";
import { HeroArt } from "./SceneArt";
import { QrPanel } from "./QrPanel";
import { BRAND, STORES } from "@/lib/site";

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="shell hero__inner">
        <div>
          <span className="pill pill--dot">Online store launching soon</span>
          <h1 style={{ marginTop: 22 }}>
            Your Favourite Local Store.
            <br />
            Now Coming <em>Online.</em>
          </h1>

          <p className="hero__lead">
            {BRAND.name} is bringing your everyday fashion, kitchen and home essentials online.
          </p>

          <div className="hero__actions">
            <a
              className="btn btn--primary btn--lg"
              href="#early-access"
              data-cta="get_early_access"
              data-cta-label="Hero main CTA"
              data-store="general"
              data-section="hero"
            >
              Get Early Access
              <ArrowIcon size={16} />
            </a>
            <a
              className="btn btn--outline btn--lg"
              href="#coming-soon"
              data-cta="see_coming_soon"
              data-cta-label="Hero secondary CTA"
              data-store="general"
              data-section="hero"
            >
              See what&apos;s coming
            </a>
          </div>

          <p className="hero__note">
            <strong>{BRAND.name}</strong> — {BRAND.subline}. Two stores, one family name:{" "}
            <strong>{STORES.fashion.name}</strong> and <strong>{STORES.homeware.name}</strong>.
          </p>
        </div>

          <div className="hero__visual">
            <div className="hero__frame">
              <HeroArt />
            </div>
            <div className="hero__badge">
              <span>{STORES.fashion.name}</span>
              <span>{STORES.fashion.tagline}</span>
              <span>{STORES.homeware.name}</span>
              <span>{STORES.homeware.tagline}</span>
            </div>
          </div>
        </div>

      {/* QR block — placed high on the page for shop flex boards */}
      <div className="shell" style={{ marginTop: 40 }}>
        <QrPanel
          variant="light"
          size={118}
          title="Scan to get early access"
          note="Seen it on our shop board? Scan here to open the site and join the launch list."
        />
      </div>
    </section>
  );
}
