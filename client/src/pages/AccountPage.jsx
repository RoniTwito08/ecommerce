import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../components/common/Icon';
import Placeholder from '../components/common/Placeholder';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderApi } from '../api/order.api';
import { money, formatDate } from '../utils/format';

function DetailField({ label, v, on, editing }) {
  return (
    <div className="field">
      <label>{label}</label>
      {editing
        ? <input className="input" value={v} onChange={on} />
        : <div style={{ fontSize: 15.5, fontWeight: 500, padding: '10px 2px', borderBottom: '1px solid var(--line)' }}>{v || '—'}</div>}
    </div>
  );
}

function OrderRow({ order }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
      <div className="order-head">
        <div className="row" style={{ gap: 18, flexWrap: 'wrap' }}>
          <div>
            <div className="mono faint" style={{ fontSize: 11 }}>Order</div>
            <div style={{ fontWeight: 600, fontFamily: 'var(--mono)', fontSize: 14 }}>#{order.id}</div>
          </div>
          <div>
            <div className="mono faint" style={{ fontSize: 11 }}>Placed</div>
            <div style={{ fontSize: 14 }}>{formatDate(order.createdAt)}</div>
          </div>
          <div>
            <div className="mono faint" style={{ fontSize: 11 }}>Total</div>
            <div className="price" style={{ fontSize: 14 }}>{money(order.totalAmount)}</div>
          </div>
          <div>
            <div className="mono faint" style={{ fontSize: 11 }}>Items</div>
            <div style={{ fontSize: 14 }}>{order.itemCount}</div>
          </div>
        </div>
        <div className="row" style={{ gap: 14 }}>
          <StatusBadge status={order.status} />
          <button className="btn btn--ghost btn--sm" onClick={() => setOpen((v) => !v)}>
            {open ? 'Hide' : 'Details'} <Icon name={open ? 'chevDown' : 'chevron'} size={14} />
          </button>
        </div>
      </div>
      {open && (
        <div className="fade" style={{ borderTop: '1px solid var(--line)', padding: '6px 22px 20px' }}>
          <OrderDetails orderId={order.id} />
        </div>
      )}
    </div>
  );
}

function OrderDetails({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getOrderById(orderId).then(({ data }) => setOrder(data.data.order)).catch(() => {}).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div className="skel" style={{ height: 80, marginTop: 12, borderRadius: 'var(--r-md)' }} />;
  if (!order) return null;

  return (
    <div className="stack" style={{ gap: 0, marginTop: 8 }}>
      {order.items.map((item) => (
        <div key={item.id} className="row between" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
          <div className="row" style={{ gap: 12 }}>
            {item.product.primaryImage
              ? <img src={item.product.primaryImage} alt="" style={{ width: 46, height: 46, borderRadius: 8, objectFit: 'cover' }} />
              : <Placeholder tone="stone" style={{ width: 46, height: 46, borderRadius: 8 }} />}
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{item.product.name}</div>
              <div className="mono faint" style={{ fontSize: 11 }}>Qty {item.quantity}</div>
            </div>
          </div>
          <span className="price" style={{ fontSize: 14 }}>{money(item.lineTotal)}</span>
        </div>
      ))}
      <div className="row between" style={{ paddingTop: 14 }}>
        <span className="muted" style={{ fontSize: 14 }}>Total</span>
        <span className="price">{money(order.totalAmount)}</span>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const defaultTab = searchParams.get('tab') || 'profile';
  const [tab, setTab] = useState(defaultTab);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
  });
  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  useEffect(() => {
    if (tab === 'orders' && orders.length === 0) {
      setOrdersLoading(true);
      orderApi.getOrders({ limit: 20 }).then(({ data }) => setOrders(data.data)).catch(() => {}).finally(() => setOrdersLoading(false));
    }
  }, [tab]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const save = () => { setEditing(false); setSaved(true); setTimeout(() => setSaved(false), 2000); toast('Profile updated'); };

  const navItems = [
    { id: 'profile', label: 'Profile',  icon: 'user' },
    { id: 'orders',  label: 'Orders',   icon: 'box' },
  ];

  const initials = (form.firstName?.[0] || '') + (form.lastName?.[0] || '');

  return (
    <div className="page wrap" style={{ paddingTop: 40, paddingBottom: 90 }}>
      <div className="row between" style={{ marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span className="eyebrow">Account</span>
          <h1 className="page-title" style={{ marginTop: 10 }}>Hello, {form.firstName || 'there'}</h1>
        </div>
        <button className="btn btn--ghost" onClick={handleLogout}><Icon name="logout" size={16} /> Sign out</button>
      </div>

      <div className="acct-grid">
        <nav className="acct-nav">
          {navItems.map((n) => (
            <button key={n.id} className={tab === n.id ? 'active' : ''} onClick={() => setTab(n.id)}>
              <Icon name={n.icon} size={17} /> {n.label}
            </button>
          ))}
        </nav>

        <div>
          {tab === 'profile' && (
            <div className="stack fade" style={{ gap: 26 }}>
              <div className="card" style={{ padding: 26, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="avatar serif">{initials || '?'}</div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <h3 style={{ fontSize: 20 }}>{form.firstName} {form.lastName}</h3>
                  <p className="muted" style={{ fontSize: 14 }}>{form.email}</p>
                  <div className="row" style={{ gap: 8, marginTop: 10 }}>
                    <span className="badge badge--accent">Member</span>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 26 }}>
                <div className="row between" style={{ marginBottom: 22 }}>
                  <h3 className="serif" style={{ fontSize: 22, fontWeight: 400 }}>Personal details</h3>
                  {!editing
                    ? <button className="btn btn--ghost btn--sm" onClick={() => setEditing(true)}><Icon name="edit" size={15} /> Edit</button>
                    : <div className="row" style={{ gap: 8 }}>
                        <button className="btn btn--quiet btn--sm" onClick={() => setEditing(false)}>Cancel</button>
                        <button className="btn btn--primary btn--sm" onClick={save}>Save changes</button>
                      </div>}
                </div>
                <div className="field-row" style={{ gap: 18, marginBottom: 18 }}>
                  <DetailField label="First name" v={form.firstName} on={set('firstName')} editing={editing} />
                  <DetailField label="Last name"  v={form.lastName}  on={set('lastName')}  editing={editing} />
                </div>
                <div className="field-row" style={{ gap: 18, marginBottom: 18 }}>
                  <DetailField label="Email" v={form.email} on={set('email')} editing={editing} />
                  <DetailField label="Phone" v={form.phone} on={set('phone')} editing={editing} />
                </div>
                {saved && <div className="row" style={{ gap: 8, marginTop: 18, color: 'oklch(0.45 0.09 150)', fontSize: 14, fontWeight: 600 }}><Icon name="check" size={16} /> Changes saved</div>}
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="fade">
              <h2 className="serif" style={{ fontSize: 28, fontWeight: 400, marginBottom: 24 }}>Your orders</h2>
              {ordersLoading && <div className="skel" style={{ height: 120, borderRadius: 'var(--r-lg)' }} />}
              {!ordersLoading && orders.length === 0 && (
                <EmptyState icon="box" title="No orders yet"
                  body="When you place your first order it'll show up here, with tracking and easy reordering."
                  action={<button className="btn btn--primary" onClick={() => navigate('/products')}>Start shopping</button>} />
              )}
              {!ordersLoading && orders.length > 0 && (
                <div style={{ maxWidth: 820 }}>
                  {orders.map((o) => <OrderRow key={o.id} order={o} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
