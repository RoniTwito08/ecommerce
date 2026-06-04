/* TERRA — Cart & 404 */

const FREE_SHIP = 150;

const OrderSummary = ({ subtotal, go, cta = "Checkout", onCta, compact }) => {
  const { money } = window.TERRA;
  const [promo, setPromo] = useState("");
  const [applied, setApplied] = useState(false);
  const discount = applied ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal === 0 ? 0 : subtotal - discount >= FREE_SHIP ? 0 : 12;
  const total = subtotal - discount + shipping;
  const toFree = Math.max(0, FREE_SHIP - subtotal);

  return (
    <div className="card" style={{ padding: 26 }}>
      <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, marginBottom: 20 }}>Order summary</h3>

      {!compact && (
        <>
          {subtotal > 0 && toFree > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div className="mono faint" style={{ fontSize: 11.5, marginBottom: 8 }}>{money(toFree)} away from free shipping</div>
              <div style={{ height: 6, borderRadius: 3, background: "var(--surface-2)", overflow: "hidden" }}>
                <div style={{ width: Math.min(100, (subtotal / FREE_SHIP) * 100) + "%", height: "100%", background: "var(--accent)", transition: "width .4s" }}></div>
              </div>
            </div>
          )}
          <form className="row" onSubmit={(e) => { e.preventDefault(); if (promo.trim()) setApplied(true); }}
            style={{ gap: 8, marginBottom: 20 }}>
            <input className="input" value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Promo code" style={{ height: 44 }} />
            <button className="btn btn--ghost" type="submit" style={{ height: 44 }}>Apply</button>
          </form>
          {applied && <div className="row" style={{ gap: 6, marginTop: -10, marginBottom: 16, fontSize: 13, color: "oklch(0.45 0.09 150)", fontWeight: 600 }}><Icon name="check" size={14} /> Code applied · 10% off</div>}
        </>
      )}

      <div className="stack" style={{ gap: 12, fontSize: 14.5 }}>
        <Line l="Subtotal" v={money(subtotal)} />
        {discount > 0 && <Line l="Discount (10%)" v={"−" + money(discount)} accent />}
        <Line l="Shipping" v={shipping === 0 ? "Free" : money(shipping)} />
        <Line l="Tax" v="Calculated at checkout" muted small />
      </div>
      <hr className="divider" style={{ margin: "18px 0" }} />
      <div className="row between" style={{ marginBottom: 22 }}>
        <span style={{ fontWeight: 600, fontSize: 16 }}>Total</span>
        <span className="price" style={{ fontSize: 24 }}>{money(total)}</span>
      </div>
      <button className="btn btn--primary btn--lg btn--full btn--block" style={{ display: cta ? undefined : "none" }} disabled={subtotal === 0} onClick={onCta}>
        {cta} <Icon name="arrow" size={17} />
      </button>
      <div className="row" style={{ gap: 14, justifyContent: "center", marginTop: cta ? 18 : 4, color: "var(--ink-3)" }}>
        <span className="row" style={{ gap: 6, fontSize: 11.5 }}><Icon name="shield" size={14} /> Secure</span>
        <span className="row" style={{ gap: 6, fontSize: 11.5 }}><Icon name="truck" size={14} /> Free returns</span>
      </div>
    </div>
  );
};

const Line = ({ l, v, accent, muted, small }) => (
  <div className="row between">
    <span className="muted" style={{ fontSize: small ? 13 : 14.5 }}>{l}</span>
    <span style={{ fontWeight: muted ? 400 : 600, color: accent ? "var(--accent-ink)" : muted ? "var(--ink-3)" : "var(--ink)", fontSize: small ? 13 : 14.5, fontVariantNumeric: "tabular-nums" }}>{v}</span>
  </div>
);

