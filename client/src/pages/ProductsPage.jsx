import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../components/common/Icon';
import ProductCard from '../components/products/ProductCard';
import SkeletonGrid from '../components/common/SkeletonGrid';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { productApi } from '../api/product.api';
import { categoryApi } from '../api/category.api';

const PRICE_BANDS = [
  { id: 'all',     label: 'Any price',    min: 0,   max: Infinity },
  { id: 'u75',     label: 'Under $75',    min: 0,   max: 75 },
  { id: '75-200',  label: '$75–$200',     min: 75,  max: 200 },
  { id: '200-500', label: '$200–$500',    min: 200, max: 500 },
  { id: 'o500',    label: '$500+',        min: 500, max: Infinity },
];

const SORTS = [
  { id: 'newest',    label: 'Newest' },
  { id: 'name_asc',  label: 'Name A–Z' },
  { id: 'price_asc', label: 'Price · Low to High' },
  { id: 'price_desc',label: 'Price · High to Low' },
];

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const activeCatId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : null;
  const searchQuery = searchParams.get('search') || '';
  const [band, setBand] = useState('all');
  const [sort, setSort] = useState('newest');

  const fetchAll = useCallback(() => {
    setLoading(true);
    setError(false);
    Promise.all([
      productApi.getProducts({ limit: 100 }),
      categoryApi.getCategories(),
    ]).then(([pRes, cRes]) => {
      setAllProducts(pRes.data.data);
      setCategories(cRes.data.data.categories);
    }).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const activeCat = categories.find((c) => c.id === activeCatId);

  let items = allProducts
    .filter((p) => !activeCatId || p.category?.id === activeCatId)
    .filter((p) => {
      const pb = PRICE_BANDS.find((b) => b.id === band) || PRICE_BANDS[0];
      const price = parseFloat(p.price);
      return price >= pb.min && price <= pb.max;
    })
    .filter((p) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  items = [...items].sort((a, b) => {
    if (sort === 'price_asc')  return parseFloat(a.price) - parseFloat(b.price);
    if (sort === 'price_desc') return parseFloat(b.price) - parseFloat(a.price);
    if (sort === 'name_asc')   return a.name.localeCompare(b.name);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const setCat = (catId) => {
    const params = new URLSearchParams(searchParams);
    if (catId) params.set('categoryId', catId);
    else params.delete('categoryId');
    params.delete('search');
    setSearchParams(params);
  };

  const clearAll = () => {
    setSearchParams({});
    setBand('all');
  };

  const activeFilters = (activeCatId ? 1 : 0) + (band !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0);

  const state = loading ? 'loading' : error ? 'error' : items.length === 0 ? 'empty' : 'ready';

  return (
    <div className="page">
      <div className="wrap page-head">
        <div className="crumb" style={{ marginBottom: 16 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit', padding: 0 }}>Home</button>
          <Icon name="chevron" />
          <span style={{ color: 'var(--ink)' }}>{activeCat ? activeCat.name : 'Shop All'}</span>
        </div>
        <div className="sec-head" style={{ marginBottom: 26, alignItems: 'flex-end' }}>
          <div>
            <h1 className="page-title">{activeCat ? activeCat.name : 'Shop All'}</h1>
            <p className="muted" style={{ marginTop: 10, fontSize: 15.5 }}>
              {activeCat ? activeCat.name + ' — made by hand, built to last.' : 'The full Terra collection — made by hand, built to last.'}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky filter toolbar */}
      <div className="cat-toolbar">
        <div className="wrap row between" style={{ gap: 16, paddingTop: 14, paddingBottom: 14 }}>
          <div className="cat-chips no-sb desktop-only">
            <button className={'chip' + (!activeCatId ? ' chip--active' : '')} onClick={() => setCat(null)}>All</button>
            {categories.map((c) => (
              <button key={c.id} className={'chip' + (activeCatId === c.id ? ' chip--active' : '')} onClick={() => setCat(c.id)}>{c.name}</button>
            ))}
          </div>
          <button className="btn btn--ghost btn--sm mobile-only" onClick={() => setShowFilters(true)}>
            <Icon name="filter" size={16} /> Filters{activeFilters ? ` · ${activeFilters}` : ''}
          </button>
          <div className="row" style={{ gap: 12, flex: '0 0 auto' }}>
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
        <div className="row between" style={{ marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
          <span className="mono faint" style={{ fontSize: 12 }}>
            {state === 'loading' ? 'Loading…' : `${items.length} ${items.length === 1 ? 'piece' : 'pieces'}${activeCat ? ' in ' + activeCat.name : ''}`}
          </span>
          {activeFilters > 0 && state !== 'loading' && (
            <button className="btn btn--quiet btn--sm" onClick={clearAll}><Icon name="close" size={14} /> Clear filters</button>
          )}
        </div>

        {state === 'loading' && <SkeletonGrid count={8} />}
        {state === 'error' && <ErrorState onRetry={fetchAll} />}
        {state === 'empty' && (
          <EmptyState icon="search" title="No pieces match"
            body="Try a different category or price — or clear your filters to see the full collection."
            action={<button className="btn btn--primary" onClick={clearAll}>Clear all filters</button>} />
        )}
        {state === 'ready' && (
          <div className="pgrid">
            {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>

      {/* Mobile filter sheet */}
      {showFilters && (
        <div className="drawer-scrim fade" onClick={() => setShowFilters(false)}>
          <aside className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="row between" style={{ marginBottom: 22 }}>
              <h3 className="serif" style={{ fontSize: 22, fontWeight: 400 }}>Filters</h3>
              <button className="hdr-icon" onClick={() => setShowFilters(false)}><Icon name="close" size={20} /></button>
            </div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Category</div>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 26 }}>
              <button className={'chip' + (!activeCatId ? ' chip--active' : '')} onClick={() => setCat(null)}>All</button>
              {categories.map((c) => (
                <button key={c.id} className={'chip' + (activeCatId === c.id ? ' chip--active' : '')} onClick={() => setCat(c.id)}>{c.name}</button>
              ))}
            </div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Price</div>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 30 }}>
              {PRICE_BANDS.map((b) => (
                <button key={b.id} className={'chip' + (band === b.id ? ' chip--active' : '')} onClick={() => setBand(b.id)}>{b.label}</button>
              ))}
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
}
