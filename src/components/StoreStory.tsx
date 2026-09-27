import { StorefrontPhoto } from "./SceneArt";
import { CheckIcon } from "./Icons";

const STEPS = [
  {
    title: "Customers visit our shop",
    body: "Families across the area have been buying clothing, kitchenware and home essentials from us in person for years.",
  },
  {
    title: "We modernise the way we sell",
    body: "The same counter, the same stock and the same service — now organised so you can browse it all from your phone.",
  },
  {
    title: "You shop from home",
    body: "Browse, add to your list and order online. Prefer to see it first? Collect from the shop whenever you like.",
  },
];

export function StoreStory() {
  return (
    <section className="section" id="our-story">
      <div className="shell story">
        <div className="story__visual">
          <StorefrontPhoto />
        </div>

        <div>
          <span className="eyebrow">Local store → online</span>
          <h2 style={{ fontSize: "clamp(30px, 5vw, 50px)", marginTop: 16 }}>
            From Our Store To Your Home
          </h2>
          <p style={{ marginTop: 20, color: "var(--ink-2)", fontSize: "17.5px" }}>
            For years, Aggarwal's House has served customers locally at our Pradhan Chowk shop. Now
            we&apos;re bringing the same shopping experience online.
          </p>

          <ol className="story__steps">
            {STEPS.map((s) => (
              <li className="story__step" key={s.title}>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <p
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              marginTop: 28,
              fontSize: 14.5,
              color: "var(--ink-2)",
            }}
          >
            <CheckIcon size={18} />
            Visit us in store today — the online store is the next chapter, not a replacement.
          </p>
        </div>
      </div>
    </section>
  );
}
