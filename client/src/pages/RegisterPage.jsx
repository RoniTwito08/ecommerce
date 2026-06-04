import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

function PasswordField({ value, onChange, error, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <label>Password</label>
      <div style={{ position: 'relative' }}>
        <input className={'input' + (error ? ' input--error' : '')} type={show ? 'text' : 'password'}
          value={value} onChange={onChange} placeholder="••••••••" autoComplete={autoComplete} style={{ paddingRight: 52 }} />
        <button type="button" className="hdr-icon" onClick={() => setShow((s) => !s)}
          style={{ position: 'absolute', right: 5, top: 3, width: 42, height: 42 }} aria-label="toggle password">
          <Icon name={show ? 'close' : 'user'} size={16} />
        </button>
      </div>
      {error
        ? <span className="field-err"><Icon name="alert" size={13} />{error}</span>
        : <span className="field-hint">Use 6+ characters with a mix of letters and numbers.</span>}
    </div>
  );
}

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();

  const [f, setF] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const pwScore = Math.min(4,
    (f.password.length >= 6 ? 1 : 0) +
    (/[A-Z]/.test(f.password) ? 1 : 0) +
    (/[0-9]/.test(f.password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(f.password) ? 1 : 0)
  );

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!f.firstName.trim()) next.firstName = 'Required';
    if (!f.lastName.trim()) next.lastName = 'Required';
    if (!isEmail(f.email)) next.email = 'Enter a valid email address.';
    if (f.password.length < 6) next.password = 'At least 6 characters.';
    setErr(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await register(f);
      navigate('/account', { replace: true });
    } catch (apiErr) {
      const msg = apiErr.response?.data?.message || 'Registration failed. Please try again.';
      setErr({ api: msg });
      toast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <AuthAside tone="rust" label="editorial · maker hands" title="Join Terra."
        lines={['Members-only early access', 'Free returns on every order', 'A wishlist that syncs everywhere']} />
      <div className="auth-form-col">
        <div className="auth-card rise">
          <span className="eyebrow eyebrow--accent">Create account</span>
          <h1 className="serif" style={{ fontSize: 36, fontWeight: 400, letterSpacing: '-0.02em', margin: '12px 0 6px' }}>Create your account</h1>
          <p className="muted" style={{ marginBottom: 30 }}>
            Already a member? <Link to="/login" style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>Sign in</Link>
          </p>

          {err.api && (
            <div className="row" style={{ gap: 8, padding: '12px 16px', background: 'var(--danger-soft)', borderRadius: 'var(--r-md)', marginBottom: 18, fontSize: 14, color: 'oklch(0.46 0.13 28)' }}>
              <Icon name="alert" size={15} /> {err.api}
            </div>
          )}

          <form className="stack" style={{ gap: 18 }} onSubmit={submit} noValidate>
            <div className="field-row">
              <div className="field">
                <label>First name</label>
                <input className={'input' + (err.firstName ? ' input--error' : '')} value={f.firstName} onChange={set('firstName')} placeholder="Elise" autoComplete="given-name" />
                {err.firstName && <span className="field-err"><Icon name="alert" size={13} />{err.firstName}</span>}
              </div>
              <div className="field">
                <label>Last name</label>
                <input className={'input' + (err.lastName ? ' input--error' : '')} value={f.lastName} onChange={set('lastName')} placeholder="Moreau" autoComplete="family-name" />
                {err.lastName && <span className="field-err"><Icon name="alert" size={13} />{err.lastName}</span>}
              </div>
            </div>
            <div className="field">
              <label>Email</label>
              <input className={'input' + (err.email ? ' input--error' : '')} type="email" value={f.email} onChange={set('email')} placeholder="you@email.com" autoComplete="email" />
              {err.email && <span className="field-err"><Icon name="alert" size={13} />{err.email}</span>}
            </div>
            <PasswordField value={f.password} onChange={set('password')} error={err.password} autoComplete="new-password" />
            {f.password && (
              <div className="row" style={{ gap: 6, marginTop: -6 }}>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < pwScore ? (pwScore >= 3 ? 'var(--ok)' : 'var(--accent)') : 'var(--line-2)' }}></span>
                ))}
              </div>
            )}
            <label className="row" style={{ gap: 9, fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer', alignItems: 'flex-start' }}>
              <input type="checkbox" required style={{ accentColor: 'var(--accent)', width: 16, height: 16, marginTop: 2 }} />
              <span>I agree to Terra's <span style={{ color: 'var(--accent-ink)' }}>Terms</span> and <span style={{ color: 'var(--accent-ink)' }}>Privacy Policy</span>.</span>
            </label>
            <button className="btn btn--primary btn--lg btn--full btn--block" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : <><span>Create account</span> <Icon name="arrow" size={17} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
