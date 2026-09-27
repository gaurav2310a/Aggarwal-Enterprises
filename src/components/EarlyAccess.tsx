"use client";

import { useState, type FormEvent } from "react";
import { trackEvent } from "@/lib/analytics";
import { BRAND, waLink } from "@/lib/site";
import { submitLead, type LeadInterest } from "@/lib/leads";
import { getCampaign } from "@/lib/campaign";
import { CheckIcon, WhatsAppIcon } from "./Icons";

type Status = { kind: "idle" | "ok" | "err"; message?: string; detail?: string };
type Errors = Partial<Record<"name" | "mobile" | "email", string>>;

const POINTS = [
  "Be the first to know when the store goes live",
  "A launch voucher reserved in your name",
  "New arrival and festive offer updates",
  "Choose how you hear from us — email, or WhatsApp",
];

function validate(name: string, email: string, mobile: string): Errors {
  const errors: Errors = {};
  if (name.trim().length < 2) errors.name = "Please enter your name";
  if (!email.trim()) errors.email = "Please enter your email";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
    errors.email = "Enter a valid email address";
  if (mobile.trim() && mobile.replace(/\D/g, "").length < 10)
    errors.mobile = "Enter a valid 10-digit mobile number";
  return errors;
}

export function EarlyAccess() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [interest, setInterest] = useState("both");
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(name, email, mobile);
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus({ kind: "err", message: "Please correct the highlighted fields." });
      return;
    }

    setBusy(true);
    setStatus({ kind: "idle" });

    const lead = {
      name: name.trim(),
      mobile: mobile.replace(/\D/g, ""),
      email: email.trim(),
      notes: notes.trim(),
      interest,
      whatsappOptIn,
      source: "coming_soon_site",
      page: typeof window === "undefined" ? "" : window.location.pathname,
      submittedAt: new Date().toISOString(),
    };

    try {
      const campaign = getCampaign();
      const result = await submitLead({
        name: lead.name,
        mobile: lead.mobile,
        email: lead.email,
        interest: lead.interest as LeadInterest,
        whatsappOptIn: lead.whatsappOptIn,
        page: lead.page,
        notes: lead.notes,
        campaign,
      });

      if (!result.ok) {
        setStatus({ kind: "err", message: result.error, detail: result.detail });
        return;
      }

      trackEvent("early_access_signup", {
        store: interest,
        has_email: Boolean(lead.email),
        whatsapp_opt_in: lead.whatsappOptIn,
        stored_in: result.storedIn,
        utm_source: campaign.utmSource ?? "(direct)",
        utm_medium: campaign.utmMedium ?? "(none)",
        utm_campaign: campaign.utmCampaign ?? "(none)",
        device: campaign.device,
      });

      setStatus({
        kind: "ok",
        message:
          result.storedIn === "appwrite"
            ? `Thank you, ${lead.name.split(" ")[0]} — you are on the ${BRAND.name} launch list. We will contact you before the store goes live.`
            : `Thank you, ${lead.name.split(" ")[0]} — you are on the ${BRAND.name} launch list. (Saved on this device; we will confirm on WhatsApp.)`,
      });
      setName("");
      setMobile("");
      setEmail("");
      setNotes("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section early" id="early-access">
      <div className="shell early__grid">
        <div className="early__copy">
          <span className="eyebrow eyebrow--muted">Early access</span>
          <h2 style={{ fontSize: "clamp(30px, 5vw, 52px)", marginTop: 16 }}>
            Be First to Know
          </h2>
          <p>
            Join our launch list and get notified when {BRAND.name} goes online. No spam — only the
            go-live date, new arrivals and offers.
          </p>

          <ul className="early__points">
            {POINTS.map((p) => (
              <li key={p}>
                <CheckIcon size={18} />
                {p}
              </li>
            ))}
          </ul>

          <div className="early__reasons">
            <p className="early__reasons-title">Why people are joining</p>
            <div className="early__reasons-grid">
              <div>
                <span className="early__reason-icon">%</span>
                <strong>Launch voucher</strong>
                <em>A welcome code reserved in your name</em>
              </div>
              <div>
                <span className="early__reason-icon">★</span>
                <strong>First look</strong>
                <em>See new arrivals before they go public</em>
              </div>
              <div>
                <span className="early__reason-icon">⚡</span>
                <strong>Early offers</strong>
                <em>Launch-day discounts, shared first</em>
              </div>
              <div>
                <span className="early__reason-icon">☎</span>
                <strong>Order from home</strong>
                <em>Or collect from the shop in Pradhan Chowk</em>
              </div>
            </div>
          </div>
        </div>

        <div className="early__card">
          <form className="form" onSubmit={onSubmit} noValidate>
            <div className="field">
              <label htmlFor="lead-name">Name</label>
              <input
                id="lead-name"
                name="name"
                className="input"
                placeholder="Your full name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <span className="field__error">{errors.name}</span>}
            </div>

            <div className="field">
              <label htmlFor="lead-email">Email</label>
              <input
                id="lead-email"
                name="email"
                className="input"
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <span className="field__error">{errors.email}</span>}
            </div>

            <div className="field">
              <label htmlFor="lead-mobile">
                Mobile number <span>(optional)</span>
              </label>
              <input
                id="lead-mobile"
                name="mobile"
                className="input"
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile"
                autoComplete="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                aria-invalid={Boolean(errors.mobile)}
              />
              {errors.mobile && <span className="field__error">{errors.mobile}</span>}
            </div>

            <div className="field">
              <label htmlFor="lead-notes">
                Anything you want to see first? <span>(optional)</span>
              </label>
              <textarea
                id="lead-notes"
                name="notes"
                className="input"
                rows={3}
                style={{ resize: "vertical" }}
                placeholder="e.g. Please add sarees in size 38, or a 5-piece pressure cooker set"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="lead-interest">Which store are you interested in?</label>
              <select
                id="lead-interest"
                name="interest"
                className="input"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
              >
                <option value="fashion">Aggarwal Fashion</option>
                <option value="homeware">Aggarwal Homeware</option>
                <option value="both">Both stores</option>
              </select>
            </div>

            <label className="check">
              <input
                type="checkbox"
                name="whatsappOptIn"
                checked={whatsappOptIn}
                onChange={(e) => setWhatsappOptIn(e.target.checked)}
              />
              Send me launch updates on WhatsApp
            </label>

            <button
              className="btn btn--primary btn--block btn--lg"
              type="submit"
              disabled={busy}
              data-cta="join_the_launch"
              data-cta-label="Early access form submit"
              data-store={interest === "both" ? "general" : interest}
              data-section="early_access_form"
            >
              {busy ? "Saving…" : "Join the Launch"}
            </button>

            {status.kind !== "idle" && status.message && (
              <>
                <p
                  className={`form__status form__status--${status.kind === "ok" ? "ok" : "err"}`}
                  role="status"
                >
                  {status.message}
                </p>
                {status.detail && (
                  <p
                    style={{
                      fontSize: 11.5,
                      color: "#8d8175",
                      wordBreak: "break-word",
                      marginTop: -6,
                    }}
                  >
                    <code>{status.detail}</code>
                  </p>
                )}
              </>
            )}

            <p style={{ fontSize: 12.5, color: "#8d8175" }}>
              We only use your number to tell you when the {BRAND.name} online store launches. You
              can ask us to remove it at any time.
            </p>
          </form>

          <div className="wa-note">
            <WhatsAppIcon size={20} />
            <span>Prefer WhatsApp? Get launch updates on WhatsApp.</span>
            <a
              className="btn btn--wa"
              href={waLink("Hi Aggarwal, please add me to the online store launch list.")}
              target="_blank"
              rel="noopener noreferrer"
              data-cta="whatsapp_optin"
              data-cta-label="Early access WhatsApp"
              data-store="general"
              data-section="early_access_form"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
