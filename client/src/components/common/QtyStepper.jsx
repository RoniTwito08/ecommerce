import Icon from './Icon';

export default function QtyStepper({ value, onChange, min = 1, max = 99, size = 'md' }) {
  const h = size === 'sm' ? 36 : 46;
  const btnStyle = { width: h, height: h, display: 'grid', placeItems: 'center', border: 'none', background: 'transparent', color: 'var(--ink)' };
  return (
    <div className="row" style={{ border: '1px solid var(--line-2)', borderRadius: 'var(--r-pill)', height: h, background: 'var(--surface)', overflow: 'hidden' }}>
      <button style={btnStyle} aria-label="decrease" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
        <Icon name="minus" size={15} />
      </button>
      <span style={{ minWidth: 30, textAlign: 'center', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      <button style={btnStyle} aria-label="increase" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
        <Icon name="plus" size={15} />
      </button>
    </div>
  );
}
