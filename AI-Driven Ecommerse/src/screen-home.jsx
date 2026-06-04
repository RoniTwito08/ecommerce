/* TERRA — Home page */
const HomePage = ({ go, onAdd }) => {
  const { PRODUCTS, CATEGORIES, money } = window.TERRA;
  const featured = PRODUCTS.filter((p) => p.badge === "bestseller").slice(0, 4);
  const _seen = new Set();
  const arrivals = [...PRODUCTS.filter((p) => p.badge === "new"), ...PRODUCTS.slice(6)]
    .filter((p) => (_seen.has(p.id) ? false : _seen.add(p.id)))
    .slice(0, 4);
  const benefits = [
    { icon: "truck", t: "Free shipping over $150", s: "Carbon-neutral delivery" },
    { icon: "leaf", t: "Made to last", s: "Natural, durable materials" },
    { icon: "shield", t: "Two-year guarantee", s: "We stand behind every piece" },
    { icon: "box", t: "30-day returns", s: "Free, no questions asked" },
  ];

  return (
    <div className="page">
      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="hero-grid">
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "64px var(--gutter) 64px", maxWidth: 640, marginLeft: "auto", width: "100%" }}>
            <div className="wrap" style={{ padding: 0, maxWidth: 560, marginLeft: "auto", marginRight: 0 }}>
              <span className="eyebrow eyebrow--accent rise">New · Spring Collection 2026</span>
              <h1 className="serif rise" style={{ fontSize: "clamp(44px, 6vw, 82px)", lineHeight: 0.98, letterSpacing: "-0.03em", margin: "20px 0 0", fontWeight: 400, animationDelay: ".05s" }}>
                Objects for<br />considered<br /><em style={{ color: "var(--accent)", fontStyle: "italic" }}>living.</em>
              </h1>
              <p className="rise" style={{ fontSize: 18, color: "var(--ink-2)", lineHeight: 1.55, margin: "26px 0 34px", maxWidth: 440, animationDelay: ".12s" }}>
                A curated home of ceramics, lighting and textiles — made by hand, built to age beautifully, and shipped from our studio.
              </p>
              <div className="row rise" style={{ gap: 12, flexWrap: "wrap", animationDelay: ".18s" }}>
                <button className="btn btn--primary btn--lg" onClick={() => go({ name: "catalog" })}>
                  Shop the collection <Icon name="arrow" size={17} />
                </button>
                <button className="btn btn--ghost btn--lg" onClick={() => go({ name: "catalog", cat: "ceramics" })}>
                  Explore ceramics
                </button>
              </div>
              <div className="row" style={{ gap: 28, marginTop: 44 }}>
                <Stat n="40k+" l="Homes furnished" />
                <div style={{ width: 1, height: 38, background: "var(--line-2)" }}></div>
                <Stat n="120" l="Independent makers" />
                <div style={{ width: 1, height: 38, background: "var(--line-2)" }}></div>
                <Stat n="4.9" l="Avg. rating" />
              </div>
            </div>
          </div>

          <div style={{ position: "relative", minHeight: 420 }}>
            <Placeholder tone="clay" label="hero · styled room" style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
            {/* floating product chip */}
            <div className="card rise" style={{ position: "absolute", bottom: 28, left: 28, padding: 12, paddingRight: 18, display: "flex", gap: 13, alignItems: "center", borderRadius: "var(--r-lg)", animationDelay: ".3s", maxWidth: 280 }}>
              <Placeholder tone="sand" style={{ width: 56, height: 56, borderRadius: "var(--r-md)", flex: "0 0 auto" }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>Mesa Table Lamp</div>
                <div className="mono faint" style={{ fontSize: 11 }}>in this room · {money(240)}</div>
              </div>
              <button className="hdr-icon" style={{ background: "var(--ink)", color: "var(--bg)", width: 34, height: 34, flex: "0 0 auto" }} onClick={() => go({ name: "product", id: "p2" })} aria-label="view">
                <Icon name="arrow" size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CATEGORY HIGHLIGHTS ---------- */}
      <section className="section wrap">
        <div className="sec-head">
          <div>
            <span className="eyebrow">Browse by room</span>
            <h2 style={{ marginTop: 12 }}>Shop the categories</h2>
          </div>
          <a href="#" className="btn btn--quiet desktop-only" onClick={(e) => { e.preventDefault(); go({ name: "catalog" }); }}>
            All categories <Icon name="arrow" size={15} />
          </a>
        </div>
        <div className="cat-grid">
          {CATEGORIES.map((c, i) => (
            <a key={c.id} href="#" className="cat-card rise" style={{ animationDelay: i * 0.05 + "s" }}
              onClick={(e) => { e.preventDefault(); go({ name: "catalog", cat: c.id }); }}>
              <Placeholder tone={c.tone} label={c.tag} ratio={i === 0 ? "16 / 10" : "16 / 10"} className="cat-card__ph" />
              <div className="cat-card__label">
                <div>
                  <div className="serif" style={{ fontSize: 22, color: "#fff", letterSpacing: "-0.01em" }}>{c.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: "oklch(1 0 0 / 0.7)", marginTop: 2 }}>{c.tag}</div>
                </div>
                <span className="cat-card__arrow"><Icon name="arrow" size={16} /></span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ---------- FEATURED ---------- */}
      <section className="section wrap" style={{ paddingTop: 0 }}>
        <div className="sec-head">
          <div>
            <span className="eyebrow eyebrow--accent">Most loved</span>
            <h2 style={{ marginTop: 12 }}>Bestsellers this season</h2>
          </div>
          <a href="#" className="btn btn--quiet desktop-only" onClick={(e) => { e.preventDefault(); go({ name: "catalog" }); }}>
            Shop all <Icon name="arrow" size={15} />
          </a>
        </div>
        <div className="pgrid">
          {featured.map((p, i) => <ProductCard key={p.id} p={p} go={go} onAdd={onAdd} index={i} />)}
        </div>
      </section>

      {/* ---------- EDITORIAL DARK BAND ---------- */}
      <section style={{ background: "var(--dark)", color: "var(--on-dark)" }}>
        <div className="wrap" style={{ padding: "92px var(--gutter)" }}>
          <div className="editorial-grid">
            <div>
              <span className="eyebrow" style={{ color: "var(--on-dark-2)" }}>The Terra way</span>
              <h2 className="serif" style={{ fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 400, lineHeight: 1.06, letterSpacing: "-0.02em", margin: "20px 0 22px" }}>
                We work with makers,<br />not factories.
              </h2>
              <p style={{ color: "var(--on-dark-2)", fontSize: 16.5, lineHeight: 1.6, maxWidth: 460, marginBottom: 30 }}>
                Every piece is produced in small batches by independent studios we know by name. That means slight variation, honest materials, and objects that earn their place over years — not seasons.
              </p>
              <button className="btn btn--on-dark" onClick={() => go({ name: "catalog" })}>
                Meet the collection <Icon name="arrow" size={16} />
              </button>
            </div>
            <Placeholder tone="rust" label="studio · maker at work" ratio="4 / 3" style={{ borderRadius: "var(--r-xl)" }} />
          </div>
        </div>
      </section>

      {/* ---------- NEW ARRIVALS ---------- */}
      <section className="section wrap">
        <div className="sec-head">
          <div>
            <span className="eyebrow">Just landed</span>
            <h2 style={{ marginTop: 12 }}>New arrivals</h2>
          </div>
          <a href="#" className="btn btn--quiet desktop-only" onClick={(e) => { e.preventDefault(); go({ name: "catalog" }); }}>
            View all <Icon name="arrow" size={15} />
          </a>
        </div>
        <div className="pgrid">
          {arrivals.map((p, i) => <ProductCard key={p.id} p={p} go={go} onAdd={onAdd} index={i} />)}
        </div>
      </section>

      {/* ---------- TRUST / BENEFITS ---------- */}
      <section className="section--tight wrap" style={{ paddingTop: 0 }}>
        <div className="bene-grid">
          {benefits.map((b) => (
            <div key={b.t} style={{ background: "var(--surface)", padding: "30px 26px" }}>
              <span style={{ color: "var(--accent)", display: "inline-flex", marginBottom: 14 }}><Icon name={b.icon} size={24} /></span>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{b.t}</div>
              <div className="muted" style={{ fontSize: 13.5, marginTop: 3 }}>{b.s}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const Stat = ({ n, l }) => (
  <div>
    <div className="serif" style={{ fontSize: 28, lineHeight: 1, letterSpacing: "-0.01em" }}>{n}</div>
    <div className="mono faint" style={{ fontSize: 11, marginTop: 5, letterSpacing: "0.03em" }}>{l}</div>
  </div>
);

Object.assign(window, { HomePage });
