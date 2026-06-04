import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icon';
import Placeholder from '../components/common/Placeholder';
import QtyStepper from '../components/common/QtyStepper';
import ProductCard from '../components/products/ProductCard';
import ErrorState from '../components/common/ErrorState';
import { productApi } from '../api/product.api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { money } from '../utils/format';

function MiniBene({ icon, t, s }) {
  return (
    <div className="row" style={{ gap: 10 }}>
      <span style={{ color: 'var(--accent)' }}><Icon name={icon} size={20} /></span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{t}</div>
        <div className="faint" style={{ fontSize: 11.5 }}>{s}</div>
      </div>
    </div>
  );
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [openAcc, setOpenAcc] = useState('details');
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setQty(1);
    setActiveImg(0);
    window.scrollTo(0, 0);
    productApi.getProductById(id).then(({ data }) => {
      const p = data.data.product;
      setProduct(p);
      return productApi.getProducts({ limit: 8 });
    }).then(({ data }) => {
      setRelated(data.data.filter((p) => p.id !== Number(id)).slice(0, 4));
    }).catch(() => setError(true)).finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    if (!product || product.stockQuantity === 0) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    setAdding(true);
    try {
      await addItem(product.id, qty);
      setAdded(true);
      toast(`${product.name} added to cart`);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      toast(err.response?.data?.message || 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="page wrap" style={{ paddingTop: 28 }}>
        <div className="detail-grid">
          <div className="skel" style={{ aspectRatio: '4 / 5', borderRadius: 'var(--r-xl)' }}></div>
          <div className="stack" style={{ gap: 18 }}>
            {[60, 40, 80, 30, 60].map((w, i) => <div key={i} className="skel" style={{ height: 18, width: w + '%' }}></div>)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page wrap" style={{ paddingTop: 40 }}>
        <ErrorState onRetry={() => navigate(0)} />
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : null;
  const out = product.stockQuantity === 0;
  const low = product.stockQuantity > 0 && product.stockQuantity <= 5;

  const accs = [
    { id: 'details', label: 'Details & materials', body: product.description || 'Premium quality product.' },
    { id: 'shipping', label: 'Shipping & returns', body: 'Free carbon-neutral shipping on orders over $150. Dispatched within 2 business days. 30-day free returns.' },
    { id: 'care', label: 'Care guide', body: 'Handle with care. Small variations in tone and texture are part of the handmade character.' },
  ];

  return (
    <div className="page wrap" style={{ paddingTop: 28 }}>
      <div className="crumb" style={{ marginBottom: 26 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit', padding: 0 }}>Home</button>
        <Icon name="chevron" />
        <button onClick={() => navigate(`/products?categoryId=${product.category?.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit', padding: 0 }}>{product.category?.name}</button>
        <Icon name="chevron" />
        <span style={{ color: 'var(--ink)' }}>{product.name}</span>
      </div>

      <div className="detail-grid">
        {/* GALLERY */}
        <div className="gallery">
          {images ? (
            <>
              <img
                key={activeImg}
                src={images[activeImg]?.imageUrl}
                alt={product.name}
                className="fade"
                style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: 'var(--r-xl)' }}
              />
              {images.length > 1 && (
                <div className="gallery-thumbs">
                  {images.map((img, i) => (
                    <button key={img.id} className={'gthumb' + (i === activeImg ? ' gthumb--active' : '')} onClick={() => setActiveImg(i)}>
                      <img src={img.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Placeholder tone="stone" ratio="4 / 5" style={{ borderRadius: 'var(--r-xl)' }} />
          )}
        </div>

        {/* INFO */}
        <div>
          <div className="row" style={{ gap: 10, marginBottom: 14 }}>
            <span className="mono faint" style={{ fontSize: 12, letterSpacing: '0.05em' }}>{product.category?.name}</span>
          </div>
          <h1 className="serif" style={{ fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em' }}>{product.name}</h1>

          <div style={{ margin: '22px 0 8px' }}>
            <span className="price" style={{ fontSize: 30 }}>{money(product.price)}</span>
          </div>

          <p style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.6, margin: '16px 0 26px', maxWidth: 480 }}>{product.description}</p>

          <div className="row" style={{ gap: 8, marginBottom: 22 }}>
            <span className={'badge badge--dot ' + (out ? 'badge--danger' : low ? 'badge--warn' : 'badge--ok')}>
              {out ? 'Sold out' : low ? `Only ${product.stockQuantity} left` : 'In stock'}
            </span>
            {!out && <span className="mono faint" style={{ fontSize: 11.5 }}>· ships in 2 days</span>}
          </div>

          <div className="row" style={{ gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
            <QtyStepper value={qty} onChange={setQty} max={out ? 1 : Math.max(1, product.stockQuantity)} />
            <button
              className={'btn btn--lg ' + (added ? 'btn--accent' : 'btn--primary')}
              disabled={out || adding}
              style={{ flex: 1, minWidth: 200 }}
              onClick={handleAdd}
            >
              {out ? 'Sold out' : adding ? 'Adding…' : added
                ? <><Icon name="check" size={18} /> Added to cart</>
                : <><Icon name="bag" size={17} /> Add to cart · {money(parseFloat(product.price) * qty)}</>
              }
            </button>
          </div>

          <div className="row" style={{ gap: 22, padding: '18px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', margin: '12px 0 26px', flexWrap: 'wrap' }}>
            <MiniBene icon="truck"  t="Free shipping" s="Orders over $150" />
            <MiniBene icon="shield" t="2-year guarantee" s="On every piece" />
            <MiniBene icon="leaf"   t="Handmade" s="Small-batch" />
          </div>

          <div className="stack">
            {accs.map((a) => (
              <div key={a.id} className="acc">
                <button className="acc__head" onClick={() => setOpenAcc(openAcc === a.id ? '' : a.id)} aria-expanded={openAcc === a.id}>
                  <span>{a.label}</span>
                  <Icon name={openAcc === a.id ? 'minus' : 'plus'} size={17} />
                </button>
                {openAcc === a.id && <div className="acc__body fade">{a.body}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="section" style={{ paddingBottom: 40 }}>
          <div className="sec-head">
            <div>
              <span className="eyebrow">You might also like</span>
              <h2 style={{ marginTop: 12 }}>Pairs well with</h2>
            </div>
          </div>
          <div className="pgrid">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
