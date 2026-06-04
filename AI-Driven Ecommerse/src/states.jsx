/* TERRA — loading / empty / error states */

const SkeletonCard = () => (
  <div className="stack" style={{ gap: 12 }}>
    <div className="skel" style={{ aspectRatio: "4 / 5", borderRadius: "var(--r-lg)" }}></div>
    <div className="row between" style={{ marginTop: 2 }}>
      <div className="skel" style={{ height: 14, width: "55%" }}></div>
      <div className="skel" style={{ height: 14, width: 42 }}></div>
    </div>
    <div className="skel" style={{ height: 11, width: "32%" }}></div>
  </div>
);

const SkeletonGrid = ({ count = 8 }) => (
  <div className="pgrid">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);

const EmptyState = ({ icon = "bag", title, body, action }) => (
  <div className="state fade">
    <div className="state__icon"><Icon name={icon} size={32} /></div>
    <h3 className="serif" style={{ fontSize: 26, fontWeight: 400 }}>{title}</h3>
    {body && <p className="muted" style={{ maxWidth: 380, fontSize: 15 }}>{body}</p>}
    {action}
  </div>
);

const ErrorState = ({ onRetry }) => (
  <div className="state fade">
    <div className="state__icon" style={{ background: "var(--danger-soft)", color: "oklch(0.5 0.14 28)" }}>
      <Icon name="alert" size={30} />
    </div>
    <h3 className="serif" style={{ fontSize: 26, fontWeight: 400 }}>Something went sideways</h3>
    <p className="muted" style={{ maxWidth: 380, fontSize: 15 }}>
      We couldn't load this just now. Check your connection and try again — your cart is safe.
    </p>
    {onRetry && <button className="btn btn--ghost" onClick={onRetry}><Icon name="sparkle" size={16} />Try again</button>}
  </div>
);

Object.assign(window, { SkeletonCard, SkeletonGrid, EmptyState, ErrorState });
