import React, { useState } from 'react';
import { api } from '../services/api';

export default function ReviewForm({ productId, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide a comment for your review.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.reviews.create(productId, rating, comment);
      setSuccess(true);
      setComment('');
      setRating(5);
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      console.error('Review submission failed:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.8rem', borderRadius: '12px' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '1rem' }}>
        Write a Product Review
      </h3>

      {success && (
        <div style={{
          background: 'rgba(16,185,129,0.1)',
          color: 'var(--success)',
          padding: '0.8rem 1rem',
          borderRadius: '6px',
          border: '1px solid rgba(16,185,129,0.2)',
          fontSize: '0.9rem',
          marginBottom: '1rem'
        }}>
          ✓ Review posted successfully! Thank you for your feedback.
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          color: 'var(--danger)',
          padding: '0.8rem 1rem',
          borderRadius: '6px',
          border: '1px solid rgba(239,68,68,0.2)',
          fontSize: '0.9rem',
          marginBottom: '1rem',
          lineHeight: '1.4'
        }}>
          ⚠ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {/* Interactive Star Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Rating
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  transition: 'transform 0.1s'
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill={star <= (hoveredStar || rating) ? 'var(--warning)' : 'none'}
                  stroke={star <= (hoveredStar || rating) ? 'var(--warning)' : 'rgba(255,255,255,0.2)'}
                  strokeWidth="2"
                  style={{
                    transform: (hoveredStar === star) ? 'scale(1.2)' : 'none',
                    transition: 'transform 0.1s'
                  }}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </button>
            ))}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
              ({rating} out of 5 stars)
            </span>
          </div>
        </div>

        {/* Comment textarea */}
        <div>
          <label htmlFor="comment" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Review Comments
          </label>
          <textarea
            id="comment"
            rows="4"
            className="glass-input"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product... (e.g. build quality, performance, value)"
            style={{ width: '100%', resize: 'vertical' }}
            disabled={loading}
          />
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          style={{ alignSelf: 'flex-start' }}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
