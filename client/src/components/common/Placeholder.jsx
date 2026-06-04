const TONES = {
  stone:  'oklch(0.86 0.012 65)',
  sand:   'oklch(0.88 0.025 75)',
  rust:   'oklch(0.74 0.08 40)',
  clay:   'oklch(0.80 0.045 55)',
  sage:   'oklch(0.82 0.045 155)',
  cream:  'oklch(0.96 0.018 85)',
  slate:  'oklch(0.72 0.012 220)',
  blush:  'oklch(0.88 0.04 10)',
  teal:   'oklch(0.78 0.05 190)',
  warm:   'oklch(0.85 0.035 60)',
  forest: 'oklch(0.68 0.08 150)',
  dusk:   'oklch(0.68 0.04 280)',
};

export default function Placeholder({ tone = 'stone', label, ratio, className = '', style = {}, children }) {
  const bg = TONES[tone] || TONES.stone;
  return (
    <div
      className={'ph ' + className}
      style={{ '--ph-bg': bg, background: bg, aspectRatio: ratio, ...style }}
    >
      {label && <span className="ph__tag">{label}</span>}
      {children}
    </div>
  );
}
