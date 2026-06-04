const STATUS = {
  PENDING:    { label: 'Pending',    cls: 'badge--warn' },
  PROCESSING: { label: 'Processing', cls: 'badge--accent' },
  COMPLETED:  { label: 'Completed',  cls: 'badge--ok' },
  CANCELLED:  { label: 'Cancelled',  cls: 'badge--danger' },
};

export default function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, cls: '' };
  return <span className={'badge badge--dot ' + s.cls}>{s.label}</span>;
}
