import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(6); // 6 items per page looks excellent in 3-column layouts
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch Categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.categories.getAll();
        setCategories(data);
      } catch (err) {
        console.error('Failed to retrieve categories catalog:', err.message);
      }
    };
    fetchCategories();
  }, []);

  // 2. Fetch Products whenever category, page, or search keyword triggers changes
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.products.getAll({
        categoryId: selectedCategory || null,
        keyword: keyword || null,
        page,
        size,
        sortBy: 'createdAt',
        sortDir: 'desc'
      });
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Failed to load products list:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0); // Reset page on new keyword query search
    fetchProducts();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Search Header Panel */}
      <section className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: '1.2rem', fontWeight: '800' }}>
          Explore Products Catalog
        </h2>

        <form onSubmit={handleSearchSubmit} style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Keyword Search */}
          <div style={{ flexGrow: '1', minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="glass-input"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by keywords or SKU (e.g. PlayStation)..."
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '15px' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>

          {/* Category Dropdown Selector */}
          <div style={{ width: '220px' }}>
            <select
              className="glass-input"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(0); // Reset page on category changes
              }}
              style={{ width: '100%', height: '46px', background: 'rgba(15,23,42,0.6)', cursor: 'pointer' }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary" style={{ height: '46px', padding: '0 1.5rem' }}>
            Search
          </button>
        </form>
      </section>

      {/* Loading feedback overlay */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          Syncing catalog inventories...
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '1rem', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.9rem' }}>
          ⚠ {error}
        </div>
      )}

      {/* Products Grid */}
      {!loading && products.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '2rem',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Empty States */}
      {!loading && products.length === 0 && (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', borderStyle: 'dashed' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '1rem' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <p style={{ fontWeight: '500' }}>No products match your search criteria.</p>
          <button onClick={() => { setKeyword(''); setSelectedCategory(''); setPage(0); }} className="btn-secondary" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
            Clear All Filters
          </button>
        </div>
      )}

      {/* Pagination Actions */}
      {!loading && totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginTop: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '1.5rem'
        }}>
          <button
            onClick={() => setPage(prev => Math.max(0, prev - 1))}
            disabled={page === 0}
            className="btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            ← Previous
          </button>
          
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            Page {page + 1} of {totalPages}
          </span>

          <button
            onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={page === totalPages - 1}
            className="btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
