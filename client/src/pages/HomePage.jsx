import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icon';
import Placeholder from '../components/common/Placeholder';
import ProductCard from '../components/products/ProductCard';
import SkeletonGrid from '../components/common/SkeletonGrid';
import { productApi } from '../api/product.api';
import { categoryApi } from '../api/category.api';
import { money } from '../utils/format';

const BENEFITS = [
  { icon: 'truck',   t: 'Free shipping over $150', s: 'Carbon-neutral delivery' },
  { icon: 'leaf',    t: 'Made to last',             s: 'Natural, durable materials' },
  { icon: 'shield',  t: 'Two-year guarantee',       s: 'We stand behind every piece' },
  { icon: 'box',     t: '30-day returns',           s: 'Free, no questions asked' },
];

const TONES = ['clay', 'rust', 'sage', 'sand', 'stone', 'teal'];

export default function HomePage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [arrivals, setArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productApi.getProducts({ limit: 8, sort: 'newest' }),
      productApi.getProducts({ limit: 8, sort: 'name_asc' }),
      categoryApi.getCategories(),
    ]).then(([newRes, featRes, catRes]) => {
      setArrivals(newRes.data.data.slice(0, 4));
      setFeatured(featRes.data.data.slice(0, 4));
      setCategories(catRes.data.data.categories);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      {/* HERO */}
      <section className="hero">
        <div className="hero-grid">
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px var(--gutter) 64px', maxWidth: 640, marginLeft: 'auto', width: '100%' }}>
            <div className="wrap" style={{ padding: 0, maxWidth: 560, marginLeft: 'auto', marginRight: 0 }}>
              <span className="eyebrow eyebrow--accent rise">New · Spring Collection 2026</span>
              <h1 className="serif rise" style={{ fontSize: 'clamp(44px, 6vw, 82px)', lineHeight: 0.98, letterSpacing: '-0.03em', margin: '20px 0 0', fontWeight: 400, animationDelay: '.05s' }}>
                Objects for<br />considered<br /><em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>living.</em>
              </h1>
              <p className="rise" style={{ fontSize: 18, color: 'var(--ink-2)', lineHeight: 1.55, margin: '26px 0 34px', maxWidth: 440, animationDelay: '.12s' }}>
                A curated home of ceramics, lighting and textiles — made by hand, built to age beautifully, and shipped from our studio.
              </p>
              <div className="row rise" style={{ gap: 12, flexWrap: 'wrap', animationDelay: '.18s' }}>
                <button className="btn btn--primary btn--lg" onClick={() => navigate('/products')}>
                  Shop the collection <Icon name="arrow" size={17} />
                </button>
                <button className="btn btn--ghost btn--lg" onClick={() => navigate('/products')}>
                  Explore the range
                </button>
              </div>
              <div className="row" style={{ gap: 28, marginTop: 44 }}>
                <Stat n="40k+" l="Homes furnished" />
                <div style={{ width: 1, height: 38, background: 'var(--line-2)' }}></div>
                <Stat n="120" l="Independent makers" />
                <div style={{ width: 1, height: 38, background: 'var(--line-2)' }}></div>
                <Stat n="4.9" l="Avg. rating" />
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', minHeight: 420 }}>
            <Placeholder tone="clay" label="hero · styled room" style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />
            {featured[0] && (
              <div className="card rise" style={{ position: 'absolute', bottom: 28, left: 28, padding: 12, paddingRight: 18, display: 'flex', gap: 13, alignItems: 'center', borderRadius: 'var(--r-lg)', animationDelay: '.3s', maxWidth: 280 }}>
                <Placeholder tone="sand" style={{ width: 56, height: 56, borderRadius: 'var(--r-md)', flex: '0 0 auto' }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{featured[0].name}</div>
                  <div className="mono faint" style={{ fontSize: 11 }}>{featured[0].category?.name} · {money(featured[0].price)}</div>
                </div>
                <button className="hdr-icon" style={{ background: 'var(--ink)', color: 'var(--bg)', width: 34, height: 34, flex: '0 0 auto' }}
                  onClick={() => navigate(`/products/${featured[0].id}`)} aria-label="view">
                  <Icon name="arrow" size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="section wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Browse by category</span>
              <h2 style={{ marginTop: 12 }}>Shop the categories</h2>
            </div>
            <button className="btn btn--quiet desktop-only" onClick={() => navigate('/products')}>
              All categories <Icon name="arrow" size={15} />
            </button>
          </div>
          <div className="cat-grid">
            {categories.map((c, i) => (
              <button key={c.id} className="cat-card rise" style={{ animationDelay: i * 0.05 + 's', border: 'none', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left', padding: 0 }}
                onClick={() => navigate(`/products?categoryId=${c.id}`)}>
                <Placeholder tone={TONES[i % TONES.length]} label={c.name.toLowerCase()} ratio="16 / 10" className="cat-card__ph" />
                <div className="cat-card__label">
                  <div>
                    <div className="serif" style={{ fontSize: 22, color: '#fff', letterSpacing: '-0.01em' }}>{c.name}</div>
                  </div>
                  <span className="cat-card__arrow"><Icon name="arrow" size={16} /></span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* FEATURED */}
      <section className="section wrap" style={{ paddingTop: 0 }}>
        <div className="sec-head">
          <div>
            <span className="eyebrow eyebrow--accent">Explore the range</span>
            <h2 style={{ marginTop: 12 }}>Featured products</h2>
          </div>
          <button className="btn btn--quiet desktop-only" onClick={() => navigate('/products')}>
            Shop all <Icon name="arrow" size={15} />
          </button>
        </div>
        {loading ? <SkeletonGrid count={4} /> : (
          <div className="pgrid">
            {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </section>

      {/* EDITORIAL DARK BAND */}
      <section style={{ background: 'var(--dark)', color: 'var(--on-dark)' }}>
        <div className="wrap" style={{ padding: '92px var(--gutter)' }}>
          <div className="editorial-grid">
            <div>
              <span className="eyebrow" style={{ color: 'var(--on-dark-2)' }}>The Terra way</span>
              <h2 className="serif" style={{ fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 400, lineHeight: 1.06, letterSpacing: '-0.02em', margin: '20px 0 22px' }}>
                We work with makers,<br />not factories.
              </h2>
              <p style={{ color: 'var(--on-dark-2)', fontSize: 16.5, lineHeight: 1.6, maxWidth: 460, marginBottom: 30 }}>
                Every piece is produced in small batches by independent studios we know by name. That means slight variation, honest materials, and objects that earn their place over years — not seasons.
              </p>
              <button className="btn btn--on-dark" onClick={() => navigate('/products')}>
                Meet the collection <Icon name="arrow" size={16} />
              </button>
            </div>
            <Placeholder tone="rust" label="studio · maker at work" ratio="4 / 3" style={{ borderRadius: 'var(--r-xl)' }} />
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="section wrap">
        <div className="sec-head">
          <div>
            <span className="eyebrow">Just landed</span>
            <h2 style={{ marginTop: 12 }}>New arrivals</h2>
          </div>
          <button className="btn btn--quiet desktop-only" onClick={() => navigate('/products')}>
            View all <Icon name="arrow" size={15} />
          </button>
        </div>
        {loading ? <SkeletonGrid count={4} /> : (
          <div className="pgrid">
            {arrivals.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </section>

      {/* BENEFITS */}
      <section className="section--tight wrap" style={{ paddingTop: 0 }}>
        <div className="bene-grid">
          {BENEFITS.map((b) => (
            <div key={b.t} style={{ background: 'var(--surface)', padding: '30px 26px' }}>
              <span style={{ color: 'var(--accent)', display: 'inline-flex', marginBottom: 14 }}><Icon name={b.icon} size={24} /></span>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{b.t}</div>
              <div className="muted" style={{ fontSize: 13.5, marginTop: 3 }}>{b.s}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ n, l }) {
  return (
    <div>
      <div className="serif" style={{ fontSize: 28, lineHeight: 1, letterSpacing: '-0.01em' }}>{n}</div>
      <div className="mono faint" style={{ fontSize: 11, marginTop: 5, letterSpacing: '0.03em' }}>{l}</div>
    </div>
  );
}