const CartPage = ({ cart, updateQty, remove, subtotal, go }) => {
  const { money, catName } = window.TERRA;

  if (cart.length === 0) {
    return (
      <div className="page wrap" style={{ paddingTop: 40, paddingBottom: 90 }}>
        <h1 className="page-title" style={{ marginBottom: 30 }}>Your cart</h1>
        <EmptyState icon="bag" title="Your cart is empty"
          body="Once you add something you love, it'll live here until you're ready to check out."
          action={<button className="btn btn--primary" onClick={() => go({ name: "catalog" })}>Browse the collection</button>} />
      </div>
    );
  }

  return (
    <div className="page wrap" style={{ paddingTop: 40, paddingBottom: 90 }}>
      <div className="row between" style={{ marginBottom: 30, flexWrap: "wrap", gap: 12 }}>
        <h1 className="page-title">Your cart</h1>
        <span className="muted">{cart.reduce((n, i) => n + i.qty, 0)} items</span>
      </div>

      <div className="shop-2col">
        <div>
          {cart.map((it) => (
            <div className="litem" key={it.id}>
              <button className="litem__media" onClick={() => go({ name: "product", id: it.id })} style={{ border: "none", padding: 0, background: "none" }}>
                <Placeholder tone={it.tone} ratio="4 / 5" style={{ width: "100%" }} />
              </button>
              <div style={{ minWidth: 0 }}>
                <div className="row between" style={{ gap: 12, alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>{it.name}</h3>
                    <div className="mono faint" style={{ fontSize: 11.5, marginTop: 3 }}>{catName(it.category)} · {it.material}</div>
                  </div>
                </div>
                <div className="row between" style={{ marginTop: 16, gap: 12, flexWrap: "wrap" }}>
                  <QtyStepper value={it.qty} onChange={(q) => updateQty(it.id, q)} size="sm" max={Math.max(it.qty, it.stock || 99)} />
                  <button className="btn btn--quiet btn--sm" onClick={() => remove(it.id)} style={{ color: "var(--ink-3)" }}><Icon name="trash" size={15} /> Remove</button>
                </div>
              </div>
              <div className="litem__price-col" style={{ textAlign: "right" }}>
                <div className="price" style={{ fontSize: 16 }}>{money(it.price * it.qty)}</div>
                {it.qty > 1 && <div className="mono faint" style={{ fontSize: 11, marginTop: 3 }}>{money(it.price)} each</div>}
              </div>
            </div>
          ))}
          <button className="btn btn--quiet" style={{ marginTop: 22 }} onClick={() => go({ name: "catalog" })}>
            <Icon name="arrowL" size={16} /> Continue shopping
          </button>
        </div>

        <div className="summary">
          <OrderSummary subtotal={subtotal} go={go} cta="Proceed to checkout" onCta={() => go({ name: "checkout" })} />
        </div>
      </div>
    </div>
  );
};

const NotFoundPage = ({ go }) => (
  <div className="page wrap" style={{ display: "grid", placeItems: "center", minHeight: "calc(100vh - var(--header-h))", textAlign: "center", padding: "60px var(--gutter)" }}>
    <div className="rise" style={{ maxWidth: 480 }}>
      <div className="serif" style={{ fontSize: "clamp(90px, 16vw, 170px)", lineHeight: 0.9, letterSpacing: "-0.04em", color: "var(--ink)" }}>
        4<span style={{ color: "var(--accent)" }}>0</span>4
      </div>
      <h1 className="serif" style={{ fontSize: 30, fontWeight: 400, margin: "18px 0 12px" }}>This page wandered off.</h1>
      <p className="muted" style={{ fontSize: 16, marginBottom: 30, maxWidth: 380, marginInline: "auto" }}>
        The page you're looking for doesn't exist or has moved. Let's get you back to the good stuff.
      </p>
      <div className="row" style={{ gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn btn--primary btn--lg" onClick={() => go({ name: "home" })}><Icon name="arrowL" size={16} /> Back to home</button>
        <button className="btn btn--ghost btn--lg" onClick={() => go({ name: "catalog" })}>Shop the collection</button>
      </div>
    </div>
  </div>
);

Object.assign(window, { CartPage, NotFoundPage, OrderSummary });
