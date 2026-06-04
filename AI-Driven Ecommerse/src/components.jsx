/* TERRA — shared UI components */
const { useState, useEffect, useRef } = React;

/* ----------------------------------------------------------------
   Icons (simple line set)
---------------------------------------------------------------- */
const Icon = ({ name, size = 18, style }) => {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round",
    strokeLinejoin: "round", style,
  };
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></>,
    bag: <><path d="M6 8h12l-1 12H7L6 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></>,
    user: <><circle cx="12" cy="8" r="3.4" /><path d="M5.5 19a6.5 6.5 0 0 1 13 0" /></>,
    menu: <><path d="M3 6h18M3 12h18M3 18h18" /></>,
    close: <><path d="M6 6l12 12M18 6 6 18" /></>,
    chevron: <><path d="m9 6 6 6-6 6" /></>,
    chevDown: <><path d="m6 9 6 6 6-6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    minus: <><path d="M5 12h14" /></>,
    heart: <><path d="M12 20s-7-4.6-9.2-9C1.3 8 3 4.8 6.2 4.8c2 0 3.1 1.2 3.8 2.3.7-1.1 1.8-2.3 3.8-2.3 3.2 0 4.9 3.2 3.4 6.2C19 15.4 12 20 12 20Z" /></>,
    star: <><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9L12 3.5Z" fill="currentColor" stroke="none" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    arrowL: <><path d="M19 12H5M11 6l-6 6 6 6" /></>,
    check: <><path d="M5 12.5 10 17l9-10" /></>,
    trash: <><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" /></>,
    truck: <><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.6" /><circle cx="17.5" cy="18" r="1.6" /></>,
    shield: <><path d="M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5L12 3Z" /></>,
    leaf: <><path d="M5 19c0-7 5-12 14-12 0 9-5 14-12 14-2 0-2-2-2-2Z" /><path d="M9 15c2-2 4-3 7-4" /></>,
    sparkle: <><path d="M12 3v6M12 15v6M3 12h6M15 12h6" /></>,
    pin: <><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
    card: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></>,
    box: <><path d="M21 8 12 3 3 8l9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></>,
    edit: <><path d="M4 20h4L18.5 9.5a2 2 0 0 0-3-3L5 17v3Z" /><path d="M14 7l3 3" /></>,
    logout: <><path d="M14 8V5H5v14h9v-3" /><path d="M10 12h10M17 9l3 3-3 3" /></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    spark: <><path d="M12 2l1.8 7.2L21 11l-7.2 1.8L12 20l-1.8-7.2L3 11l7.2-1.8L12 2Z" fill="currentColor" stroke="none" /></>,
    alert: <><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v5M12 18h.01" /></>,
  };
  return <svg {...p} aria-hidden="true">{paths[name]}</svg>;
};

/* ----------------------------------------------------------------
   Placeholder image — art-directed warm tone + mono label
---------------------------------------------------------------- */
const Placeholder = ({ tone = "stone", label, ratio, className = "", style = {}, children }) => {
  const bg = (window.TERRA.TONES[tone]) || window.TERRA.TONES.stone;
  return (
    <div className={"ph " + className}
      style={{ "--ph-bg": bg, background: bg, aspectRatio: ratio, ...style }}>
      {label && <span className="ph__tag">{label}</span>}
      {children}
    </div>
  );
};

/* ----------------------------------------------------------------
   Rating stars
---------------------------------------------------------------- */
const Stars = ({ value = 5, size = 13 }) => (
  <span className="row" style={{ gap: 1, color: "var(--accent)" }} aria-label={value + " stars"}>
    {[0, 1, 2, 3, 4].map((i) => (
      <Icon key={i} name="star" size={size}
        style={{ opacity: i < Math.round(value) ? 1 : 0.22 }} />
    ))}
  </span>
);

