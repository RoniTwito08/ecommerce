import { useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icon';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="page wrap" style={{ display: 'grid', placeItems: 'center', minHeight: 'calc(100vh - var(--header-h))', textAlign: 'center', padding: '60px var(--gutter)' }}>
      <div className="rise" style={{ maxWidth: 480 }}>
        <div className="serif" style={{ fontSize: 'clamp(90px, 16vw, 170px)', lineHeight: 0.9, letterSpacing: '-0.04em', color: 'var(--ink)' }}>
          4<span style={{ color: 'var(--accent)' }}>0</span>4
        </div>
        <h1 className="serif" style={{ fontSize: 30, fontWeight: 400, margin: '18px 0 12px' }}>This page wandered off.</h1>
        <p className="muted" style={{ fontSize: 16, marginBottom: 30, maxWidth: 380, marginInline: 'auto' }}>
          The page you're looking for doesn't exist or has moved. Let's get you back to the good stuff.
        </p>
        <div className="row" style={{ gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn--primary btn--lg" onClick={() => navigate('/')}><Icon name="arrowL" size={16} /> Back to home</button>
          <button className="btn btn--ghost btn--lg" onClick={() => navigate('/products')}>Shop the collection</button>
        </div>
      </div>
    </div>
  );
}
