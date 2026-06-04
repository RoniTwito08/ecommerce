import Icon from './Icon';

export default function Stars({ value = 5, size = 13 }) {
  return (
    <span className="row" style={{ gap: 1, color: 'var(--accent)' }} aria-label={value + ' stars'}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Icon key={i} name="star" size={size} style={{ opacity: i < Math.round(value) ? 1 : 0.22 }} />
      ))}
    </span>
  );
}