/* ----------------------------------------------------------------
   Quantity stepper
---------------------------------------------------------------- */
const QtyStepper = ({ value, onChange, min = 1, max = 99, size = "md" }) => {
  const h = size === "sm" ? 36 : 46;
  return (
    <div className="row" style={{
      border: "1px solid var(--line-2)", borderRadius: "var(--r-pill)",
      height: h, background: "var(--surface)", overflow: "hidden",
    }}>
      <button className="qbtn" aria-label="decrease"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        style={qbtn(h)}>
        <Icon name="minus" size={15} />
      </button>
      <span style={{ minWidth: 30, textAlign: "center", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{value}</span>
      <button className="qbtn" aria-label="increase"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        style={qbtn(h)}>
        <Icon name="plus" size={15} />
      </button>
    </div>
  );
};
const qbtn = (h) => ({
  width: h, height: h, display: "grid", placeItems: "center",
  border: "none", background: "transparent", color: "var(--ink)",
});

/* ----------------------------------------------------------------
   Status badge
---------------------------------------------------------------- */
const StatusBadge = ({ status }) => {
  const s = window.TERRA.STATUS[status] || { label: status, cls: "" };
  return <span className={"badge badge--dot " + s.cls}>{s.label}</span>;
};

/* ----------------------------------------------------------------
   Header / Navigation
---------------------------------------------------------------- */
const Header = ({ go, route, cartCount, query, setQuery, user }) => {
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { if (searchOpen && searchRef.current) searchRef.current.focus(); }, [searchOpen]);
  useEffect(() => { setDrawer(false); }, [route]);

  const nav = [
    { label: "Shop All", to: { name: "catalog" } },
    ...window.TERRA.CATEGORIES.slice(0, 4).map((c) => ({ label: c.name, to: { name: "catalog", cat: c.id } })),
  ];

  const submitSearch = (e) => {
    e.preventDefault();
    setSearchOpen(false);
    go({ name: "catalog" });
  };

  return (
    <>
      <header style={{
        position: "sticky", top: 0, zIndex: 60,
        background: scrolled ? "oklch(0.985 0.004 70 / 0.86)" : "var(--bg)",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: "1px solid " + (scrolled ? "var(--line)" : "transparent"),
        transition: "background .25s, border-color .25s",
      }}>
        <div className="wrap row between" style={{ height: "var(--header-h)", gap: 20 }}>
          <button className="hdr-icon mobile-only" aria-label="menu" onClick={() => setDrawer(true)}>
            <Icon name="menu" size={20} />
          </button>

          <a href="#" onClick={(e) => { e.preventDefault(); go({ name: "home" }); }}
            className="serif" style={{
              fontSize: 25, letterSpacing: "0.06em", fontWeight: 500, lineHeight: 1,
              flex: "0 0 auto",
            }}>
            TERRA<span style={{ color: "var(--accent)" }}>.</span>
          </a>

          <nav className="hdr-nav desktop-only">
            {nav.map((n) => {
              const active = route.name === "catalog" && (n.to.cat === route.cat || (!n.to.cat && !route.cat && n.label === "Shop All"));
              return (
                <a key={n.label} href="#" onClick={(e) => { e.preventDefault(); go(n.to); }}
                  className={"hdr-link" + (active ? " hdr-link--active" : "")}>{n.label}</a>
              );
            })}
          </nav>

          <div className="row" style={{ gap: 6, flex: "0 0 auto" }}>
            <button className="hdr-icon" aria-label="search" onClick={() => setSearchOpen((s) => !s)}>
              <Icon name="search" size={19} />
            </button>
            <button className="hdr-icon" aria-label="account"
              onClick={() => go({ name: user ? "account" : "login" })}>
              <Icon name="user" size={19} />
            </button>
            <button className="hdr-icon" aria-label="cart" style={{ position: "relative" }}
              onClick={() => go({ name: "cart" })}>
              <Icon name="bag" size={19} />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
          </div>
        </div>

        {/* search bar */}
        <div style={{
          maxHeight: searchOpen ? 84 : 0, overflow: "hidden",
          transition: "max-height .3s cubic-bezier(.2,.7,.3,1)",
          borderTop: searchOpen ? "1px solid var(--line)" : "none",
        }}>
          <form className="wrap" onSubmit={submitSearch} style={{ padding: "18px var(--gutter)" }}>
            <div className="row" style={{
              gap: 12, border: "1px solid var(--line-2)", borderRadius: "var(--r-pill)",
              padding: "0 18px", height: 48, background: "var(--surface)",
            }}>
              <Icon name="search" size={18} style={{ color: "var(--ink-3)" }} />
              <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search ceramics, lighting, textiles…"
                style={{ border: "none", outline: "none", background: "transparent", flex: 1, fontSize: 15.5 }} />
              {query && <button type="button" className="hdr-icon" onClick={() => setQuery("")} aria-label="clear"><Icon name="close" size={16} /></button>}
            </div>
          </form>
        </div>
      </header>

      {/* mobile drawer */}
      {drawer && (
        <div className="drawer-scrim fade" onClick={() => setDrawer(false)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="row between" style={{ marginBottom: 28 }}>
              <span className="serif" style={{ fontSize: 22, letterSpacing: "0.05em" }}>TERRA<span style={{ color: "var(--accent)" }}>.</span></span>
              <button className="hdr-icon" onClick={() => setDrawer(false)} aria-label="close"><Icon name="close" size={20} /></button>
            </div>
            <nav className="stack" style={{ gap: 4 }}>
              {nav.map((n) => (
                <a key={n.label} href="#" className="drawer-link"
                  onClick={(e) => { e.preventDefault(); go(n.to); }}>{n.label}<Icon name="chevron" size={16} /></a>
              ))}
            </nav>
            <hr className="divider" style={{ margin: "22px 0" }} />
            <nav className="stack" style={{ gap: 4 }}>
              <a href="#" className="drawer-link" onClick={(e) => { e.preventDefault(); go({ name: user ? "account" : "login" }); }}>{user ? "Account" : "Sign in"}<Icon name="user" size={16} /></a>
              <a href="#" className="drawer-link" onClick={(e) => { e.preventDefault(); go({ name: "orders" }); }}>Orders<Icon name="box" size={16} /></a>
              <a href="#" className="drawer-link" onClick={(e) => { e.preventDefault(); go({ name: "cart" }); }}>Cart ({cartCount})<Icon name="bag" size={16} /></a>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
};

/* ----------------------------------------------------------------
   Footer
---------------------------------------------------------------- */
const Footer = ({ go }) => {
  const cols = [
    { h: "Shop", links: window.TERRA.CATEGORIES.map((c) => ({ label: c.name, to: { name: "catalog", cat: c.id } })) },
    { h: "Company", links: [{ label: "Our Story" }, { label: "Makers" }, { label: "Sustainability" }, { label: "Journal" }] },
    { h: "Support", links: [{ label: "Shipping & Returns" }, { label: "Care Guide" }, { label: "Contact" }, { label: "FAQ" }] },
  ];
  return (
    <footer style={{ background: "var(--dark)", color: "var(--on-dark)", marginTop: 0 }}>
      <div className="wrap" style={{ padding: "76px var(--gutter) 40px" }}>
        <div className="footer-grid">
          <div style={{ maxWidth: 320 }}>
            <div className="serif" style={{ fontSize: 30, letterSpacing: "0.05em", marginBottom: 16 }}>TERRA<span style={{ color: "var(--accent)" }}>.</span></div>
            <p style={{ color: "var(--on-dark-2)", fontSize: 14.5, lineHeight: 1.6, marginBottom: 22 }}>
              Objects for considered living. Made by hand, built to age, shipped from our studio.
            </p>
            <form className="row" onSubmit={(e) => e.preventDefault()} style={{
              gap: 8, border: "1px solid var(--dark-2)", borderRadius: "var(--r-pill)",
              padding: "5px 6px 5px 18px", maxWidth: 320,
            }}>
              <input placeholder="Email for new arrivals" style={{
                border: "none", outline: "none", background: "transparent",
                color: "var(--on-dark)", flex: 1, fontSize: 14,
              }} />
              <button className="btn btn--on-dark btn--sm" type="submit">Join</button>
            </form>
          </div>
          {cols.map((col) => (
            <div key={col.h}>
              <div className="eyebrow" style={{ color: "var(--on-dark-2)", marginBottom: 18 }}>{col.h}</div>
              <ul className="stack" style={{ gap: 11 }}>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href="#" className="footer-link"
                      onClick={(e) => { e.preventDefault(); l.to && go(l.to); }}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-base">
          <span>© 2026 Terra Studio. All rights reserved.</span>
          <div className="row" style={{ gap: 22 }}>
            <a href="#" className="footer-link" onClick={(e) => e.preventDefault()}>Privacy</a>
            <a href="#" className="footer-link" onClick={(e) => e.preventDefault()}>Terms</a>
            <span className="mono" style={{ color: "var(--on-dark-2)", fontSize: 12 }}>EN · USD $</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

/* ----------------------------------------------------------------
   Product card
---------------------------------------------------------------- */
const ProductCard = ({ p, go, onAdd, index = 0 }) => {
  const [wish, setWish] = useState(false);
  const out = p.stock === 0;
  const { money, catName } = window.TERRA;
  return (
    <article className="pcard rise" style={{ animationDelay: Math.min(index * 0.04, 0.3) + "s" }}>
      <div className="pcard__media" onClick={() => go({ name: "product", id: p.id })}>
        <Placeholder tone={p.tone} label={p.shot} ratio="4 / 5" className="pcard__ph" />
        {p.badge && <span className={"badge " + (p.badge === "new" ? "badge--accent" : "") } style={{ position: "absolute", top: 14, left: 14 }}>{p.badge}</span>}
        {p.was && !p.badge && <span className="badge badge--danger" style={{ position: "absolute", top: 14, left: 14 }}>Sale</span>}
        {out && <span className="badge" style={{ position: "absolute", top: 14, left: 14, background: "var(--ink)", color: "var(--bg)" }}>Sold out</span>}
        <button className="pcard__wish" aria-label="save" aria-pressed={wish}
          onClick={(e) => { e.stopPropagation(); setWish((w) => !w); }}
          style={{ color: wish ? "var(--accent)" : "var(--ink-2)" }}>
          <Icon name="heart" size={17} style={{ fill: wish ? "var(--accent)" : "none" }} />
        </button>
        <div className="pcard__quick">
          <button className="btn btn--primary btn--sm btn--full" disabled={out}
            onClick={(e) => { e.stopPropagation(); !out && onAdd(p); }}>
            {out ? "Sold out" : "Add to cart"}
          </button>
        </div>
      </div>
      <div className="pcard__body" onClick={() => go({ name: "product", id: p.id })}>
        <div className="row between" style={{ gap: 10, alignItems: "flex-start" }}>
          <h3 style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: "-0.005em" }}>{p.name}</h3>
          <span className="price" style={{ fontSize: 15.5, whiteSpace: "nowrap" }}>{money(p.price)}</span>
        </div>
        <div className="row between" style={{ marginTop: 5 }}>
          <span className="mono faint" style={{ fontSize: 11.5, letterSpacing: "0.04em" }}>{catName(p.category)}</span>
          {p.was && <span className="strike" style={{ fontSize: 13 }}>{money(p.was)}</span>}
        </div>
      </div>
    </article>
  );
};

Object.assign(window, { Icon, Placeholder, Stars, QtyStepper, StatusBadge, Header, Footer, ProductCard });
