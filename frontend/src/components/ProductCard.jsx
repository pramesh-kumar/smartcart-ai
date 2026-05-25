import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault(); // Stop navigation click
    addToCart(product.id, 1);
  };

  const getStockStatus = () => {
    if (product.stockQuantity === 0) return { label: 'Out of Stock', color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' };
    if (product.stockQuantity < 5) return { label: `Only ${product.stockQuantity} Left`, color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' };
    return { label: 'In Stock', color: 'var(--success)', bg: 'rgba(16,185,129,0.1)' };
  };

  const stockInfo = getStockStatus();

  // Create a stunning premium HSL color gradient placeholder based on SKU/UUID so each item looks custom
  const getGradient = (id) => {
    const num = id ? id.charCodeAt(0) + id.charCodeAt(id.length - 1) : 100;
    const hue1 = num % 360;
    const hue2 = (hue1 + 60) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 75%, 45%), hsl(${hue2}, 85%, 25%))`;
  };

  return (
    <Link to={`/products/${product.id}`} className="glass-card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '400px',
      overflow: 'hidden',
      textDecoration: 'none',
      color: 'inherit',
      position: 'relative'
    }}>
      {/* Product Image Panel */}
      <div style={{
        width: '100%',
        height: '180px',
        background: getGradient(product.id),
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: '1rem',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.4)'
      }}>
        {/* Category tag */}
        <span style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.7rem',
          fontWeight: '600',
          color: 'var(--text-secondary)'
        }}>
          {product.categoryName || 'Catalog'}
        </span>

        {/* Dynamic Stock tag */}
        <span style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: stockInfo.bg,
          color: stockInfo.color,
          border: `1px solid ${stockInfo.color}33`,
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.7rem',
          fontWeight: '600'
        }}>
          {stockInfo.label}
        </span>

        {/* Abstract Isometric SVG representation representing technology category */}
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      </div>

      {/* Product Information */}
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: '1' }}>
        <h3 style={{
          fontSize: '1.15rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          lineHeight: '1.3',
          display: '-webkit-box',
          WebkitLineClamp: '2',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.6rem'
        }} title={product.name}>
          {product.name}
        </h3>

        {/* Star Rating visualization */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.8rem' }}>
          {[...Array(5)].map((_, i) => {
            const starValue = i + 1;
            const avg = product.averageRating || 0;
            return (
              <svg 
                key={i} 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill={starValue <= Math.round(avg) ? 'var(--warning)' : 'none'}
                stroke={starValue <= Math.round(avg) ? 'var(--warning)' : 'rgba(255,255,255,0.2)'}
                strokeWidth="2"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            );
          })}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
            ({product.averageRating ? product.averageRating.toFixed(1) : 'No reviews'})
          </span>
        </div>

        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: '3',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: '1.4',
          minHeight: '3.6rem'
        }}>
          {product.description || 'No description provided.'}
        </p>

        {/* Pricing Actions Block */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          paddingTop: '0.8rem',
          borderTop: '1px solid rgba(255,255,255,0.04)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price</div>
            <div style={{
              fontSize: '1.3rem',
              fontWeight: '800',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)'
            }}>${product.price.toFixed(2)}</div>
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0}
            className="btn-primary"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              borderRadius: '6px',
              minWidth: '100px'
            }}
          >
            Add
          </button>
        </div>
      </div>
    </Link>
  );
}
