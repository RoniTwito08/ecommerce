/* TERRA — Multi-step Checkout */

const STEP_LABELS = ["Information", "Shipping", "Review", "Confirmation"];

const SHIP_METHODS = [
  { id: "standard", label: "Standard", note: "4–6 business days", price: 0, free: true },
  { id: "express", label: "Express", note: "2–3 business days", price: 12 },
  { id: "next", label: "Next day", note: "Order before 2pm", price: 24 },
];

const CheckoutPage = ({ cart, subtotal, go, onComplete, user }) => {
  const { money } = window.TERRA;
  const [step, setStep] = useState(cart.length === 0 ? 3 : 0);
  const [ship, setShip] = useState("standard");
  const [form, setForm] = useState({
    email: (user && user.email) || "", first: (user && user.first) || "", last: (user && user.last) || "",
    address: "", apt: "", city: "", zip: "", country: "Portugal", phone: "",
    card: "", exp: "", cvc: "", name: "",
  });
  const [err, setErr] = useState({});
  const [placing, setPlacing] = useState(false);
  const [orderId] = useState("TR-" + Math.floor(48900 + Math.random() * 99));
  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const shipCost = (SHIP_METHODS.find((m) => m.id === ship) || {}).price || 0;
  const total = subtotal + (subtotal >= 150 && ship === "standard" ? 0 : shipCost);

  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  const validateInfo = () => {
    const n = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) n.email = "Valid email required";
    if (!form.first.trim()) n.first = "Required";
    if (!form.last.trim()) n.last = "Required";
    if (!form.address.trim()) n.address = "Required";
    if (!form.city.trim()) n.city = "Required";
    if (!form.zip.trim()) n.zip = "Required";
    setErr(n);
    return Object.keys(n).length === 0;
  };
  const validatePay = () => {
    const n = {};
    if (form.card.replace(/\s/g, "").length < 12) n.card = "Enter a valid card number";
    if (!form.exp.trim()) n.exp = "MM/YY";
    if (form.cvc.length < 3) n.cvc = "3 digits";
    setErr(n);
    return Object.keys(n).length === 0;
  };

  const next = () => {
    if (step === 0 && !validateInfo()) return;
    if (step === 2) { place(); return; }
    setStep((s) => s + 1);
  };
  const place = () => {
    if (!validatePay()) return;
    setPlacing(true);
    setTimeout(() => { setPlacing(false); setStep(3); onComplete(orderId); }, 1300);
  };

  // CONFIRMATION
  if (step === 3) {
    return (
      <div className="page wrap" style={{ paddingTop: 50, paddingBottom: 100, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div className="rise" style={{ maxWidth: 520 }}>
          <div className="confirm-check"><Icon name="check" size={40} /></div>
          <span className="eyebrow eyebrow--accent">Order {orderId}</span>
          <h1 className="serif" style={{ fontSize: "clamp(32px,4.5vw,52px)", fontWeight: 400, letterSpacing: "-0.02em", margin: "14px 0 14px" }}>Thank you, {form.first || "friend"}.</h1>
          <p className="muted" style={{ fontSize: 16.5, lineHeight: 1.6, marginBottom: 32 }}>
            Your order is confirmed. We've sent a receipt to <strong style={{ color: "var(--ink)" }}>{form.email || "your inbox"}</strong>. You'll get tracking once it ships from our studio.
          </p>
          <div className="card" style={{ padding: 22, textAlign: "left", marginBottom: 28 }}>
            <div className="row between" style={{ marginBottom: 14 }}>
              <span className="eyebrow">Estimated delivery</span>
              <StatusBadge status="processing" />
            </div>
            <div className="serif" style={{ fontSize: 22 }}>Jun 9 – Jun 12, 2026</div>
            <hr className="divider" style={{ margin: "16px 0" }} />
            <div className="row between"><span className="muted" style={{ fontSize: 14 }}>Total paid</span><span className="price">{money(total)}</span></div>
          </div>
          <div className="row" style={{ gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn--primary btn--lg" onClick={() => go({ name: "orders" })}>View order <Icon name="arrow" size={16} /></button>
            <button className="btn btn--ghost btn--lg" onClick={() => go({ name: "home" })}>Continue shopping</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page wrap" style={{ paddingTop: 36, paddingBottom: 90 }}>
      <button className="btn btn--quiet btn--sm" style={{ marginBottom: 22 }} onClick={() => step === 0 ? go({ name: "cart" }) : setStep((s) => s - 1)}>
        <Icon name="arrowL" size={15} /> {step === 0 ? "Back to cart" : "Back"}
      </button>

      {/* step indicator */}
      <div className="steps" style={{ maxWidth: 640, marginBottom: 44 }}>
        {STEP_LABELS.map((label, i) => (
          <React.Fragment key={label}>
            <div className={"step" + (i < step ? " step--done" : i === step ? " step--active" : "")}>
              <span className="step__num">{i < step ? <Icon name="check" size={15} /> : i + 1}</span>
              <span className="step__lbl">{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && <span className={"step__line" + (i < step ? " step--done" : "")} style={{ background: i < step ? "var(--accent)" : undefined }}></span>}
          </React.Fragment>
        ))}
      </div>

      <div className="shop-2col">
        <div className="fade" key={step}>
          {/* STEP 0 — INFORMATION */}
          {step === 0 && (
            <div className="stack" style={{ gap: 28 }}>
              <Section title="Contact">
                <Fld label="Email" v={form.email} on={set("email")} err={err.email} placeholder="you@email.com" type="email" />
              </Section>
              <Section title="Shipping address">
                <div className="field-row" style={{ marginBottom: 16 }}>
                  <Fld label="First name" v={form.first} on={set("first")} err={err.first} />
                  <Fld label="Last name" v={form.last} on={set("last")} err={err.last} />
                </div>
                <div style={{ marginBottom: 16 }}><Fld label="Address" v={form.address} on={set("address")} err={err.address} placeholder="Street and number" /></div>
                <div style={{ marginBottom: 16 }}><Fld label="Apartment, suite (optional)" v={form.apt} on={set("apt")} /></div>
                <div className="checkout-3" style={{ marginBottom: 16 }}>
                  <Fld label="City" v={form.city} on={set("city")} err={err.city} />
                  <Fld label="Postal code" v={form.zip} on={set("zip")} err={err.zip} />
                  <div className="field">
                    <label>Country</label>
                    <div className="select-wrap" style={{ width: "100%" }}>
                      <select className="select" value={form.country} onChange={set("country")} style={{ height: 50, width: "100%" }}>
                        <option>Portugal</option><option>Spain</option><option>France</option><option>United Kingdom</option><option>Germany</option>
                      </select>
                    </div>
                  </div>
                </div>
                <Fld label="Phone (for delivery updates)" v={form.phone} on={set("phone")} placeholder="+351 …" />
              </Section>
            </div>
          )}

          {/* STEP 1 — SHIPPING */}
          {step === 1 && (
            <Section title="Delivery method">
              <div className="stack" style={{ gap: 12 }}>
                {SHIP_METHODS.map((m) => {
                  const price = m.free && subtotal >= 150 ? 0 : m.price;
                  return (
                    <label key={m.id} className={"radio-card" + (ship === m.id ? " radio-card--active" : "")}>
                      <input type="radio" name="ship" checked={ship === m.id} onChange={() => setShip(m.id)} style={{ accentColor: "var(--accent)" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{m.label}</div>
                        <div className="muted" style={{ fontSize: 13 }}>{m.note}</div>
                      </div>
                      <span className="price">{price === 0 ? "Free" : money(price)}</span>
                    </label>
                  );
                })}
              </div>
              <div className="row" style={{ gap: 10, marginTop: 22, padding: 16, background: "var(--accent-soft)", borderRadius: "var(--r-md)" }}>
                <Icon name="leaf" size={18} style={{ color: "var(--accent-ink)", flex: "0 0 auto" }} />
                <span style={{ fontSize: 13.5, color: "var(--accent-ink)" }}>Every Terra delivery is carbon-neutral — we offset the full footprint of your shipment.</span>
              </div>
            </Section>
          )}

          {/* STEP 2 — REVIEW + PAYMENT */}
          {step === 2 && (
            <div className="stack" style={{ gap: 28 }}>
              <Section title="Review your order">
                {cart.map((it) => (
                  <div key={it.id} className="row between" style={{ padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
                    <div className="row" style={{ gap: 14 }}>
                      <Placeholder tone={it.tone} style={{ width: 54, height: 54, borderRadius: 10 }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14.5 }}>{it.name}</div>
                        <div className="mono faint" style={{ fontSize: 11.5 }}>Qty {it.qty}</div>
                      </div>
                    </div>
                    <span className="price">{money(it.price * it.qty)}</span>
                  </div>
                ))}
                <div className="row" style={{ gap: 24, marginTop: 18, flexWrap: "wrap" }}>
                  <Recap label="Ship to" v={`${form.first} ${form.last}, ${form.city || "—"}`} edit={() => setStep(0)} />
                  <Recap label="Method" v={(SHIP_METHODS.find((m) => m.id === ship) || {}).label} edit={() => setStep(1)} />
                </div>
              </Section>
              <Section title="Payment">
                <div className="row" style={{ gap: 8, marginBottom: 16, color: "var(--ink-3)" }}>
                  <Icon name="shield" size={16} /><span style={{ fontSize: 13 }}>Encrypted & secure — this is a demo, no real charge.</span>
                </div>
                <div style={{ marginBottom: 16 }}><Fld label="Card number" v={form.card} on={set("card")} err={err.card} placeholder="4242 4242 4242 4242" icon="card" /></div>
                <div className="field-row">
                  <Fld label="Expiry" v={form.exp} on={set("exp")} err={err.exp} placeholder="MM / YY" />
                  <Fld label="CVC" v={form.cvc} on={set("cvc")} err={err.cvc} placeholder="123" />
                </div>
              </Section>
            </div>
          )}

          <div className="row" style={{ marginTop: 32, gap: 12 }}>
            <button className="btn btn--primary btn--lg btn--full btn--block" onClick={next} disabled={placing}>
              {placing ? "Placing order…" : step === 2 ? <>Pay {money(total)} <Icon name="arrow" size={17} /></> : <>Continue <Icon name="arrow" size={17} /></>}
            </button>
          </div>
        </div>

        <div className="summary">
          <OrderSummary subtotal={subtotal} go={go} compact cta="" onCta={() => {}} />
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <section>
    <h2 className="serif" style={{ fontSize: 23, fontWeight: 400, marginBottom: 18, letterSpacing: "-0.01em" }}>{title}</h2>
    {children}
  </section>
);

const Fld = ({ label, v, on, err, placeholder, type = "text", icon }) => (
  <div className="field">
    <label>{label}</label>
    <div style={{ position: "relative" }}>
      <input className={"input" + (err ? " input--error" : "")} type={type} value={v} onChange={on} placeholder={placeholder} style={icon ? { paddingLeft: 44 } : null} />
      {icon && <span style={{ position: "absolute", left: 15, top: 16, color: "var(--ink-3)" }}><Icon name={icon} size={18} /></span>}
    </div>
    {err && <span className="field-err"><Icon name="alert" size={13} />{err}</span>}
  </div>
);

const Recap = ({ label, v, edit }) => (
  <div>
    <div className="row" style={{ gap: 8 }}>
      <span className="eyebrow">{label}</span>
      <button className="btn btn--quiet" style={{ height: 20, padding: 0, fontSize: 12, color: "var(--accent-ink)" }} onClick={edit}>Edit</button>
    </div>
    <div style={{ fontSize: 14, marginTop: 4 }}>{v}</div>
  </div>
);

Object.assign(window, { CheckoutPage });
