import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ShoppingCart, Home } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';

export default function PaymentCancelPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#000000' }}>
      <Navbar />

      <div style={{
        maxWidth: '560px',
        margin: '0 auto',
        padding: '140px 2rem 6rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}>

        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
          <div style={{ width: '24px', height: '1px', background: 'rgba(0,0,0,0.15)' }} />
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)' }}>
            Payment · Cancelled
          </span>
          <div style={{ width: '24px', height: '1px', background: 'rgba(0,0,0,0.15)' }} />
        </div>

        {/* Icon */}
        <div style={{
          width: '88px', height: '88px',
          borderRadius: '50%',
          background: 'rgba(220, 38, 38, 0.06)',
          border: '1px solid rgba(220,38,38,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '2.5rem',
          boxShadow: '0 0 0 8px rgba(220,38,38,0.04)',
        }}>
          <XCircle size={44} color="#dc2626" />
        </div>

        {/* Status badge */}
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '0.35rem 1rem',
          background: '#fef2f2', color: '#dc2626',
          borderRadius: '50px', fontSize: '0.65rem', fontWeight: 700,
          fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase',
          marginBottom: '1.5rem',
        }}>
          Cancelled
        </span>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 900,
          fontSize: 'clamp(2rem, 6vw, 3rem)',
          color: '#000000',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          marginBottom: '1rem',
        }}>
          Payment Cancelled
        </h1>

        {/* Subtitle */}
        <p style={{
          color: 'rgba(0,0,0,0.5)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '0.9rem',
          lineHeight: 1.7,
          maxWidth: '360px',
          marginBottom: '3rem',
        }}>
          You cancelled the payment. No charges have been made.<br />
          Your cart items have been restored — feel free to try again.
        </p>

        {/* Info box */}
        <div style={{
          background: 'rgba(0,0,0,0.02)',
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          marginBottom: '2.5rem',
          width: '100%',
          maxWidth: '380px',
          textAlign: 'left',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8rem', color: 'rgba(0,0,0,0.55)', lineHeight: 1.6, margin: 0 }}>
            Your cart items are still saved. You can proceed to checkout whenever you're ready.
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/checkout')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.85rem 1.75rem',
              background: '#000000', color: '#ffffff',
              border: 'none', cursor: 'pointer', borderRadius: '50px',
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
              fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
          >
            <ShoppingCart size={15} /> Try Again
          </button>
          <button
            onClick={() => navigate('/shop')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.85rem 1.75rem',
              background: 'transparent', color: '#000000',
              border: '1px solid rgba(0,0,0,0.2)', cursor: 'pointer', borderRadius: '50px',
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
              fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
          >
            <Home size={15} /> Back to Shop
          </button>
        </div>
      </div>
    </div>
  );
}
