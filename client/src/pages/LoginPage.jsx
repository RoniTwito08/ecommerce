import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Icon from '../components/common/Icon';
import Placeholder from '../components/common/Placeholder';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function AuthAside({ tone, label, title, lines }) {
  return (
    <div className="auth-aside">
      <Placeholder tone={tone} label={label} style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, oklch(0.2 0.02 50 / 0.6), oklch(0.2 0.02 50 / 0.1))' }}></div>
      <div style={{ position: 'absolute', left: 44, right: 44, bottom: 48, color: '#fff' }}>
        <div className="serif" style={{ fontSize: 30, letterSpacing: '0.05em', marginBottom: 18 }}>TERRA<span style={{ color: 'var(--accent)' }}>.</span></div>
        <h2 className="serif" style={{ fontSize: 'clamp(28px,3vw,40px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{title}</h2>
        <ul className="stack" style={{ gap: 12, marginTop: 24 }}>
          {lines.map((l) => (
            <li key={l} className="row" style={{ gap: 10, color: 'oklch(1 0 0 / 0.85)', fontSize: 14.5 }}>
              <Icon name="check" size={16} style={{ color: 'var(--accent)' }} /> {l}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PasswordField({ label = 'Password', value, onChange, error, autoComplete, hint }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <label>{label}</label>
      <div style={{ position: 'relative' }}>
        <input className={'input' + (error ? ' input--error' : '')} type={show ? 'text' : 'password'}
          value={value} onChange={onChange} placeholder="••••••••" autoComplete={autoComplete} style={{ paddingRight: 52 }} />
        <button type="button" className="hdr-icon" onClick={() => setShow((s) => !s)}
          style={{ position: 'absolute', right: 5, top: 3, width: 42, height: 42 }} aria-label="toggle password">
          <Icon name={show ? 'close' : 'user'} size={16} />
        </button>
      </div>
      {error ? <span className="field-err"><Icon name="alert" size={13} />{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/account';

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!isEmail(email)) next.email = 'Enter a valid email address.';
    if (pw.length < 6) next.pw = 'Password must be at least 6 characters.';
    setErr(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await login({ email, password: pw });
      navigate(from, { replace: true });
    } catch (apiErr) {
      const msg = apiErr.response?.data?.message || 'Invalid email or password.';
      setErr({ api: msg });
      toast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <AuthAside tone="clay" label="editorial · still life" title="Welcome back to Terra."
        lines={['Track orders and returns', 'Save pieces to your wishlist', 'Faster checkout, every time']} />
      <div className="auth-form-col">
        <div className="auth-card rise">
          <span className="eyebrow eyebrow--accent">Sign in</span>
          <h1 className="serif" style={{ fontSize: 36, fontWeight: 400, letterSpacing: '-0.02em', margin: '12px 0 6px' }}>Sign in to your account</h1>
          <p className="muted" style={{ marginBottom: 30 }}>
            New here? <Link to="/register" style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>Create an account</Link>
          </p>

          {err.api && (
            <div className="row" style={{ gap: 8, padding: '12px 16px', background: 'var(--danger-soft)', borderRadius: 'var(--r-md)', marginBottom: 18, fontSize: 14, color: 'oklch(0.46 0.13 28)' }}>
              <Icon name="alert" size={15} /> {err.api}
            </div>
          )}

          <form className="stack" style={{ gap: 18 }} onSubmit={submit} noValidate>
            <div className="field">
              <label>Email</label>
              <input className={'input' + (err.email ? ' input--error' : '')} type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" />
              {err.email && <span className="field-err"><Icon name="alert" size={13} />{err.email}</span>}
            </div>
            <PasswordField value={pw} onChange={(e) => setPw(e.target.value)} error={err.pw} autoComplete="current-password" />
            <button className="btn btn--primary btn--lg btn--full btn--block" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : <><span>Sign in</span> <Icon name="arrow" size={17} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
