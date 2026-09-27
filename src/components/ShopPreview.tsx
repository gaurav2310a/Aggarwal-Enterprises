"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { ProductArt, type ArtKind } from "./ProductArt";

type TabKey = "fashion" | "homeware";

const TABS: { key: TabKey; label: string; tagline: string }[] = [
  { key: "fashion", label: "Fashion", tagline: "Modern Style for You" },
  { key: "homeware", label: "Homeware", tagline: "Better Home Happier Lives" },
];

const ITEMS: Record<TabKey, { kind: ArtKind; name: string; note: string }[]> = {
  fashion: [
    { kind: "mens", name: "Men's Clothing", note: "Shirts, trousers, kurtas" },
    { kind: "womens", name: "Women's Clothing", note: "Suits, sarees, daily wear" },
    { kind: "kids", name: "Kids Wear", note: "Everyday sizes and party wear" },
    { kind: "casual", name: "Casual Wear", note: "T-shirts, polos, weekend picks" },
  ],
  homeware: [
    { kind: "cookware", name: "Cookware", note: "Pans, pots, pressure cookers" },
    { kind: "utensils", name: "Kitchen Utensils", note: "Tools your kitchen actually needs" },
    { kind: "appliances", name: "Kitchen Appliances", note: "Mixers, grinders and more" },
    { kind: "essentials", name: "Home Essentials", note: "Storage, cleaning and gifts" },
  ],
};

export function ShopPreview() {
  const [tab, setTab] = useState<TabKey>("fashion");

  // Deep links from the hero store cards: #shop-preview-fashion / -homeware
  useEffect(() => {
    const apply = () => {
      const hash = window.location.hash;
      if (hash.includes("homeware")) setTab("homeware");
      else if (hash.includes("fashion")) setTab("fashion");
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  function select(next: TabKey) {
    setTab(next);
    trackEvent("shop_preview_tab", { store: next });
  }

  return (
    <section className="section section--tint" id="shop-preview">
      <div className="shell">
        <div className="section-head">
          <span className="eyebrow">Shop preview</span>
          <h2>A look at what is coming.</h2>
          <p>
            A preview of the categories we are putting online first. Products, prices and offers go
            live only when the store opens.
          </p>
        </div>

        <div className="preview__tabs" role="tablist" aria-label="Store preview">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={`tab-${t.key}`}
              aria-selected={tab === t.key}
              aria-controls={`panel-${t.key}`}
              className="tab"
              onClick={() => select(t.key)}
              data-cta="preview_tab"
              data-cta-label={`Preview ${t.label}`}
              data-store={t.key}
              data-section="shop_preview"
            >
              {t.label}
            </button>
          ))}
        </div>

        <div
          className="product-grid"
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
        >
          {ITEMS[tab].map((item) => (
            <article className="product-card" key={item.name} data-store-item={tab}>
              <div className="product-card__media">
                <span className="product-card__flag">Coming soon</span>
                <ProductArt kind={item.kind} label={item.name} />
              </div>
              <div className="product-card__body">
                <span className="product-card__store">
                  {tab === "fashion" ? "Aggarwal Fashion" : "Aggarwal Homeware"}
                </span>
                <h3 className="product-card__name">{item.name}</h3>
                <p className="product-card__note">{item.note}</p>
                <p className="product-card__tagline">{TABS.find((t) => t.key === tab)?.tagline}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="preview__foot">
          <p>
            Images shown are placeholders. Real product photography will go live at launch — we would
            rather show you an honest preview than pretend the store is open.
          </p>
          <a
            className="btn btn--ink"
            href="#early-access"
            data-cta="notify_me"
            data-cta-label="Shop preview notify me"
            data-store={tab}
            data-section="shop_preview"
          >
            Notify me at launch
          </a>
        </div>
      </div>
    </section>
  );
}
