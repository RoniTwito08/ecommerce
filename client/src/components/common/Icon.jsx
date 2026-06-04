const paths = {
  search:   <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></>,
  bag:      <><path d="M6 8h12l-1 12H7L6 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></>,
  user:     <><circle cx="12" cy="8" r="3.4" /><path d="M5.5 19a6.5 6.5 0 0 1 13 0" /></>,
  menu:     <><path d="M3 6h18M3 12h18M3 18h18" /></>,
  close:    <><path d="M6 6l12 12M18 6 6 18" /></>,
  chevron:  <><path d="m9 6 6 6-6 6" /></>,
  chevDown: <><path d="m6 9 6 6 6-6" /></>,
  plus:     <><path d="M12 5v14M5 12h14" /></>,
  minus:    <><path d="M5 12h14" /></>,
  heart:    <><path d="M12 20s-7-4.6-9.2-9C1.3 8 3 4.8 6.2 4.8c2 0 3.1 1.2 3.8 2.3.7-1.1 1.8-2.3 3.8-2.3 3.2 0 4.9 3.2 3.4 6.2C19 15.4 12 20 12 20Z" /></>,
  star:     <><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9L12 3.5Z" fill="currentColor" stroke="none" /></>,
  arrow:    <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  arrowL:   <><path d="M19 12H5M11 6l-6 6 6 6" /></>,
  check:    <><path d="M5 12.5 10 17l9-10" /></>,
  trash:    <><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" /></>,
  truck:    <><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.6" /><circle cx="17.5" cy="18" r="1.6" /></>,
  shield:   <><path d="M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5L12 3Z" /></>,
  leaf:     <><path d="M5 19c0-7 5-12 14-12 0 9-5 14-12 14-2 0-2-2-2-2Z" /><path d="M9 15c2-2 4-3 7-4" /></>,
  sparkle:  <><path d="M12 3v6M12 15v6M3 12h6M15 12h6" /></>,
  pin:      <><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
  card:     <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></>,
  box:      <><path d="M21 8 12 3 3 8l9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></>,
  edit:     <><path d="M4 20h4L18.5 9.5a2 2 0 0 0-3-3L5 17v3Z" /><path d="M14 7l3 3" /></>,
  logout:   <><path d="M14 8V5H5v14h9v-3" /><path d="M10 12h10M17 9l3 3-3 3" /></>,
  filter:   <><path d="M4 6h16M7 12h10M10 18h4" /></>,
  grid:     <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
  spark:    <><path d="M12 2l1.8 7.2L21 11l-7.2 1.8L12 20l-1.8-7.2L3 11l7.2-1.8L12 2Z" fill="currentColor" stroke="none" /></>,
  alert:    <><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v5M12 18h.01" /></>,
};

export default function Icon({ name, size = 18, style }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.7} strokeLinecap="round"
      strokeLinejoin="round" style={style} aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
