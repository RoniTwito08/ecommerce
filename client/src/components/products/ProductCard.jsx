import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';
import Placeholder from '../common/Placeholder';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { money } from '../../utils/format';

export default function ProductCard({ product, index = 0 }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);

  const out = product.stockQuantity === 0;

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (out) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    setAdding(true);
    try {
      await addItem(product.id, 1);
      toast(`${product.name} added to cart`);
    } catch (err) {
      toast(err.response?.data?.message || 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="pcard rise" style={{ animationDelay: Math.min(index * 0.04, 0.3) + 's' }}>
      <div className="pcard__media" onClick={() => navigate(`/products/${product.id}`)}>
        {product.primaryImage ? (
          <img
            src={product.primaryImage} alt={product.name}
            className="pcard__ph" style={{ aspectRatio: '4 / 5', objectFit: 'cover', width: '100%' }}
          />
        ) : (
          <Placeholder tone="stone" ratio="4 / 5" className="pcard__ph" />
        )}
        {out && (
          <span className="badge" style={{ position: 'absolute', top: 14, left: 14, background: 'var(--ink)', color: 'var(--bg)' }}>Sold out</span>
        )}
        <div className="pcard__quick">
          <button className="btn btn--primary btn--sm btn--full" disabled={out || adding} onClick={handleAdd}>
            {out ? 'Sold out' : adding ? 'Adding…' : 'Add to cart'}
          </button>
        </div>
      </div>
      <div className="pcard__body" onClick={() => navigate(`/products/${product.id}`)}>
        <div className="row between" style={{ gap: 10, alignItems: 'flex-start' }}>
          <h3 style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-0.005em' }}>{product.name}</h3>
          <span className="price" style={{ fontSize: 15.5, whiteSpace: 'nowrap' }}>{money(product.price)}</span>
        </div>
        <div style={{ marginTop: 5 }}>
          <span className="mono faint" style={{ fontSize: 11.5, letterSpacing: '0.04em' }}>{product.category?.name}</span>
        </div>
      </div>
    </article>
  );
}
