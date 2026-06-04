/* TERRA — Product Details */
const ProductPage = ({ go, onAdd, route }) => {
  const { PRODUCTS, money, catName } = window.TERRA;
  const p = PRODUCTS.find((x) => x.id === route.id) || PRODUCTS[0];
  const [qty, setQty] = useState(1);
  const [activeShot, setActiveShot] = useState(0);
  const [acc, setAcc] = useState("details");
  const [added, setAdded] = useState(false);
  const out = p.stock === 0;
  const low = p.stock > 0 && p.stock <= 5;

  useEffect(() => { setQty(1); setActiveShot(0); window.scrollTo(0, 0); }, [p.id]);

  const shots = [p.shot, "detail · close-up", "in context · room", "scale · with hand"];
  const tones = [p.tone, "stone", "sand", "cream"];
  const related = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id)
    .concat(PRODUCTS.filter((x) => x.category !== p.category && x.id !== p.id))
    .slice(0, 4);

  const accs = [
    { id: "details", label: "Details & materials", body: `${p.desc}\n\nMaterial: ${p.material}. Made by ${p.maker}.` },
    { id: "shipping", label: "Shipping & returns", body: "Free carbon-neutral shipping on orders over $150. Dispatched within 2 business days. 30-day free returns — we'll arrange collection." },
    { id: "care", label: "Care guide", body: "Wipe clean with a soft, damp cloth. Avoid harsh detergents and prolonged direct sun. Small variations in tone and texture are part of the handmade character." },
  ];

  const doAdd = () => {
    if (out) return;
    onAdd(p, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="page wrap" style={{ paddingTop: 28 }}>
      <div className="crumb" style={{ marginBottom: 26 }}>
        <a href="#" onClick={(e) => { e.preventDefault(); go({ name: "home" }); }}>Home</a>
        <Icon name="chevron" />
        <a href="#" onClick={(e) => { e.preventDefault(); go({ name: "catalog", cat: p.category }); }}>{catName(p.category)}</a>
        <Icon name="chevron" /><span style={{ color: "var(--ink)" }}>{p.name}</span>
      </div>

      <div className="detail-grid">
        {/* GALLERY */}
        <div className="gallery">
          <Placeholder tone={tones[activeShot]} label={shots[activeShot]} ratio="4 / 5"
            className="fade" style={{ borderRadius: "var(--r-xl)" }} key={activeShot} />
          <div className="gallery-thumbs">
            {shots.map((s, i) => (
              <button key={i} className={"gthumb" + (i === activeShot ? " gthumb--active" : "")} onClick={() => setActiveShot(i)}>
                <Placeholder tone={tones[i]} style={{ width: "100%", height: "100%" }} />
              </button>
            ))}
          </div>
        </div>

        {/* INFO */}
        <div className="detail-info">
          <div className="row" style={{ gap: 10, marginBottom: 14 }}>
            <span className="mono faint" style={{ fontSize: 12, letterSpacing: "0.05em" }}>{catName(p.category)}</span>
            {p.badge && <span className={"badge " + (p.badge === "new" ? "badge--accent" : "")}>{p.badge}</span>}
          </div>
          <h1 className="serif" style={{ fontSize: "clamp(32px, 4vw, 50px)", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em" }}>{p.name}</h1>

          <div className="row" style={{ gap: 12, marginTop: 16 }}>
            <Stars value={p.rating} size={15} />
            <span className="muted" style={{ fontSize: 13.5 }}>{p.rating} · {p.reviews} reviews</span>
          </div>

          <div className="row" style={{ gap: 14, alignItems: "baseline", margin: "22px 0 8px" }}>
            <span className="price" style={{ fontSize: 30 }}>{money(p.price)}</span>
            {p.was && <span className="strike" style={{ fontSize: 19 }}>{money(p.was)}</span>}
            {p.was && <span className="badge badge--danger">Save {money(p.was - p.price)}</span>}
          </div>

          <p style={{ fontSize: 16, color: "var(--ink-2)", lineHeight: 1.6, margin: "16px 0 26px", maxWidth: 480 }}>{p.desc}</p>

          {/* stock line */}
          <div className="row" style={{ gap: 8, marginBottom: 22 }}>
            <span className={"badge badge--dot " + (out ? "badge--danger" : low ? "badge--warn" : "badge--ok")}>
              {out ? "Sold out" : low ? `Only ${p.stock} left` : "In stock"}
            </span>
            <span className="mono faint" style={{ fontSize: 11.5 }}>· ships in 2 days</span>
          </div>

          {/* qty + add */}
          <div className="row" style={{ gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
            <QtyStepper value={qty} onChange={setQty} max={out ? 1 : Math.max(1, p.stock)} />
            <button className={"btn btn--lg " + (added ? "btn--accent" : "btn--primary")} disabled={out}
              style={{ flex: 1, minWidth: 200 }} onClick={doAdd}>
              {out ? "Sold out" : added ? <><Icon name="check" size={18} /> Added to cart</> : <><Icon name="bag" size={17} /> Add to cart · {money(p.price * qty)}</>}
            </button>
            <button className="hdr-icon" aria-label="save" style={{ border: "1px solid var(--line-2)", width: 56, height: 56, borderRadius: "var(--r-pill)" }}>
              <Icon name="heart" size={19} />
            </button>
          </div>
          {out && <p className="field-hint" style={{ marginBottom: 18 }}>Between batches — join the list and we'll email you when it's back.</p>}

          {/* mini benefits */}
          <div className="row" style={{ gap: 22, padding: "18px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", margin: "12px 0 26px", flexWrap: "wrap" }}>
            <MiniBene icon="truck" t="Free shipping" s="Orders over $150" />
            <MiniBene icon="shield" t="2-year guarantee" s="On every piece" />
            <MiniBene icon="leaf" t="Handmade" s="Small-batch" />
          </div>

          {/* accordions */}
          <div className="stack">
            {accs.map((a) => (
              <div key={a.id} className="acc">
                <button className="acc__head" onClick={() => setAcc(acc === a.id ? "" : a.id)} aria-expanded={acc === a.id}>
                  <span>{a.label}</span>
                  <Icon name={acc === a.id ? "minus" : "plus"} size={17} />
                </button>
                {acc === a.id && <div className="acc__body fade">{a.body}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RELATED */}
      <section className="section" style={{ paddingBottom: 40 }}>
        <div className="sec-head">
          <div>
            <span className="eyebrow">You might also like</span>
            <h2 style={{ marginTop: 12 }}>Pairs well with</h2>
          </div>
        </div>
        <div className="pgrid">
          {related.map((rp, i) => <ProductCard key={rp.id} p={rp} go={go} onAdd={onAdd} index={i} />)}
        </div>
      </section>
    </div>
  );
};

const MiniBene = ({ icon, t, s }) => (
  <div className="row" style={{ gap: 10 }}>
    <span style={{ color: "var(--accent)" }}><Icon name={icon} size={20} /></span>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{t}</div>
      <div className="faint" style={{ fontSize: 11.5 }}>{s}</div>
    </div>
  </div>
);

Object.assign(window, { ProductPage });
