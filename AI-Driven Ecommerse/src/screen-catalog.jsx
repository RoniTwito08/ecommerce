/* TERRA — Products Catalog */
const PRICE_BANDS = [
  { id: "all", label: "Any price", test: () => true },
  { id: "u75", label: "Under $75", test: (p) => p.price < 75 },
  { id: "75-200", label: "$75–$200", test: (p) => p.price >= 75 && p.price <= 200 },
  { id: "200-500", label: "$200–$500", test: (p) => p.price > 200 && p.price <= 500 },
  { id: "o500", label: "$500+", test: (p) => p.price > 500 },
];
const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price · Low to High" },
  { id: "price-desc", label: "Price · High to Low" },
  { id: "rating", label: "Top rated" },
  { id: "new", label: "Newest" },
];

const CatalogPage = ({ go, onAdd, route, query, setQuery, forcedState }) => {
  const { PRODUCTS, CATEGORIES, catName } = window.TERRA;
  const [cat, setCat] = useState(route.cat || "all");
  const [band, setBand] = useState("all");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { setCat(route.cat || "all"); }, [route.cat]);

  // simulate fetch on filter change
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 480);
    return () => clearTimeout(t);
  }, [cat, band, sort, query]);

  let items = PRODUCTS
    .filter((p) => cat === "all" || p.category === cat)
    .filter((p) => (PRICE_BANDS.find((b) => b.id === band) || PRICE_BANDS[0]).test(p))
    .filter((p) => !query || (p.name + " " + catName(p.category)).toLowerCase().includes(query.toLowerCase()));

  items = [...items].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "new") return (b.badge === "new") - (a.badge === "new");
    return (b.badge === "bestseller") - (a.badge === "bestseller");
  });

  const effState = forcedState && forcedState !== "normal" ? forcedState : (loading ? "loading" : items.length === 0 ? "empty" : "ready");
  const activeFilters = (cat !== "all" ? 1 : 0) + (band !== "all" ? 1 : 0) + (query ? 1 : 0);

  const clearAll = () => { setCat("all"); setBand("all"); setQuery(""); };

  return (
    <div className="page">
      <div className="wrap page-head">
        <div className="crumb" style={{ marginBottom: 16 }}>
          <a href="#" onClick={(e) => { e.preventDefault(); go({ name: "home" }); }}>Home</a>
          <Icon name="chevron" /><span style={{ color: "var(--ink)" }}>{cat === "all" ? "Shop All" : catName(cat)}</span>
        </div>
        <div className="sec-head" style={{ marginBottom: 26, alignItems: "flex-end" }}>
          <div>
            <h1 className="page-title">{cat === "all" ? "Shop All" : catName(cat)}</h1>
            <p className="muted" style={{ marginTop: 10, fontSize: 15.5 }}>
              {cat === "all" ? "The full Terra collection — made by hand, built to last." : (CATEGORIES.find((c) => c.id === cat) || {}).tag}
            </p>
          </div>
        </div>
      </div>

      {/* sticky filter toolbar */}
      <div className="cat-toolbar">
        <div className="wrap row between" style={{ gap: 16, paddingTop: 14, paddingBottom: 14 }}>
          <div className="cat-chips no-sb desktop-only">
            <button className={"chip" + (cat === "all" ? " chip--active" : "")} onClick={() => setCat("all")}>All</button>
            {CATEGORIES.map((c) => (
              <button key={c.id} className={"chip" + (cat === c.id ? " chip--active" : "")} onClick={() => setCat(c.id)}>{c.name}</button>
            ))}
          </div>
          <button className="btn btn--ghost btn--sm mobile-only" onClick={() => setShowFilters(true)}>
            <Icon name="filter" size={16} /> Filters{activeFilters ? ` · ${activeFilters}` : ""}
          </button>
          <div className="row" style={{ gap: 12, flex: "0 0 auto" }}>
            <div className="select-wrap desktop-only">
              <select className="select" value={band} onChange={(e) => setBand(e.target.value)} aria-label="price">
                {PRICE_BANDS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
              </select>
            </div>
            <div className="select-wrap">
              <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="sort">
                {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap section" style={{ paddingTop: 30 }}>
        {/* result meta */}
        <div className="row between" style={{ marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
          <span className="mono faint" style={{ fontSize: 12 }}>
            {effState === "loading" ? "Loading…" : `${items.length} ${items.length === 1 ? "piece" : "pieces"}`}
            {cat !== "all" ? ` in ${catName(cat)}` : ""}
          </span>
          {activeFilters > 0 && effState !== "loading" && (
            <button className="btn btn--quiet btn--sm" onClick={clearAll}><Icon name="close" size={14} /> Clear filters</button>
          )}
        </div>

        {effState === "loading" && <SkeletonGrid count={8} />}
        {effState === "error" && <ErrorState onRetry={() => {}} />}
        {effState === "empty" && (
          <EmptyState icon="search" title="No pieces match"
            body="Try a different category or price — or clear your filters to see the full collection."
            action={<button className="btn btn--primary" onClick={clearAll}>Clear all filters</button>} />
        )}
        {effState === "ready" && (
          <div className="pgrid">
            {items.map((p, i) => <ProductCard key={p.id} p={p} go={go} onAdd={onAdd} index={i} />)}
          </div>
        )}
      </div>

      {/* mobile filter sheet */}
      {showFilters && (
        <div className="drawer-scrim fade" onClick={() => setShowFilters(false)}>
          <aside className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="row between" style={{ marginBottom: 22 }}>
              <h3 className="serif" style={{ fontSize: 22, fontWeight: 400 }}>Filters</h3>
              <button className="hdr-icon" onClick={() => setShowFilters(false)}><Icon name="close" size={20} /></button>
            </div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Category</div>
            <div className="row" style={{ gap: 8, flexWrap: "wrap", marginBottom: 26 }}>
              <button className={"chip" + (cat === "all" ? " chip--active" : "")} onClick={() => setCat("all")}>All</button>
              {CATEGORIES.map((c) => <button key={c.id} className={"chip" + (cat === c.id ? " chip--active" : "")} onClick={() => setCat(c.id)}>{c.name}</button>)}
            </div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Price</div>
            <div className="row" style={{ gap: 8, flexWrap: "wrap", marginBottom: 30 }}>
              {PRICE_BANDS.map((b) => <button key={b.id} className={"chip" + (band === b.id ? " chip--active" : "")} onClick={() => setBand(b.id)}>{b.label}</button>)}
            </div>
            <div className="row" style={{ gap: 10 }}>
              <button className="btn btn--ghost btn--full" onClick={clearAll}>Clear</button>
              <button className="btn btn--primary btn--full" onClick={() => setShowFilters(false)}>Show {items.length} pieces</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { CatalogPage });
