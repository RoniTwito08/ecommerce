/* TERRA — Account & Orders */

const OrderRow = ({ o, go, expandable }) => {
  const { money } = window.TERRA;
  const [open, setOpen] = useState(false);
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 14 }}>
      <div className="order-head">
        <div className="row" style={{ gap: 18, flexWrap: "wrap" }}>
          <div>
            <div className="mono faint" style={{ fontSize: 11 }}>Order</div>
            <div style={{ fontWeight: 600, fontFamily: "var(--mono)", fontSize: 14 }}>{o.id}</div>
          </div>
          <div>
            <div className="mono faint" style={{ fontSize: 11 }}>Placed</div>
            <div style={{ fontSize: 14 }}>{o.date}</div>
          </div>
          <div>
            <div className="mono faint" style={{ fontSize: 11 }}>Total</div>
            <div className="price" style={{ fontSize: 14 }}>{money(o.total)}</div>
          </div>
        </div>
        <div className="row" style={{ gap: 14 }}>
          <StatusBadge status={o.status} />
          <button className="btn btn--ghost btn--sm" onClick={() => expandable ? setOpen((v) => !v) : go({ name: "orders" })}>
            {expandable ? (open ? "Hide" : "View details") : "View"} <Icon name={open ? "chevDown" : "chevron"} size={14} />
          </button>
        </div>
      </div>
      {/* thumbnails always */}
      <div className="order-thumbs">
        {o.items.map((it) => (
          <button key={it.id} className="order-thumb" onClick={() => go({ name: "product", id: it.id })} title={it.name}>
            <Placeholder tone={it.tone} style={{ width: "100%", height: "100%" }} />
          </button>
        ))}
        <span className="muted" style={{ fontSize: 13.5, marginLeft: 6 }}>{o.items.length} {o.items.length === 1 ? "item" : "items"}</span>
      </div>
      {open && (
        <div className="fade" style={{ borderTop: "1px solid var(--line)", padding: "6px 22px 14px" }}>
          {o.items.map((it) => (
            <div key={it.id} className="row between" style={{ padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
              <div className="row" style={{ gap: 12 }}>
                <Placeholder tone={it.tone} style={{ width: 46, height: 46, borderRadius: 8 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{it.name}</div>
                  <div className="mono faint" style={{ fontSize: 11 }}>{window.TERRA.catName(it.category)}</div>
                </div>
              </div>
              <span className="price" style={{ fontSize: 14 }}>{money(it.price)}</span>
            </div>
          ))}
          <div className="row" style={{ gap: 10, marginTop: 16 }}>
            <button className="btn btn--ghost btn--sm" onClick={() => go({ name: "product", id: o.items[0].id })}>Buy again</button>
            <button className="btn btn--quiet btn--sm">Track package <Icon name="truck" size={15} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

const OrdersPage = ({ go }) => {
  const { ORDERS } = window.TERRA;
  return (
    <div className="page wrap" style={{ paddingTop: 28, paddingBottom: 90 }}>
      <div className="crumb" style={{ marginBottom: 16 }}>
        <a href="#" onClick={(e) => { e.preventDefault(); go({ name: "account" }); }}>Account</a>
        <Icon name="chevron" /><span style={{ color: "var(--ink)" }}>Orders</span>
      </div>
      <h1 className="page-title" style={{ marginBottom: 8 }}>Your orders</h1>
      <p className="muted" style={{ marginBottom: 36 }}>{ORDERS.length} orders since {window.TERRA.user.since}</p>
      {ORDERS.length === 0
        ? <EmptyState icon="box" title="No orders yet" body="When you place your first order it'll show up here, with tracking and easy reordering."
            action={<button className="btn btn--primary" onClick={() => go({ name: "catalog" })}>Start shopping</button>} />
        : <div style={{ maxWidth: 820 }}>{ORDERS.map((o) => <OrderRow key={o.id} o={o} go={go} expandable />)}</div>}
    </div>
  );
};

const AccountPage = ({ go, user, onLogout }) => {
  const { ORDERS, user: demo } = window.TERRA;
  const [tab, setTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    first: (user && user.first) || demo.first,
    last: (user && user.last) || demo.last,
    email: (user && user.email) || demo.email,
    phone: "+351 912 004 118",
    city: demo.city,
  });
  const [saved, setSaved] = useState(false);
  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));
  const save = () => { setEditing(false); setSaved(true); setTimeout(() => setSaved(false), 1800); };

  const nav = [
    { id: "profile", label: "Profile", icon: "user" },
    { id: "orders", label: "Orders", icon: "box" },
    { id: "addresses", label: "Addresses", icon: "pin" },
    { id: "wishlist", label: "Wishlist", icon: "heart" },
  ];

  return (
    <div className="page wrap" style={{ paddingTop: 40, paddingBottom: 90 }}>
      <div className="row between" style={{ marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="eyebrow">Account</span>
          <h1 className="page-title" style={{ marginTop: 10 }}>Hello, {form.first}</h1>
        </div>
        <button className="btn btn--ghost" onClick={onLogout}><Icon name="logout" size={16} /> Sign out</button>
      </div>

      <div className="acct-grid">
        <nav className="acct-nav">
          {nav.map((n) => (
            <button key={n.id} className={tab === n.id ? "active" : ""}
              onClick={() => n.id === "orders" ? go({ name: "orders" }) : setTab(n.id)}>
              <Icon name={n.icon} size={17} /> {n.label}
            </button>
          ))}
        </nav>

        <div>
          {tab === "profile" && (
            <div className="stack fade" style={{ gap: 26 }}>
              {/* profile summary */}
              <div className="card" style={{ padding: 26, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                <div className="avatar serif">{form.first[0]}{form.last[0]}</div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <h3 style={{ fontSize: 20 }}>{form.first} {form.last}</h3>
                  <p className="muted" style={{ fontSize: 14 }}>{form.email}</p>
                  <div className="row" style={{ gap: 8, marginTop: 10 }}>
                    <span className="badge badge--accent">Member since {demo.since}</span>
                    <span className="badge">{ORDERS.length} orders</span>
                  </div>
                </div>
              </div>

              {/* editable details */}
              <div className="card" style={{ padding: 26 }}>
                <div className="row between" style={{ marginBottom: 22 }}>
                  <h3 className="serif" style={{ fontSize: 22, fontWeight: 400 }}>Personal details</h3>
                  {!editing
                    ? <button className="btn btn--ghost btn--sm" onClick={() => setEditing(true)}><Icon name="edit" size={15} /> Edit</button>
                    : <div className="row" style={{ gap: 8 }}>
                        <button className="btn btn--quiet btn--sm" onClick={() => setEditing(false)}>Cancel</button>
                        <button className="btn btn--primary btn--sm" onClick={save}>Save changes</button>
                      </div>}
                </div>
                <div className="field-row" style={{ gap: 18, marginBottom: 18 }}>
                  <DetailField label="First name" v={form.first} on={set("first")} editing={editing} />
                  <DetailField label="Last name" v={form.last} on={set("last")} editing={editing} />
                </div>
                <div className="field-row" style={{ gap: 18, marginBottom: 18 }}>
                  <DetailField label="Email" v={form.email} on={set("email")} editing={editing} />
                  <DetailField label="Phone" v={form.phone} on={set("phone")} editing={editing} />
                </div>
                <DetailField label="City" v={form.city} on={set("city")} editing={editing} />
                {saved && <div className="row" style={{ gap: 8, marginTop: 18, color: "oklch(0.45 0.09 150)", fontSize: 14, fontWeight: 600 }}><Icon name="check" size={16} /> Changes saved</div>}
              </div>

              {/* recent orders preview */}
              <div>
                <div className="row between" style={{ marginBottom: 16 }}>
                  <h3 className="serif" style={{ fontSize: 22, fontWeight: 400 }}>Recent orders</h3>
                  <button className="btn btn--quiet btn--sm" onClick={() => go({ name: "orders" })}>View all <Icon name="arrow" size={14} /></button>
                </div>
                {ORDERS.slice(0, 2).map((o) => <OrderRow key={o.id} o={o} go={go} />)}
              </div>
            </div>
          )}

          {tab === "addresses" && (
            <div className="fade stack" style={{ gap: 16 }}>
              <div className="card" style={{ padding: 24, display: "flex", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div className="row" style={{ gap: 8, marginBottom: 8 }}><span className="badge badge--accent">Default</span><span className="badge">Shipping</span></div>
                  <h3 style={{ fontSize: 16 }}>{form.first} {form.last}</h3>
                  <p className="muted" style={{ fontSize: 14, lineHeight: 1.5, marginTop: 4 }}>Rua do Alecrim 42, 2º<br />1200-018 {form.city}<br />{form.phone}</p>
                </div>
                <button className="btn btn--ghost btn--sm" style={{ alignSelf: "flex-start" }}><Icon name="edit" size={15} /> Edit</button>
              </div>
              <button className="btn btn--ghost btn--block" style={{ height: 88, borderStyle: "dashed", color: "var(--ink-2)" }}><Icon name="plus" size={18} /> Add a new address</button>
            </div>
          )}

          {tab === "wishlist" && (
            <EmptyState icon="heart" title="Your wishlist is empty"
              body="Tap the heart on any piece to save it here for later."
              action={<button className="btn btn--primary" onClick={() => go({ name: "catalog" })}>Browse the collection</button>} />
          )}
        </div>
      </div>
    </div>
  );
};

const DetailField = ({ label, v, on, editing }) => (
  <div className="field">
    <label>{label}</label>
    {editing
      ? <input className="input" value={v} onChange={on} />
      : <div style={{ fontSize: 15.5, fontWeight: 500, padding: "10px 2px", borderBottom: "1px solid var(--line)" }}>{v}</div>}
  </div>
);

Object.assign(window, { AccountPage, OrdersPage });
