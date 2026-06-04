import Icon from './Icon';

export default function ErrorState({ onRetry }) {
  return (
    <div className="state fade">
      <div className="state__icon" style={{ background: 'var(--danger-soft)', color: 'oklch(0.5 0.14 28)' }}>
        <Icon name="alert" size={30} />
      </div>
      <h3 className="serif" style={{ fontSize: 26, fontWeight: 400 }}>Something went sideways</h3>
      <p className="muted" style={{ maxWidth: 380, fontSize: 15 }}>
        We couldn't load this just now. Check your connection and try again.
      </p>
      {onRetry && (
        <button className="btn btn--ghost" onClick={onRetry}>
          <Icon name="sparkle" size={16} /> Try again
        </button>
      )}
    </div>
  );
}
