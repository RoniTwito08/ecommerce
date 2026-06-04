import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';
import { categoryApi } from '../../api/category.api';

export default function Footer() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryApi.getCategories().then(({ data }) => setCategories(data.data.categories)).catch(() => {});
  }, []);

  const cols = [
    { h: 'Shop', links: categories.map((c) => ({ label: c.name, to: `/products?categoryId=${c.id}` })) },
    { h: 'Company',  links: [{ label: 'Our Story' }, { label: 'Makers' }, { label: 'Sustainability' }, { label: 'Journal' }] },
    { h: 'Support',  links: [{ label: 'Shipping & Returns' }, { label: 'Care Guide' }, { label: 'Contact' }, { label: 'FAQ' }] },
  ];

  return (
    <footer style={{ background: 'var(--dark)', color: 'var(--on-dark)', marginTop: 0 }}>
      <div className="wrap" style={{ padding: '76px var(--gutter) 40px' }}>
        <div className="footer-grid">
          <div style={{ maxWidth: 320 }}>
            <div className="serif" style={{ fontSize: 30, letterSpacing: '0.05em', marginBottom: 16 }}>
              TERRA<span style={{ color: 'var(--accent)' }}>.</span>
            </div>
            <p style={{ color: 'var(--on-dark-2)', fontSize: 14.5, lineHeight: 1.6, marginBottom: 22 }}>
              Objects for considered living. Made by hand, built to age, shipped from our studio.
            </p>
            <form className="row" onSubmit={(e) => e.preventDefault()} style={{ gap: 8, border: '1px solid var(--dark-2)', borderRadius: 'var(--r-pill)', padding: '5px 6px 5px 18px', maxWidth: 320 }}>
              <input placeholder="Email for new arrivals" style={{ border: 'none', outline: 'none', background: 'transparent', color: 'var(--on-dark)', flex: 1, fontSize: 14 }} />
              <button className="btn btn--on-dark btn--sm" type="submit">Join</button>
            </form>
          </div>
          {cols.map((col) => (
            <div key={col.h}>
              <div className="eyebrow" style={{ color: 'var(--on-dark-2)', marginBottom: 18 }}>{col.h}</div>
              <ul className="stack" style={{ gap: 11 }}>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <button className="footer-link" onClick={() => l.to && navigate(l.to)}
                      style={{ background: 'none', border: 'none', cursor: l.to ? 'pointer' : 'default', font: 'inherit', padding: 0 }}>
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-base">
          <span>© 2026 Terra Studio. All rights reserved.</span>
          <div className="row" style={{ gap: 22 }}>
            <span className="footer-link">Privacy</span>
            <span className="footer-link">Terms</span>
            <span className="mono" style={{ color: 'var(--on-dark-2)', fontSize: 12 }}>EN · USD $</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
