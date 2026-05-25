import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [intent, setIntent] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.categories.getAll();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories for homepage:', err.message);
      }
    };
    fetchCategories();
  }, []);

  const handleGetRecommendations = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoadingRecs(true);
    setError(null);
    try {
      const data = await api.ai.getRecommendations({
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        categoryId: categoryId || null,
        intent: intent || null
      });
      
      // Map recommendation response DTO to catalog product fields
      const formattedRecs = data.map(rec => ({
        id: rec.productId,
        name: rec.productName,
        price: rec.price,
        averageRating: rec.averageRating,
        description: rec.reason, // Use reasoning text in description spot to showcase recommendation reasons!
        stockQuantity: 10,
        categoryName: categories.find(c => c.id === categoryId)?.name || 'Recommended'
      }));

      setRecommendations(formattedRecs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingRecs(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Hero Welcome Splash */}
      <section className="glass-panel animate-fade-in" style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Pulsing decorative background glow */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'var(--accent)',
          filter: 'blur(100px)',
          opacity: 0.15,
          zIndex: '-1'
        }} />

        <h1 style={{
          fontSize: '3rem',
          marginBottom: '1.2rem',
          fontFamily: 'var(--font-display)',
          fontWeight: '900',
          background: 'linear-gradient(135deg, #ffffff, #94a3b8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: '1.1'
        }}>
          Next-Gen AI Powered Shopping
        </h1>
        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          maxWidth: '650px',
          margin: '0 auto 2.5rem',
          lineHeight: '1.6'
        }}>
          Discover a smarter way to search, buy, and interact. SmartCart AI leverages rule-based preference scoring and natural language parsing to match you with exactly what you need.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/products" className="btn-primary" style={{ padding: '0.9rem 2.2rem', fontSize: '1rem' }}>
            Explore Catalog
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
          {!user && (
            <Link to="/signup" className="btn-secondary" style={{ padding: '0.9rem 2.2rem', fontSize: '1rem' }}>
              Create Free Account
            </Link>
          )}
        </div>
      </section>

      {/* Dynamic Recommendation Panel (Visible only when logged in) */}
      {user ? (
        <section className="glass-panel" style={{ padding: '2.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" strokeWidth="2.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-display)' }}>
                Rule-Based AI Recommendations
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Tailor suggestions utilizing budgets, categories, and purchase history affinities.
              </p>
            </div>
          </div>

          <form onSubmit={handleGetRecommendations} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.2rem',
            alignItems: 'end',
            marginBottom: '2rem'
          }}>
            <div>
              <label htmlFor="recCategory" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Category Scope
              </label>
              <select
                id="recCategory"
                className="glass-input"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', height: '46px', background: 'rgba(15,23,42,0.6)', cursor: 'pointer' }}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="recBudget" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Max Price (Budget limit)
              </label>
              <input
                type="number"
                id="recBudget"
                className="glass-input"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 600"
                style={{ width: '100%' }}
                min="0"
              />
            </div>

            <div>
              <label htmlFor="recIntent" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Preference Keyword Intent
              </label>
              <input
                type="text"
                id="recIntent"
                className="glass-input"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="e.g. gaming, slim"
                style={{ width: '100%' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ height: '46px', width: '100%', gap: '0.5rem' }}>
              Suggest Products
            </button>
          </form>

          {loadingRecs && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Calculating personalized matching scores...
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '1rem', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              ⚠ {error}
            </div>
          )}

          {/* Scored Recommendations Grid */}
          {!loadingRecs && recommendations.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              {recommendations.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {!loadingRecs && recommendations.length === 0 && (
            <div style={{ border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '12px', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No active recommendations loaded. Set parameters above and click "Suggest Products"!
            </div>
          )}
        </section>
      ) : (
        <section className="glass-card" style={{
          padding: '2.5rem',
          borderRadius: '16px',
          textAlign: 'center',
          border: '1px dashed rgba(255,255,255,0.08)'
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '0.8rem' }}>
            Unlock Scored AI Recommendations
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            Log in to enable personalized e-commerce recommendation scoring matrices which combine categories, star-level popularity, budget constraints, and intent keyword maps.
          </p>
          <Link to="/login" className="btn-primary" style={{ padding: '0.7rem 1.8rem' }}>Log In to Try</Link>
        </section>
      )}
    </div>
  );
}
