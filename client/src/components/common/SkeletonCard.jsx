export default function SkeletonCard() {
  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="skel" style={{ aspectRatio: '4 / 5', borderRadius: 'var(--r-lg)' }}></div>
      <div className="row between" style={{ marginTop: 2 }}>
        <div className="skel" style={{ height: 14, width: '55%' }}></div>
        <div className="skel" style={{ height: 14, width: 42 }}></div>
      </div>
      <div className="skel" style={{ height: 11, width: '32%' }}></div>
    </div>
  );
}
