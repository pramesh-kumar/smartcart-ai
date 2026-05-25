import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ onOpenCart, onOpenChat }) {
  const { user, logout, isAdmin } = useAuth();
  const { totalItemsCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: '0',
      zIndex: '100',
      margin: '1rem auto',
      width: '95%',
      maxWidth: '1200px',
      padding: '0.8rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '20px'
    }}>
      {/* Dynamic Branding */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{
          width: '32px',
          height: '32px',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 10px var(--accent-glow)'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="21" r="1"></circle>
            <circle cx="19" cy="21" r="1"></circle>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
          </svg>
        </div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.25rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #ffffff, var(--text-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em'
        }}>
          SmartCart <span style={{ color: 'var(--accent-light)', WebkitTextFillColor: 'initial' }}>AI</span>
        </span>
      </Link>

      {/* Main Navigation Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="nav-desktop">
        <Link to="/" style={{
          fontWeight: '500',
          color: isActive('/') ? 'var(--text-primary)' : 'var(--text-secondary)',
          textShadow: isActive('/') ? '0 0 10px var(--accent-glow)' : 'none',
          transition: 'var(--transition-smooth)'
        }}>Home</Link>
        <Link to="/products" style={{
          fontWeight: '500',
          color: isActive('/products') ? 'var(--text-primary)' : 'var(--text-secondary)',
          textShadow: isActive('/products') ? '0 0 10px var(--accent-glow)' : 'none',
          transition: 'var(--transition-smooth)'
        }}>Catalog</Link>
        {user && (
          <>
            <Link to="/orders" style={{
              fontWeight: '500',
              color: isActive('/orders') ? 'var(--text-primary)' : 'var(--text-secondary)',
              textShadow: isActive('/orders') ? '0 0 10px var(--accent-glow)' : 'none',
              transition: 'var(--transition-smooth)'
            }}>Orders</Link>
            <Link to="/profile" style={{
              fontWeight: '500',
              color: isActive('/profile') ? 'var(--text-primary)' : 'var(--text-secondary)',
              textShadow: isActive('/profile') ? '0 0 10px var(--accent-glow)' : 'none',
              transition: 'var(--transition-smooth)'
            }}>Profile</Link>
          </>
        )}
      </div>

      {/* Navigation Operations */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <>
            {/* AI Shopping Assistant Toggle Button */}
            <button 
              onClick={onOpenChat}
              className="pulse-ring"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--success), #34d399)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
                transition: 'var(--transition-smooth)'
              }}
              title="Chat with AI Assistant"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="10" r="2"></circle>
                <line x1="8" y1="10" x2="8.01" y2="10"></line>
                <line x1="16" y1="10" x2="16.01" y2="10"></line>
              </svg>
            </button>

            {/* Shopping Cart Drawer Toggle Button */}
            <button 
              onClick={onOpenCart}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'var(--transition-smooth)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {totalItemsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--accent)',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px var(--accent)'
                }}>
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Admin visual tag badge */}
            {isAdmin && (
              <span className="badge" style={{
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '0.2rem 0.5rem',
                fontSize: '0.65rem'
              }}>
                ADMIN
              </span>
            )}

            {/* Logout Action */}
            <button 
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                color: 'var(--text-secondary)',
                transition: 'var(--transition-smooth)',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Logout"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-secondary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>Login</Link>
            <Link to="/signup" className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>Sign Up</Link>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .nav-desktop {
            display: none !important;
          }
        }
      `}} />
    </nav>
  );
}
