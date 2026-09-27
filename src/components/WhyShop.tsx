import { BagIcon, CheckIcon, ShieldIcon, SparkIcon, StoreIcon, TagIcon } from "./Icons";

const FEATURES = [
  {
    icon: <StoreIcon size={22} />,
    title: "Trusted Local Store",
    body: "Aggarwal's House is a family-run local business. You know the counter, the staff and the quality — that stays the same online.",
  },
  {
    icon: <CheckIcon size={22} />,
    title: "Carefully Selected Products",
    body: "Every item is chosen the way we choose it in store: practical, good quality and fairly priced.",
  },
  {
    icon: <BagIcon size={22} />,
    title: "Online Convenience",
    body: "Browse at your own pace, save your favourites and order from home — with pickup from the shop if you prefer.",
  },
  {
    icon: <TagIcon size={22} />,
    title: "Special Launch Offers",
    body: "Early access members get first look at launch-day offers, before they are shared publicly.",
  },
];

export function WhyShop() {
  return (
    <section className="section" id="why-us">
      <div className="shell">
        <div className="section-head section-head--center">
          <span className="eyebrow">Why shop with us</span>
          <h2>Same trust. New convenience.</h2>
          <p>
            We are not a new online brand. We are the store next door, taking the same products
            online so more customers can shop with us.
          </p>
        </div>

        <div className="features">
          {FEATURES.map((f) => (
            <article className="feature" key={f.title}>
              <span className="feature__icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </div>

        <p
          className="section-head"
          style={{ maxWidth: 620, margin: "30px auto 0", textAlign: "center" }}
        >
          <span className="pill pill--muted">
            <SparkIcon size={14} /> No reviews, no ratings games — just our own store, online
          </span>
        </p>
      </div>
    </section>
  );
}
