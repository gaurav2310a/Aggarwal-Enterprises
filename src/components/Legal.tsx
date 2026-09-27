import { BRAND, CONTACT, SOCIALS } from "@/lib/site";

/**
 * Honest, plain-language summaries of the two policies linked in the footer.
 * Replace with your full legal text (or full pages) before launch.
 */
export function Legal() {
  return (
    <section className="section section--tint" id="privacy">
      <div className="shell">
        <div className="section-head">
          <span className="eyebrow">Legal</span>
          <h2>Privacy &amp; terms</h2>
        </div>

        <div className="features" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          <article className="feature" id="terms">
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: 17 }}>Privacy Policy</h3>
            <p>
              We collect only what you type into the early-access form: your name, mobile number and,
              if you provide it, your email address. We use it to tell you when the {BRAND.name}{" "}
              online store launches and to share launch offers. We do not sell your details. Ask us
              any time and we will remove your number from our list.
            </p>
            <p style={{ marginTop: 14 }}>
              Write to{" "}
              <a href={`mailto:${CONTACT.email}`} style={{ color: "var(--accent)" }}>
                {CONTACT.email}
              </a>{" "}
              or WhatsApp us.
            </p>
          </article>

          <article className="feature">
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: 17 }}>Terms &amp; Conditions</h3>
            <p>
              This website is a coming-soon notice. Products, prices and offers shown are previews
              and are not available to buy yet. Orders will only be possible once the online store is
              live, at which point full terms, delivery details and return policy will be published
              here.
            </p>
            <p style={{ marginTop: 14 }}>
              Joining the launch list does not create any purchase commitment.
            </p>
          </article>

          <article className="feature">
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: 17 }}>Contact</h3>
            <ul style={{ display: "grid", gap: 10, fontSize: 14.5, color: "var(--ink-2)" }}>
              {SOCIALS.map((s) => (
                <li key={s.key}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
