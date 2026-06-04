/* TERRA — App root: routing, cart, toasts, tweaks */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#b15a35",
  "headings": "Editorial",
  "corners": "Rounded",
  "catalogState": "normal"
}/*EDITMODE-END*/;

const ACCENTS = {
  "#b15a35": { a: "oklch(0.585 0.115 45)", d: "oklch(0.50 0.105 42)", s: "oklch(0.94 0.030 55)", k: "oklch(0.40 0.090 42)" },
  "#3f7d52": { a: "oklch(0.55 0.085 150)", d: "oklch(0.47 0.08 150)", s: "oklch(0.93 0.030 150)", k: "oklch(0.40 0.072 150)" },
  "#3f63b5": { a: "oklch(0.54 0.10 262)", d: "oklch(0.47 0.095 262)", s: "oklch(0.93 0.035 262)", k: "oklch(0.44 0.09 262)" },
  "#9a5a86": { a: "oklch(0.55 0.095 340)", d: "oklch(0.48 0.09 340)", s: "oklch(0.93 0.032 340)", k: "oklch(0.44 0.085 340)" },
  "#a98327": { a: "oklch(0.64 0.10 80)", d: "oklch(0.56 0.095 78)", s: "oklch(0.94 0.035 85)", k: "oklch(0.46 0.085 78)" },
};

function applyTweaks(t) {
  const root = document.documentElement;
  const ac = ACCENTS[t.accent] || ACCENTS["#b15a35"];
  root.style.setProperty("--accent", ac.a);
  root.style.setProperty("--accent-deep", ac.d);
  root.style.setProperty("--accent-soft", ac.s);
  root.style.setProperty("--accent-ink", ac.k);
  root.style.setProperty("--serif", t.headings === "Modern"
    ? '"Hanken Grotesk", sans-serif'
    : '"Newsreader", Georgia, serif');
  const sharp = t.corners === "Sharp";
  root.style.setProperty("--r-sm", sharp ? "3px" : "8px");
  root.style.setProperty("--r-md", sharp ? "4px" : "12px");
  root.style.setProperty("--r-lg", sharp ? "5px" : "18px");
  root.style.setProperty("--r-xl", sharp ? "7px" : "26px");
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useState(() => {
    try { return JSON.parse(localStorage.getItem("terra:route")) || { name: "home" }; }
    catch (e) { return { name: "home" }; }
  });
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("terra:cart")) || []; }
    catch (e) { return []; }
  });
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("terra:user")) || null; }
    catch (e) { return null; }
  });
  const [toasts, setToasts] = useState([]);

  useEffect(() => { applyTweaks(t); }, [t]);
  useEffect(() => { localStorage.setItem("terra:route", JSON.stringify(route)); }, [route]);
  useEffect(() => { localStorage.setItem("terra:cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("terra:user", JSON.stringify(user)); }, [user]);

  const go = (r) => { setRoute(r); window.scrollTo({ top: 0, behavior: "auto" }); };

  const pushToast = (msg, product) => {
    const id = Date.now() + Math.random();
    setToasts((ts) => [...ts, { id, msg, product }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 3200);
  };

  const addToCart = (p, qty = 1) => {
    setCart((c) => {
      const ex = c.find((i) => i.id === p.id);
      if (ex) return c.map((i) => i.id === p.id ? { ...i, qty: i.qty + qty } : i);
      return [...c, { ...p, qty }];
    });
    pushToast("Added to cart", p);
  };
  const updateQty = (id, qty) => setCart((c) => c.map((i) => i.id === id ? { ...i, qty } : i));
  const removeFromCart = (id) => setCart((c) => c.filter((i) => i.id !== id));

  const subtotal = cart.reduce((n, i) => n + i.price * i.qty, 0);
  const cartCount = cart.reduce((n, i) => n + i.qty, 0);

  const onAuth = (u) => setUser({ ...window.TERRA.user, ...u });
  const onLogout = () => { setUser(null); go({ name: "home" }); };

  // route → query is held here so header search & catalog share it
  const [query, setQuery] = useState("");

  const fullChrome = !["login", "register", "notfound"].includes(route.name);

  let screen;
  switch (route.name) {
    case "home": screen = <HomePage go={go} onAdd={addToCart} />; break;
    case "catalog": screen = <CatalogPage go={go} onAdd={addToCart} route={route} query={query} setQuery={setQuery} forcedState={t.catalogState} />; break;
    case "product": screen = <ProductPage go={go} onAdd={addToCart} route={route} />; break;
    case "login": screen = <LoginPage go={go} onAuth={onAuth} />; break;
    case "register": screen = <RegisterPage go={go} onAuth={onAuth} />; break;
    case "cart": screen = <CartPage cart={cart} updateQty={updateQty} remove={removeFromCart} subtotal={subtotal} go={go} />; break;
    case "checkout": screen = <CheckoutPage cart={cart} subtotal={subtotal} go={go} user={user} onComplete={() => setCart([])} />; break;
    case "account": screen = <AccountPage go={go} user={user} onLogout={onLogout} />; break;
    case "orders": screen = <OrdersPage go={go} />; break;
    default: screen = <NotFoundPage go={go} />;
  }

  return (
    <>
      {fullChrome && <Header go={go} route={route} cartCount={cartCount} query={query} setQuery={setQuery} user={user} />}
      {/* minimal header for auth/404 */}
      {!fullChrome && (
        <div className="wrap row between" style={{ height: 72 }}>
          <a href="#" className="serif" style={{ fontSize: 24, letterSpacing: "0.06em", fontWeight: 500 }} onClick={(e) => { e.preventDefault(); go({ name: "home" }); }}>
            TERRA<span style={{ color: "var(--accent)" }}>.</span>
          </a>
          {route.name !== "notfound" && (
            <button className="btn btn--quiet btn--sm" onClick={() => go({ name: route.name === "login" ? "register" : "login" })}>
              {route.name === "login" ? "Create account" : "Sign in"}
            </button>
          )}
        </div>
      )}

      <main>{screen}</main>

      {fullChrome && <Footer go={go} />}

      {/* toasts */}
      <div className="toast-host">
        {toasts.map((to) => (
          <div className="toast" key={to.id}>
            {to.product && <div className="toast__thumb"><Placeholder tone={to.product.tone} style={{ width: "100%", height: "100%" }} /></div>}
            <span><Icon name="check" size={15} style={{ verticalAlign: "-2px", marginRight: 4, color: "var(--accent)" }} />{to.msg}</span>
            <button className="btn btn--sm" style={{ background: "var(--accent)", color: "#fff", height: 32, marginLeft: 4 }} onClick={() => go({ name: "cart" })}>View cart</button>
          </div>
        ))}
      </div>

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label="Brand accent" />
        <TweakColor label="Accent" value={t.accent}
          options={Object.keys(ACCENTS)}
          onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="Type & shape" />
        <TweakRadio label="Headings" value={t.headings} options={["Editorial", "Modern"]}
          onChange={(v) => setTweak("headings", v)} />
        <TweakRadio label="Corners" value={t.corners} options={["Rounded", "Sharp"]}
          onChange={(v) => setTweak("corners", v)} />
        <TweakSection label="Demo states" />
        <TweakSelect label="Catalog" value={t.catalogState}
          options={["normal", "loading", "empty", "error"]}
          onChange={(v) => setTweak("catalogState", v)} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
