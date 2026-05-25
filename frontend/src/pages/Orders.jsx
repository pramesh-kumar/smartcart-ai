import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await api.orders.getHistory(page, 5);
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error('Failed to load orders history:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user, page]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'badge-pending';
      case 'PAID': return 'badge-paid';
      case 'SHIPPED': return 'badge-shipped';
      case 'DELIVERED': return 'badge-delivered';
      case 'CANCELLED': return 'badge-cancelled';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (e) {
      return dateString;
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Login Required</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Please log in to your account to view your past transaction order history.
          </p>
          <Link to="/login" className="btn-primary">Sign In Here</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>
        Your Transaction History
      </h1>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          Retrieving transactional history records...
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '1rem', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.9rem' }}>
          ⚠ {error}
        </div>
      )}

      {/* Dynamic Orders Log List */}
      {!loading && orders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.3s ease-out' }}>
          {orders.map((order) => (
            <div key={order.orderId} className="glass-panel" style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              {/* Order Metadata Header bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                paddingBottom: '1rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Order ID</div>
                  <span style={{ fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    {order.orderId}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Placed On</div>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Status</div>
                  <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount</div>
                  <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-light)' }}>
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Shipping/Payment information breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Shipping Address</span>
                  <span style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>{order.shippingAddress}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Payment Method</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{order.paymentMethod?.replace('_', ' ') || 'CREDIT CARD'}</span>
                </div>
              </div>

              {/* Items Purchased details snapshot */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  Items in this Order
                </span>
                {order.items?.map((item) => (
                  <div key={item.orderItemId} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.85rem',
                    gap: '1rem'
                  }}>
                    <Link to={`/products/${item.productId}`} style={{
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textDecoration: 'none'
                    }} className="hover-link">
                      {item.productName}
                    </Link>
                    <div style={{ display: 'flex', gap: '1.5rem', flexShrink: '0' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Qty: {item.quantity}
                      </span>
                      <span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty history records visual */}
      {!loading && orders.length === 0 && (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '1rem' }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <p style={{ fontWeight: '500', marginBottom: '1.5rem' }}>You have not placed any orders yet.</p>
          <Link to="/products" className="btn-primary">Find Products</Link>
        </div>
      )}

      {/* Pagination controls */}
      {!loading && totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            onClick={() => setPage(prev => Math.max(0, prev - 1))}
            disabled={page === 0}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            Previous
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={page === totalPages - 1}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            Next
          </button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .hover-link:hover {
          color: var(--accent-light) !important;
          text-decoration: underline !important;
        }
      `}} />
    </div>
  );
}
