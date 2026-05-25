import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

export default function ChatAssistant({ isOpen, onClose }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Hello! I'm your SmartCart AI Shopping Assistant. 🤖\n\nTell me what you're looking for! For example:\n• *'I need a gaming console under $600'*\n• *'Suggest laptops for coding'*\n• *'Show me headphones with good ratings'*",
      preferences: null,
      recommendations: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  if (!isOpen) return null;

  const sendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    // 1. Add User Message
    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // 2. Query Conversational AI
      const response = await api.ai.chat(textToSend);
      
      // 3. Add Assistant Response
      const assistantMsg = {
        sender: 'assistant',
        text: response.reply,
        preferences: response.extractedPreferences,
        recommendations: response.recommendations || [],
        followUps: response.suggestedFollowUps || []
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('AI chat failed:', err.message);
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: "I'm sorry, I'm having trouble processing that query. Please make sure the backend server is running and try again!",
        recommendations: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleProductClick = (productId) => {
    onClose();
    navigate(`/products/${productId}`);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      zIndex: '1000',
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: '-1'
        }}
      />

      {/* Floating Panel Console */}
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '500px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '0',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
        padding: '1.5rem',
        animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--success), #34d399)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                <circle cx="12" cy="5" r="2"></circle>
                <path d="M12 7v4"></path>
                <line x1="8" y1="16" x2="8.01" y2="16"></line>
                <line x1="16" y1="16" x2="16.01" y2="16"></line>
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700', fontFamily: 'var(--font-display)' }}>
                Conversational AI Shopping
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} className="pulse-ring"></span>
                Online & Ready
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '0.4rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Messages Stream */}
        <div style={{
          flexGrow: '1',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem',
          paddingRight: '0.3rem',
          marginBottom: '1rem'
        }}>
          {messages.map((msg, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                width: '100%',
                animation: 'fadeIn 0.2s ease-out forwards'
              }}
            >
              {/* Message Bubble */}
              <div style={{
                maxWidth: '85%',
                padding: '0.8rem 1.1rem',
                borderRadius: msg.sender === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                background: msg.sender === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                boxShadow: msg.sender === 'user' ? '0 4px 12px var(--accent-glow)' : 'none'
              }}>
                {msg.text}
              </div>

              {/* Extracted preferences visual tags */}
              {msg.preferences && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.4rem',
                  marginTop: '0.4rem',
                  padding: '0 0.2rem'
                }}>
                  {msg.preferences.extractedBudget && (
                    <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      Budget: ${msg.preferences.extractedBudget}
                    </span>
                  )}
                  {msg.preferences.extractedCategoryName && (
                    <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-light)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                      Category: {msg.preferences.extractedCategoryName}
                    </span>
                  )}
                  {msg.preferences.extractedIntentKeywords && msg.preferences.extractedIntentKeywords.length > 0 && (
                    <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      Intent: {msg.preferences.extractedIntentKeywords.join(', ')}
                    </span>
                  )}
                </div>
              )}

              {/* AI Recommended Products Cards List inside speech bubble context */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  marginTop: '0.8rem',
                  paddingLeft: '0.5rem',
                  borderLeft: '2px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Recommended Matchups
                  </div>
                  {msg.recommendations.map((prod) => (
                    <div 
                      key={prod.productId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.8rem',
                        background: 'rgba(16, 185, 129, 0.05)',
                        border: '1px solid rgba(16, 185, 129, 0.15)',
                        borderRadius: '8px',
                        gap: '0.8rem'
                      }}
                    >
                      <div 
                        onClick={() => handleProductClick(prod.productId)}
                        style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', flexGrow: '1', minWidth: '0' }}
                      >
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prod.productName}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600' }}>
                          Match Score: {prod.recommendationScore ? prod.recommendationScore.toFixed(0) : '90'}%
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                          ${prod.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => addToCart(prod.productId, 1)}
                          style={{
                            background: 'var(--success)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '4px',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Dynamic Follow-up Suggestions pill tags */}
              {msg.followUps && msg.followUps.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.4rem',
                  marginTop: '0.8rem',
                  justifyContent: 'flex-start',
                  width: '100%'
                }}>
                  {msg.followUps.map((follow, fIdx) => (
                    <button
                      key={fIdx}
                      onClick={() => sendMessage(follow)}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--accent-light)',
                        borderRadius: '50px',
                        padding: '0.35rem 0.8rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'var(--accent)';
                        e.target.style.color = 'white';
                        e.target.style.borderColor = 'transparent';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.03)';
                        e.target.style.color = 'var(--accent-light)';
                        e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                      }}
                    >
                      {follow}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: '0.2rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', animation: 'bounce 1s infinite 0.1s' }}></span>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', animation: 'bounce 1s infinite 0.2s' }}></span>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', animation: 'bounce 1s infinite 0.3s' }}></span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assistant thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer Chat Input */}
        <form onSubmit={handleSend} style={{
          display: 'flex',
          gap: '0.6rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '1rem',
          marginTop: 'auto'
        }}>
          <input
            type="text"
            className="glass-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your e-commerce query... (e.g. laptop under $1000)"
            style={{ flexGrow: '1', borderRadius: '8px', padding: '0.8rem' }}
            disabled={loading}
          />
          <button 
            type="submit"
            className="btn-primary"
            style={{ width: '46px', height: '46px', padding: '0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifySelf: 'center' }}
            disabled={loading || !input.trim()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}} />
    </div>
  );
}
