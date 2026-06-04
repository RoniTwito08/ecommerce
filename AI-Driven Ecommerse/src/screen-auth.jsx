/* TERRA — Login & Register */

const AuthAside = ({ tone, label, title, lines }) => (
  <div className="auth-aside">
    <Placeholder tone={tone} label={label} style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, oklch(0.2 0.02 50 / 0.6), oklch(0.2 0.02 50 / 0.1))" }}></div>
    <div style={{ position: "absolute", left: 44, right: 44, bottom: 48, color: "#fff" }}>
      <div className="serif" style={{ fontSize: 30, letterSpacing: "0.05em", marginBottom: 18 }}>TERRA<span style={{ color: "var(--accent)" }}>.</span></div>
      <h2 className="serif" style={{ fontSize: "clamp(28px,3vw,40px)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em" }}>{title}</h2>
      <ul className="stack" style={{ gap: 12, marginTop: 24 }}>
        {lines.map((l) => (
          <li key={l} className="row" style={{ gap: 10, color: "oklch(1 0 0 / 0.85)", fontSize: 14.5 }}>
            <Icon name="check" size={16} style={{ color: "var(--accent)" }} /> {l}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const PasswordField = ({ label = "Password", value, onChange, error, autoComplete, hint }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <label>{label}</label>
      <div style={{ position: "relative" }}>
        <input className={"input" + (error ? " input--error" : "")} type={show ? "text" : "password"}
          value={value} onChange={onChange} placeholder="••••••••" autoComplete={autoComplete} style={{ paddingRight: 52 }} />
        <button type="button" className="hdr-icon" onClick={() => setShow((s) => !s)}
          style={{ position: "absolute", right: 5, top: 3, width: 42, height: 42 }} aria-label="toggle password">
          <Icon name={show ? "close" : "user"} size={16} />
        </button>
      </div>
      {error ? <span className="field-err"><Icon name="alert" size={13} />{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
};

const LoginPage = ({ go, onAuth }) => {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!isEmail(email)) next.email = "Enter a valid email address.";
    if (pw.length < 6) next.pw = "Password must be at least 6 characters.";
    setErr(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onAuth({ email }); go({ name: "account" }); }, 850);
  };

  return (
    <div className="auth-wrap">
      <AuthAside tone="clay" label="editorial · still life" title="Welcome back to Terra."
        lines={["Track orders and returns", "Save pieces to your wishlist", "Faster checkout, every time"]} />
      <div className="auth-form-col">
        <div className="auth-card rise">
          <span className="eyebrow eyebrow--accent">Sign in</span>
          <h1 className="serif" style={{ fontSize: 36, fontWeight: 400, letterSpacing: "-0.02em", margin: "12px 0 6px" }}>Sign in to your account</h1>
          <p className="muted" style={{ marginBottom: 30 }}>New here? <a href="#" style={{ color: "var(--accent-ink)", fontWeight: 600 }} onClick={(e) => { e.preventDefault(); go({ name: "register" }); }}>Create an account</a></p>

          <form className="stack" style={{ gap: 18 }} onSubmit={submit} noValidate>
            <div className="field">
              <label>Email</label>
              <input className={"input" + (err.email ? " input--error" : "")} type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" />
              {err.email && <span className="field-err"><Icon name="alert" size={13} />{err.email}</span>}
            </div>
            <PasswordField value={pw} onChange={(e) => setPw(e.target.value)} error={err.pw} autoComplete="current-password" />
            <div className="row between" style={{ marginTop: -4 }}>
              <label className="row" style={{ gap: 8, fontSize: 13.5, color: "var(--ink-2)", cursor: "pointer" }}>
                <input type="checkbox" defaultChecked style={{ accentColor: "var(--accent)", width: 16, height: 16 }} /> Remember me
              </label>
              <a href="#" style={{ fontSize: 13.5, color: "var(--accent-ink)", fontWeight: 600 }} onClick={(e) => e.preventDefault()}>Forgot password?</a>
            </div>
            <button className="btn btn--primary btn--lg btn--full btn--block" type="submit" disabled={loading}>
              {loading ? "Signing in…" : <>Sign in <Icon name="arrow" size={17} /></>}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>
          <div className="row" style={{ gap: 12 }}>
            <button className="btn btn--ghost btn--full btn--block" onClick={() => { onAuth({ email: window.TERRA.user.email }); go({ name: "account" }); }}>Continue with Apple</button>
            <button className="btn btn--ghost btn--full btn--block" onClick={() => { onAuth({ email: window.TERRA.user.email }); go({ name: "account" }); }}>Continue with Google</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RegisterPage = ({ go, onAuth }) => {
  const [f, setF] = useState({ first: "", last: "", email: "", pw: "" });
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const pwScore = Math.min(4, (f.pw.length >= 6 ? 1 : 0) + (/[A-Z]/.test(f.pw) ? 1 : 0) + (/[0-9]/.test(f.pw) ? 1 : 0) + (/[^A-Za-z0-9]/.test(f.pw) ? 1 : 0));

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!f.first.trim()) next.first = "Required";
    if (!f.last.trim()) next.last = "Required";
    if (!isEmail(f.email)) next.email = "Enter a valid email address.";
    if (f.pw.length < 6) next.pw = "At least 6 characters.";
    setErr(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onAuth({ email: f.email, first: f.first, last: f.last }); go({ name: "account" }); }, 900);
  };

  return (
    <div className="auth-wrap">
      <AuthAside tone="rust" label="editorial · maker hands" title="Join Terra."
        lines={["Members-only early access", "Free returns on every order", "A wishlist that syncs everywhere"]} />
      <div className="auth-form-col">
        <div className="auth-card rise">
          <span className="eyebrow eyebrow--accent">Create account</span>
          <h1 className="serif" style={{ fontSize: 36, fontWeight: 400, letterSpacing: "-0.02em", margin: "12px 0 6px" }}>Create your account</h1>
          <p className="muted" style={{ marginBottom: 30 }}>Already a member? <a href="#" style={{ color: "var(--accent-ink)", fontWeight: 600 }} onClick={(e) => { e.preventDefault(); go({ name: "login" }); }}>Sign in</a></p>

          <form className="stack" style={{ gap: 18 }} onSubmit={submit} noValidate>
            <div className="field-row">
              <div className="field">
                <label>First name</label>
                <input className={"input" + (err.first ? " input--error" : "")} value={f.first} onChange={set("first")} placeholder="Elise" autoComplete="given-name" />
                {err.first && <span className="field-err"><Icon name="alert" size={13} />{err.first}</span>}
              </div>
              <div className="field">
                <label>Last name</label>
                <input className={"input" + (err.last ? " input--error" : "")} value={f.last} onChange={set("last")} placeholder="Moreau" autoComplete="family-name" />
                {err.last && <span className="field-err"><Icon name="alert" size={13} />{err.last}</span>}
              </div>
            </div>
            <div className="field">
              <label>Email</label>
              <input className={"input" + (err.email ? " input--error" : "")} type="email" value={f.email} onChange={set("email")} placeholder="you@email.com" autoComplete="email" />
              {err.email && <span className="field-err"><Icon name="alert" size={13} />{err.email}</span>}
            </div>
            <PasswordField value={f.pw} onChange={set("pw")} error={err.pw} autoComplete="new-password" hint="Use 6+ characters with a mix of letters and numbers." />
            {f.pw && (
              <div className="row" style={{ gap: 6, marginTop: -6 }}>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < pwScore ? (pwScore >= 3 ? "var(--ok)" : "var(--accent)") : "var(--line-2)" }}></span>
                ))}
              </div>
            )}
            <label className="row" style={{ gap: 9, fontSize: 13, color: "var(--ink-2)", cursor: "pointer", alignItems: "flex-start" }}>
              <input type="checkbox" required style={{ accentColor: "var(--accent)", width: 16, height: 16, marginTop: 2 }} />
              <span>I agree to Terra's <a href="#" style={{ color: "var(--accent-ink)" }} onClick={(e) => e.preventDefault()}>Terms</a> and <a href="#" style={{ color: "var(--accent-ink)" }} onClick={(e) => e.preventDefault()}>Privacy Policy</a>.</span>
            </label>
            <button className="btn btn--primary btn--lg btn--full btn--block" type="submit" disabled={loading}>
              {loading ? "Creating account…" : <>Create account <Icon name="arrow" size={17} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { LoginPage, RegisterPage });
