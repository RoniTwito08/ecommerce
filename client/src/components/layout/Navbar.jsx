import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../common/Icon';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { categoryApi } from '../../api/category.api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cart } = useCart();

  const [categories, setCategories] = useState([]);
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    categoryApi.getCategories().then(({ data }) => setCategories(data.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { if (searchOpen && searchRef.current) searchRef.current.focus(); }, [searchOpen]);
  useEffect(() => { setDrawer(false); }, [location.pathname]);

  const navLinks = [
    { label: 'Shop All', to: '/products' },
    ...categories.slice(0, 4).map((c) => ({ label: c.name, to: `/products?categoryId=${c.id}` })),
  ];

  const isActive = (to) => {
    if (to === '/products') return location.pathname === '/products' && !new URLSearchParams(location.search).get('categoryId');
    const catId = new URLSearchParams(to.split('?')[1]).get('categoryId');
    return location.pathname === '/products' && new URLSearchParams(location.search).get('categoryId') === catId;
  };

  const submitSearch = (e) => {
    e.preventDefault();
    setSearchOpen(false);
    if (query.trim()) navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    else navigate('/products');
    setQuery('');
  };

  const cartCount = cart.itemCount || 0;

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 60,
        background: scrolled ? 'oklch(0.985 0.004 70 / 0.86)' : 'var(--bg)',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: '1px solid ' + (scrolled ? 'var(--line)' : 'transparent'),
        transition: 'background .25s, border-color .25s',
      }}>
        <div className="wrap row between" style={{ height: 'var(--header-h)', gap: 20 }}>
          <button className="hdr-icon mobile-only" aria-label="menu" onClick={() => setDrawer(true)}>
            <Icon name="menu" size={20} />
          </button>

          <button
            className="serif" onClick={() => navigate('/')}
            style={{ fontSize: 25, letterSpacing: '0.06em', fontWeight: 500, lineHeight: 1, flex: '0 0 auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)' }}
          >
            TERRA<span style={{ color: 'var(--accent)' }}>.</span>
          </button>

          <nav className="hdr-nav desktop-only">
            {navLinks.map((n) => (
              <button key={n.label} onClick={() => navigate(n.to)}
                className={'hdr-link' + (isActive(n.to) ? ' hdr-link--active' : '')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}>
                {n.label}
              </button>
            ))}
          </nav>

          <div className="row" style={{ gap: 6, flex: '0 0 auto' }}>
            <button className="hdr-icon" aria-label="search" onClick={() => setSearchOpen((s) => !s)}>
              <Icon name="search" size={19} />
            </button>
            <button className="hdr-icon" aria-label="account" onClick={() => navigate(user ? '/account' : '/login')}>
              <Icon name="user" size={19} />
            </button>
            <button className="hdr-icon" aria-label="cart" style={{ position: 'relative' }} onClick={() => navigate('/cart')}>
              <Icon name="bag" size={19} />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
          </div>
        </div>

        <div style={{
          maxHeight: searchOpen ? 84 : 0, overflow: 'hidden',
          transition: 'max-height .3s cubic-bezier(.2,.7,.3,1)',
          borderTop: searchOpen ? '1px solid var(--line)' : 'none',
        }}>
          <form className="wrap" onSubmit={submitSearch} style={{ padding: '18px var(--gutter)' }}>
            <div className="row" style={{ gap: 12, border: '1px solid var(--line-2)', borderRadius: 'var(--r-pill)', padding: '0 18px', height: 48, background: 'var(--surface)' }}>
              <Icon name="search" size={18} style={{ color: 'var(--ink-3)' }} />
              <input
                ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: 15.5 }}
              />
              {query && (
                <button type="button" className="hdr-icon" onClick={() => setQuery('')} aria-label="clear">
                  <Icon name="close" size={16} />
                </button>
              )}
            </div>
          </form>
        </div>
      </header>

      {drawer && (
        <div className="drawer-scrim fade" onClick={() => setDrawer(false)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="row between" style={{ marginBottom: 28 }}>
              <span className="serif" style={{ fontSize: 22, letterSpacing: '0.05em' }}>TERRA<span style={{ color: 'var(--accent)' }}>.</span></span>
              <button className="hdr-icon" onClick={() => setDrawer(false)} aria-label="close"><Icon name="close" size={20} /></button>
            </div>
            <nav className="stack" style={{ gap: 4 }}>
              {navLinks.map((n) => (
                <button key={n.label} className="drawer-link" onClick={() => navigate(n.to)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', width: '100%', textAlign: 'left' }}>
                  {n.label}<Icon name="chevron" size={16} />
                </button>
              ))}
            </nav>
            <hr className="divider" style={{ margin: '22px 0' }} />
            <nav className="stack" style={{ gap: 4 }}>
              <button className="drawer-link" onClick={() => navigate(user ? '/account' : '/login')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', width: '100%', textAlign: 'left' }}>
                {user ? 'Account' : 'Sign in'}<Icon name="user" size={16} />
              </button>
              <button className="drawer-link" onClick={() => navigate('/cart')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', width: '100%', textAlign: 'left' }}>
                Cart ({cartCount})<Icon name="bag" size={16} />
              </button>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
