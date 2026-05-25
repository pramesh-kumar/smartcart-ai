import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Cart() {
  const { cart, totalPrice, updateQuantity, removeFromCart, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setCheckoutError('Please provide a valid shipping address for checkout.');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      // 1. Submit checkout API
      await api.orders.checkout(shippingAddress, paymentMethod);
      
      // 2. Refresh cart state (should be empty now)
      await refreshCart();
      
      // 3. Navigate to orders chronological logs page
      navigate('/orders');
    } catch (err) {
      console.error('Checkout failed:', err.message);
      setCheckoutError(err.message || 'An error occurred during checkout.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Login Required</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Please log in to your account to view your active shopping cart and place orders.
          </p>
          <Link to="/login" className="btn-primary">Sign In Here</Link>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>
        Review Shopping Cart
      </h1>

      {isEmpty ? (
        <div className="glass-panel animate-fade-in" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '1rem' }}>
            <circle cx="8" cy="21" r="1"></circle>
            <circle cx="19" cy="21" r="1"></circle>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
          </svg>
          <p style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '1.5rem' }}>Your shopping cart is currently empty.</p>
          <Link to="/products" className="btn-primary">Browse Catalog Items</Link>
        </div>
      ) : (
        /* Columns: Left-Items / Right-Checkout Checkout Info */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start'
        }}>
          {/* Left panel: Cart line-items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cart.items.map((item) => (
              <div key={item.cartItemId} className="glass-panel" style={{
                padding: '1.2rem',
                display: 'flex',
                gap: '1.2rem',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                {/* Product miniatures visual */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: '0',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  </svg>
                </div>

                {/* Details info */}
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: '1', minWidth: '0' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.productName}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    SKU Code: {item.productSku}
                  </span>

                  {/* Quantity Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '4px',
                      padding: '0.1rem'
                    }}>
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.1rem 0.5rem', fontWeight: 'bold' }}
                      >-</button>
                      <span style={{ fontSize: '0.85rem', width: '24px', textAlign: 'center', fontWeight: '600' }}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.1rem 0.5rem', fontWeight: 'bold' }}
                      >+</button>
                    </div>

                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      x ${item.productPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-light)' }}>
                    ${item.totalItemPrice.toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.3)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      textDecoration: 'underline'
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--danger)'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.3)'}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right panel: Checkout Submission Form */}
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '1.2rem', fontWeight: '800' }}>
              Order checkout billing
            </h3>

            {checkoutError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)', padding: '0.8rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.4' }}>
                ⚠ {checkoutError}
              </div>
            )}

            <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label htmlFor="shippingAddress" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Shipping Address
                </label>
                <textarea
                  id="shippingAddress"
                  className="glass-input"
                  rows="3"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Street, Suite, Postal Code, City, State..."
                  style={{ width: '100%', resize: 'vertical' }}
                  disabled={checkoutLoading}
                />
              </div>

              <div>
                <label htmlFor="paymentMethod" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  className="glass-input"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ width: '100%', background: 'rgba(15,23,42,0.6)', cursor: 'pointer', height: '46px' }}
                  disabled={checkoutLoading}
                >
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="PAYPAL">PayPal</option>
                  <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
                </select>
              </div>

              {/* Cumulative totals */}
              <div style={{ margin: '1rem 0 0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Shipping Cost</span>
                  <span style={{ color: 'var(--success)' }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '800' }}>
                  <span>Order Total</span>
                  <span style={{ color: 'var(--text-primary)' }}>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', gap: '0.5rem' }}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? 'Processing Checkout...' : 'Place Secure Order'}
                {!checkoutLoading && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
