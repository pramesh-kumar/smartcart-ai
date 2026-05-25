import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Profile() {
  const { user } = useAuth();
  const { totalItemsCount } = useCart();

  if (!user) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Login Required</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Please log in to your account to view your user profile dashboard.
          </p>
          <Link to="/login" className="btn-primary">Sign In Here</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>
        User Account Profile
      </h1>

      <div className="glass-panel animate-fade-in" style={{
        padding: '2.5rem',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        {/* Avatar Header info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Avatar round badge */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: '800',
            color: 'white',
            boxShadow: '0 4px 15px var(--accent-glow)'
          }}>
            {user.firstName?.charAt(0).toUpperCase()}
            {user.lastName?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {user.firstName} {user.lastName}
            </h2>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{user.email}</span>
          </div>
        </div>

        {/* Account credentials info mapping */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '1.5rem'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>First Name</span>
            <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{user.firstName}</span>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Last Name</span>
            <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{user.lastName}</span>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Email Address</span>
            <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{user.email}</span>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Assigned Roles</span>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
              {user.roles?.map((role, idx) => (
                <span key={idx} className="badge" style={{
                  background: 'rgba(99,102,241,0.15)',
                  color: '#818cf8',
                  border: '1px solid rgba(99,102,241,0.3)',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.65rem'
                }}>
                  {role.replace('ROLE_', '')}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Dashboard visual stats block */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.2rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '1.5rem'
        }}>
          <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Active Cart Items</span>
            <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-light)' }}>{totalItemsCount}</span>
          </div>

          <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Account Status</span>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--success)', display: 'block', marginTop: '0.3rem' }}>ACTIVE</span>
          </div>
        </div>

        {/* Actions panel */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '1.5rem',
          marginTop: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <Link to="/orders" className="btn-secondary" style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>View Order History</Link>
          <Link to="/products" className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>Start Shopping</Link>
        </div>
      </div>
    </div>
  );
}
