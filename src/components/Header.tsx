"use client";

import { useState } from "react";
import { BRAND } from "@/lib/site";
import { CloseIcon, MenuIcon, WhatsAppIcon } from "./Icons";
import { waLink } from "@/lib/site";

const LINKS = [
  { href: "#fashion", label: "Fashion" },
  { href: "#homeware", label: "Homeware" },
  { href: "#coming-soon", label: "Coming Soon" },
  { href: "#early-access", label: "Early Access" },
  { href: "#visit-store", label: "Visit Store" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a className="brand" href="#top" aria-label={`${BRAND.name} home`}>
          <span className="brand__word">{BRAND.wordmark}</span>
          <span className="brand__sub">{BRAND.subline}</span>
        </a>

        <nav className={`header-nav${open ? " is-open" : ""}`} aria-label="Main">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              data-cta="nav"
              data-store="general"
              data-section="header"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <a
            className="btn btn--outline"
            href={waLink("Hi Aggarwal's House, I would like to know more about the upcoming online store.")}
            target="_blank"
            rel="noopener noreferrer"
            data-cta="whatsapp"
            data-cta-label="Header WhatsApp"
            data-store="general"
            data-section="header"
            style={{ padding: "12px 18px" }}
          >
            <WhatsAppIcon size={20} />
            <span className="btn__label">WhatsApp</span>
          </a>
          <a
            className="btn btn--primary btn--header-cta"
            href="#early-access"
            data-cta="early_access"
            data-cta-label="Header early access"
            data-store="general"
            data-section="header"
          >
            Get Early Access
          </a>
          <button
            className="nav-toggle"
            type="button"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
