import { STORES, type StoreKey } from "@/lib/site";
import { ArrowIcon, CheckIcon, PinIcon, ShieldIcon } from "./Icons";
import { StoreArt } from "./SceneArt";

const CARDS: { key: StoreKey; cta: string; anchor: string }[] = [
  { key: "fashion", cta: "Explore Fashion", anchor: "#shop-preview-fashion" },
  { key: "homeware", cta: "Explore Homeware", anchor: "#shop-preview-homeware" },
];

export function StoreCards() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="shell">
        <div className="store-cards">
          {CARDS.map(({ key, cta, anchor }) => {
            const store = STORES[key];
            return (
              <article
                key={key}
                className={`store-card store-card--${key}`}
                id={key}
                data-store-section={key}
              >
                <div className="store-card__art" aria-hidden>
                  <StoreArt store={key} />
                </div>

                <div className="store-card__body">
                  <span className="pill pill--muted">{store.blurb}</span>
                  <h3 className="store-card__title">{store.short}</h3>
                  <p className="store-card__tagline">{store.tagline}</p>
                  <p className="store-card__blurb">
                    {key === "fashion"
                      ? "Everyday clothing and readymade garments for the whole family, in the styles our customers already ask for."
                      : "Kitchenware, cookware, appliances and storage — the everyday home essentials our counter is known for."}
                  </p>

                  <ul className="store-card__tags">
                    {store.categories.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>

                  <div className="store-card__foot">
                    <a
                      className={`btn ${key === "fashion" ? "btn--ink" : "btn--primary"}`}
                      href={anchor}
                      data-cta={`explore_${key}`}
                      data-cta-label={cta}
                      data-store={key}
                      data-section="hero_store_cards"
                    >
                      {cta}
                      <ArrowIcon size={16} />
                    </a>
                    <span className="pill pill--muted">Coming soon</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const TRUST = [
  { icon: <PinIcon size={17} />, text: "A local shop you already visit" },
  { icon: <ShieldIcon size={17} />, text: "Same products, same people" },
  { icon: <CheckIcon size={17} />, text: "Fashion, home and kitchen under one roof" },
];

export function TrustStrip() {
  return (
    <div className="trust-strip">
      <div className="shell trust-strip__inner">
        {TRUST.map((t) => (
          <span className="trust-strip__item" key={t.text}>
            {t.icon}
            {t.text}
          </span>
        ))}
      </div>
    </div>
  );
}
