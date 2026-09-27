import { BRAND, CONTACT, SOCIALS, waLink } from "@/lib/site";
import { FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "./Icons";
import { StoreMap } from "./StoreMap";

const SOCIAL_ICON = {
  whatsapp: WhatsAppIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
} as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" id="visit-store">
      <div className="shell">
        <div className="footer-grid">
          <div className="footer-col footer-brand">
            <span className="footer-brand__word">{BRAND.wordmark}</span>
            <p className="footer-brand__sub">{BRAND.subline}</p>
            <p className="footer-brand__tag">
              {BRAND.subline} from our store to your screen. Online store launching soon.
            </p>

            <div className="footer-social">
              {SOCIALS.map((s) => {
                const Icon = SOCIAL_ICON[s.key];
                return (
                  <a
                    key={s.key}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    data-cta={`social_${s.key}`}
                    data-cta-label={`Footer ${s.label}`}
                    data-store="general"
                    data-section="footer"
                  >
                    <Icon size={17} />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="footer-col">
            <h4>Our stores</h4>
            <ul>
              <li>
                <a href="#fashion" data-cta="footer_fashion" data-store="fashion" data-section="footer">
                  Aggarwal Fashion
                </a>
              </li>
              <li>
                <a
                  href="#homeware"
                  data-cta="footer_homeware"
                  data-store="homeware"
                  data-section="footer"
                >
                  Aggarwal Homeware
                </a>
              </li>
              <li>
                <a href="#coming-soon" data-cta="footer_coming_soon" data-store="general" data-section="footer">
                  Coming Soon
                </a>
              </li>
              <li>
                <a href="#shop-preview" data-cta="footer_preview" data-store="general" data-section="footer">
                  Shop Preview
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li>
                <a
                  href={waLink("Hi Aggarwal, I have a question about the online store.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cta="footer_whatsapp"
                  data-store="general"
                  data-section="footer"
                >
                  WhatsApp us
                </a>
              </li>
              <li>
                <a
                  href={`tel:${CONTACT.phoneDial}`}
                  data-cta="footer_call"
                  data-store="general"
                  data-section="footer"
                >
                  {CONTACT.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  data-cta="footer_email"
                  data-store="general"
                  data-section="footer"
                >
                  {CONTACT.email}
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Store location</h4>
            <p style={{ display: "flex", gap: 10 }}>
              <PinIcon size={17} />
              <span>
                {CONTACT.addressLines.map((line) => (
                  <span key={line} style={{ display: "block" }}>
                    {line}
                  </span>
                ))}
              </span>
            </p>
            <p style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <PhoneIcon size={17} />
              <span>Open today · Ask at the counter</span>
            </p>
            <p style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <MailIcon size={17} />
              <span>Online orders open at launch</span>
            </p>
            <a
              className="btn btn--outline"
              style={{ marginTop: 18, padding: "12px 18px", fontSize: 11.5 }}
              href="#store-map"
              data-cta="footer_view_map"
              data-cta-label="Footer view map"
              data-store="general"
              data-section="footer"
            >
              View map below
            </a>
          </div>
        </div>

        <StoreMap />

        <div className="footer-bottom">
          <span>
            © {year} {BRAND.name} — {BRAND.subline}. All rights reserved.
          </span>
          <div className="footer-bottom__links">
            <a href="#privacy" data-cta="footer_privacy" data-store="general" data-section="footer">
              Privacy Policy
            </a>
            <a href="#terms" data-cta="footer_terms" data-store="general" data-section="footer">
              Terms &amp; Conditions
            </a>
            <a
              href="#early-access"
              data-cta="footer_early_access"
              data-store="general"
              data-section="footer"
            >
              Get Early Access
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
