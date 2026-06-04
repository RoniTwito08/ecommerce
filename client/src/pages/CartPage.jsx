import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icon';
import Placeholder from '../components/common/Placeholder';
import QtyStepper from '../components/common/QtyStepper';
import EmptyState from '../components/common/EmptyState';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { money } from '../utils/format';

const FREE_SHIP = 150;

function OrderSummary({ subtotal, onCheckout, compact }) {
  const [promo, setPromo] = useState('');
  const [applied, setApplied] = useState(false);

  const sub = parseFloat(subtotal) || 0;
  const discount = applied ? Math.round(sub * 0.1) : 0;
  const shipping = sub === 0 ? 0 : sub - discount >= FREE_SHIP ? 0 : 12;
  const total = sub - discount + shipping;
  const toFree = Math.max(0, FREE_SHIP - sub);

  return (
    <div className="card" style={{ padding: 26 }}>
      <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, marginBottom: 20 }}>Order summary</h3>

      {!compact && (
        <>
          {sub > 0 && toFree > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div className="mono faint" style={{ fontSize: 11.5, marginBottom: 8 }}>{money(toFree)} away from free shipping</div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
                <div style={{ width: Math.min(100, (sub / FREE_SHIP) * 100) + '%', height: '100%', background: 'var(--accent)', transition: 'width .4s' }}></div>
              </div>
            </div>
          )}
          <form className="row" onSubmit={(e) => { e.preventDefault(); if (promo.trim()) setApplied(true); }} style={{ gap: 8, marginBottom: 20 }}>
            <input className="input" value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Promo code" style={{ height: 44 }} />
            <button className="btn btn--ghost" type="submit" style={{ height: 44 }}>Apply</button>
          </form>
          {applied && <div className="row" style={{ gap: 6, marginTop: -10, marginBottom: 16, fontSize: 13, color: 'oklch(0.45 0.09 150)', fontWeight: 600 }}><Icon name="check" size={14} /> Code applied · 10% off</div>}
        </>
      )}

      <div className="stack" style={{ gap: 12, fontSize: 14.5 }}>
        <SummaryLine l="Subtotal" v={money(sub)} />
        {discount > 0 && <SummaryLine l="Discount (10%)" v={'−' + money(discount)} accent />}
        <SummaryLine l="Shipping" v={shipping === 0 ? 'Free' : money(shipping)} />
        <SummaryLine l="Tax" v="Calculated at checkout" muted small />
      </div>
      <hr className="divider" style={{ margin: '18px 0' }} />
      <div className="row between" style={{ marginBottom: 22 }}>
        <span style={{ fontWeight: 600, fontSize: 16 }}>Total</span>
        <span className="price" style={{ fontSize: 24 }}>{money(total)}</span>
      </div>
      {onCheckout && (
        <button className="btn btn--primary btn--lg btn--full btn--block" disabled={sub === 0} onClick={onCheckout}>
          Proceed to checkout <Icon name="arrow" size={17} />
        </button>
      )}
      <div className="row" style={{ gap: 14, justifyContent: 'center', marginTop: onCheckout ? 18 : 4, color: 'var(--ink-3)' }}>
        <span className="row" style={{ gap: 6, fontSize: 11.5 }}><Icon name="shield" size={14} /> Secure</span>
        <span className="row" style={{ gap: 6, fontSize: 11.5 }}><Icon name="truck" size={14} /> Free returns</span>
      </div>
    </div>
  );
}

function SummaryLine({ l, v, accent, muted, small }) {
  return (
    <div className="row between">
      <span className="muted" style={{ fontSize: small ? 13 : 14.5 }}>{l}</span>
      <span style={{ fontWeight: muted ? 400 : 600, color: accent ? 'var(--accent-ink)' : muted ? 'var(--ink-3)' : 'var(--ink)', fontSize: small ? 13 : 14.5, fontVariantNumeric: 'tabular-nums' }}>{v}</span>
    </div>
  );
}

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, updateItem, removeItem } = useCart();
  const { toast } = useToast();

  const handleUpdate = async (itemId, qty) => {
    try { await updateItem(itemId, qty); } catch { toast('Could not update quantity'); }
  };

  const handleRemove = async (itemId) => {
    try { await removeItem(itemId); } catch { toast('Could not remove item'); }
  };

  if (cart.items.length === 0) {
    return (
      <div className="page wrap" style={{ paddingTop: 40, paddingBottom: 90 }}>
        <h1 className="page-title" style={{ marginBottom: 30 }}>Your cart</h1>
        <EmptyState icon="bag" title="Your cart is empty"
          body="Once you add something you love, it'll live here until you're ready to check out."
          action={<button className="btn btn--primary" onClick={() => navigate('/products')}>Browse the collection</button>} />
      </div>
    );
  }

  return (
    <div className="page wrap" style={{ paddingTop: 40, paddingBottom: 90 }}>
      <div className="row between" style={{ marginBottom: 30, flexWrap: 'wrap', gap: 12 }}>
        <h1 className="page-title">Your cart</h1>
        <span className="muted">{cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}</span>
      </div>

      <div className="shop-2col">
        <div>
          {cart.items.map((item) => (
            <div className="litem" key={item.id}>
              <button className="litem__media" onClick={() => navigate(`/products/${item.product.id}`)} style={{ border: 'none', padding: 0, background: 'none', cursor: 'pointer' }}>
                {item.product.primaryImage
                  ? <img src={item.product.primaryImage} alt={item.product.name} style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover' }} />
                  : <Placeholder tone="stone" ratio="4 / 5" style={{ width: '100%' }} />}
              </button>
              <div style={{ minWidth: 0 }}>
                <div className="row between" style={{ gap: 12, alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>{item.product.name}</h3>
                </div>
                <div className="row between" style={{ marginTop: 16, gap: 12, flexWrap: 'wrap' }}>
                  <QtyStepper
                    value={item.quantity}
                    onChange={(q) => handleUpdate(item.id, q)}
                    size="sm"
                    max={Math.max(item.quantity, item.product.stockQuantity || 99)}
                  />
                  <button className="btn btn--quiet btn--sm" onClick={() => handleRemove(item.id)} style={{ color: 'var(--ink-3)' }}>
                    <Icon name="trash" size={15} /> Remove
                  </button>
                </div>
              </div>
              <div className="litem__price-col" style={{ textAlign: 'right' }}>
                <div className="price" style={{ fontSize: 16 }}>{money(item.lineTotal)}</div>
                {item.quantity > 1 && <div className="mono faint" style={{ fontSize: 11, marginTop: 3 }}>{money(item.product.price)} each</div>}
              </div>
            </div>
          ))}
          <button className="btn btn--quiet" style={{ marginTop: 22 }} onClick={() => navigate('/products')}>
            <Icon name="arrowL" size={16} /> Continue shopping
          </button>
        </div>

        <div className="summary">
          <OrderSummary subtotal={cart.subtotal} onCheckout={() => navigate('/checkout')} />
        </div>
      </div>
    </div>
  );
}
