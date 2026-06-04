import Icon from './Icon';

export default function EmptyState({ icon = 'bag', title, body, action }) {
  return (
    <div className="state fade">
      <div className="state__icon"><Icon name={icon} size={32} /></div>
      <h3 className="serif" style={{ fontSize: 26, fontWeight: 400 }}>{title}</h3>
      {body && <p className="muted" style={{ maxWidth: 380, fontSize: 15 }}>{body}</p>}
      {action}
    </div>
  );
}
