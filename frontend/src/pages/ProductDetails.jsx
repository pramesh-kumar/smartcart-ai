import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ReviewForm from '../components/ReviewForm';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [reviewPage, setReviewPage] = useState(0);
  const [reviewTotalPages, setReviewTotalPages] = useState(0);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.products.getById(id);
      setProduct(data);
      setAverageRating(data.averageRating || 0);
      
      // Load public reviews
      await fetchProductReviews();
    } catch (err) {
      console.error('Failed to load product details:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductReviews = async () => {
    setReviewsLoading(true);
    try {
      const data = await api.reviews.getForProduct(id, reviewPage, 5);
      setReviews(data.content || []);
      setReviewTotalPages(data.totalPages || 0);
      
      // Also sync average rating score
      const avgData = await api.reviews.getAverage(id);
      setAverageRating(avgData.averageRating || 0);
    } catch (err) {
      console.error('Failed to load product reviews:', err.message);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchProductReviews();
    }
  }, [reviewPage]);

  const handleReviewSubmitted = () => {
    setReviewPage(0);
    fetchProductReviews();
  };

  const getGradient = (productId) => {
    const num = productId ? productId.charCodeAt(0) + productId.charCodeAt(productId.length - 1) : 100;
    const hue1 = num % 360;
    const hue2 = (hue1 + 60) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 75%, 45%), hsl(${hue2}, 85%, 25%))`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0', color: 'var(--text-secondary)' }}>
        Retrieving catalog details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <h3 style={{ color: 'var(--danger)', fontSize: '1.4rem', marginBottom: '1rem' }}>Product Not Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {error || "The requested catalog product ID does not exist."}
          </p>
          <Link to="/products" className="btn-primary">Return to Catalog</Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stockQuantity === 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* Dynamic Columns Card Grid */}
      <section className="glass-panel" style={{
        padding: '2.5rem',
        borderRadius: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '3rem'
      }}>
        {/* Left Column: Premium visual placeholder */}
        <div style={{
          width: '100%',
          minHeight: '350px',
          background: getGradient(product.id),
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)',
          position: 'relative'
        }}>
          <svg width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.8" style={{ opacity: 0.75 }}>
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
        </div>

        {/* Right Column: Metadata details sheet */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span className="badge" style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text-secondary)',
            marginBottom: '0.8rem',
            alignSelf: 'flex-start'
          }}>{product.categoryName || 'Electronics'}</span>

          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', fontFamily: 'var(--font-display)', marginBottom: '0.5rem', lineHeight: '1.2' }}>
            {product.name}
          </h1>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
            SKU Code: <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{product.sku}</span>
          </div>

          {/* Average Stars Rating Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1.5rem' }}>
            {[...Array(5)].map((_, i) => (
              <svg 
                key={i} 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill={i + 1 <= Math.round(averageRating) ? 'var(--warning)' : 'none'}
                stroke={i + 1 <= Math.round(averageRating) ? 'var(--warning)' : 'rgba(255,255,255,0.2)'}
                strokeWidth="2.5"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            ))}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', marginLeft: '0.3rem' }}>
              {averageRating > 0 ? `${averageRating.toFixed(1)} / 5.0` : 'No Rating Yet'}
            </span>
          </div>

          <div style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            marginBottom: '1rem'
          }}>
            ${product.price.toFixed(2)}
          </div>

          {/* Stock inventory tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isOutOfStock ? 'var(--danger)' : 'var(--success)'
            }}></span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
              {isOutOfStock ? 'Out of Stock' : `${product.stockQuantity} items available in stock`}
            </span>
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem' }}>
            {product.description || 'No description provided for this catalog item.'}
          </p>

          <button
            onClick={() => addToCart(product.id, 1)}
            disabled={isOutOfStock}
            className="btn-primary"
            style={{ width: '100%', maxWidth: '280px', padding: '1rem', borderRadius: '8px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Add to Shopping Cart
          </button>
        </div>
      </section>

      {/* Dynamic customer reviews logging list */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
        
        {/* Left pane: Review submission form */}
        <div>
          {user ? (
            <ReviewForm productId={product.id} onReviewSubmitted={handleReviewSubmitted} />
          ) : (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                You must be logged in to submit a review for this product.
              </p>
              <Link to="/login" className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem' }}>
                Log In Here
              </Link>
            </div>
          )}
        </div>

        {/* Right pane: Reviews list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: '800' }}>
            Customer Feedback & Reviews
          </h3>

          {reviewsLoading && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading reviews...</div>
          )}

          {!reviewsLoading && reviews.length === 0 && (
            <div style={{ border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '12px', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No customer reviews found for this product yet.
            </div>
          )}

          {!reviewsLoading && reviews.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((rev) => (
                <div key={rev.id} style={{
                  padding: '1.2rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {rev.userEmail}
                    </span>
                    <div style={{ display: 'flex', gap: '0.1rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          width="12" 
                          height="12" 
                          viewBox="0 0 24 24" 
                          fill={i + 1 <= rev.rating ? 'var(--warning)' : 'none'}
                          stroke={i + 1 <= rev.rating ? 'var(--warning)' : 'rgba(255,255,255,0.2)'}
                          strokeWidth="2.5"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {rev.comment}
                  </p>
                </div>
              ))}

              {/* Reviews paginated buttons */}
              {reviewTotalPages > 1 && (
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginTop: '0.5rem' }}>
                  <button
                    onClick={() => setReviewPage(prev => Math.max(0, prev - 1))}
                    disabled={reviewPage === 0}
                    className="btn-secondary"
                    style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}
                  >
                    Prev
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {reviewPage + 1} of {reviewTotalPages}
                  </span>
                  <button
                    onClick={() => setReviewPage(prev => Math.min(reviewTotalPages - 1, prev + 1))}
                    disabled={reviewPage === reviewTotalPages - 1}
                    className="btn-secondary"
                    style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
