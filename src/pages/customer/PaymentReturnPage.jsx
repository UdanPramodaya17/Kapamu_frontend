import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Check, X, AlertTriangle, Loader2, ArrowRight, ShieldCheck, 
  ShoppingBag, Calendar, RefreshCw
} from 'lucide-react';
import { paymentAPI } from '../../api';
import Navbar from '../../components/layout/Navbar';
import { formatPrice } from '../../utils/format';

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, failed, error
  const [orderDetails, setOrderDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (!orderId) {
      setStatus('error');
      setErrorMsg('No order code was found in the checkout callback.');
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await paymentAPI.verify(orderId);
        const data = res.data.data;
        
        if (data.status === 'success') {
          setStatus('success');
          setOrderDetails(data.order);
        } else {
          setStatus('failed');
          setErrorMsg(data.message || 'Payment verification failed.');
        }
      } catch (err) {
        console.error('Error verifying payment status:', err);
        setStatus('error');
        setErrorMsg(err?.response?.data?.message || 'Verification timed out. Check your order logs.');
      }
    };

    verifyPayment();
  }, [orderId]);

  const configs = {
    loading: {
      icon: Loader2,
      iconBg: '#fafafa',
      iconBorder: 'rgba(0,0,0,0.06)',
      iconColor: '#000000',
      title: 'Verifying Payment',
      desc: 'Retrieving secure confirmation status from PayHere servers. Please do not close or reload this browser tab.',
    },
    success: {
      icon: Check,
      iconBg: '#f0fdf4',
      iconBorder: '#b9f6ca',
      iconColor: '#16a34a',
      title: 'Payment Successful',
      desc: 'Thank you! Your transaction has been approved and processed. Your styling order is now official.',
      badge: { label: 'Transaction Complete', bg: '#f0fdf4', text: '#16a34a' }
    },
    failed: {
      icon: X,
      iconBg: '#fef2f2',
      iconBorder: '#ff8a80',
      iconColor: '#dc2626',
      title: 'Payment Declined',
      desc: 'Your financial transaction could not be authorized. Please review your balance and billing credentials and try again.',
      badge: { label: 'Payment Cancelled', bg: '#fef2f2', text: '#dc2626' }
    },
    error: {
      icon: AlertTriangle,
      iconBg: '#fffbeb',
      iconBorder: '#ffe082',
      iconColor: '#d97706',
      title: 'Verification Issue',
      desc: errorMsg || 'An unexpected server issue occurred while analyzing transaction status.',
      badge: { label: 'System Notice', bg: '#fffbeb', text: '#d97706' }
    }
  };

  const cfg = configs[status] || configs.error;
  const StatusIcon = cfg.icon;

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#000000' }}>
      <Navbar />

      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
        padding: '160px 2rem 8rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}>

        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
          <div style={{ width: '24px', height: '1px', background: 'rgba(0,0,0,0.15)' }} />
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)' }}>
            Payment · Gateway · Status
          </span>
          <div style={{ width: '24px', height: '1px', background: 'rgba(0,0,0,0.15)' }} />
        </div>

        {/* Icon Area */}
        {status === 'loading' ? (
          <div style={{
            width: '88px', height: '88px',
            borderRadius: '50%',
            border: '2px solid rgba(0,0,0,0.08)',
            borderTop: '2px solid #000',
            animation: 'spin 1s linear infinite',
            marginBottom: '2.5rem',
          }} />
        ) : (
          <div style={{
            width: '88px', height: '88px',
            borderRadius: '50%',
            background: cfg.iconBg,
            border: `1px solid ${cfg.iconBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '2.5rem',
            boxShadow: `0 0 0 8px ${cfg.iconBg}`,
          }}>
            <StatusIcon size={44} color={cfg.iconColor} />
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {/* Status Badge */}
        {cfg?.badge && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.35rem 1rem',
            background: cfg.badge.bg, color: cfg.badge.text,
            borderRadius: '50px', fontSize: '0.65rem', fontWeight: 700,
            fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: '1.5rem',
          }}>
            {cfg.badge.label}
          </span>
        )}

        {/* Title */}
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 900,
          fontSize: 'clamp(2rem, 6vw, 3rem)',
          color: '#000000',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          marginBottom: '1rem',
          margin: 0,
        }}>
          {cfg.title}
        </h1>

        {/* Description */}
        <p style={{
          color: 'rgba(0,0,0,0.5)',
          fontSize: '0.9rem',
          lineHeight: 1.7,
          maxWidth: '480px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          marginTop: '1.25rem',
          marginBottom: '2.5rem',
        }}>
          {cfg.desc}
        </p>

        {/* Success Details Card */}
        {status === 'success' && orderDetails && (
          <div style={{
            width: '100%',
            background: '#ffffff',
            border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: '16px',
            padding: '1.75rem 2rem',
            textAlign: 'left',
            boxShadow: '0 4px 20px rgba(0,0,0,0.015)',
            marginBottom: '2.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.85rem', marginBottom: '0.85rem' }}>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.1rem', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)' }}>Order Reference</span>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '0.65rem', letterSpacing: '0.1rem', textTransform: 'uppercase', color: '#000000' }}>#{orderDetails._id?.slice(-8).toUpperCase()}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.85rem', marginBottom: '0.85rem' }}>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 750, fontSize: '0.65rem', letterSpacing: '0.1rem', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)' }}>Total Charged</span>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#000', letterSpacing: '0.05em', margin: 0 }}>LKR {formatPrice(orderDetails.totalAmount)}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 750, fontSize: '0.65rem', letterSpacing: '0.1rem', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)' }}>Shipping Target</span>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.8rem', color: '#000' }}>{orderDetails.shippingAddress?.city || 'Colombo'}</span>
            </div>
          </div>
        )}

        {/* Actions Navigation */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {status === 'success' ? (
            <>
              <Link to="/customer/orders" className="btn-primary" style={{ padding: '0.85rem 2rem', borderRadius: '50px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>
                View Orders <ShoppingBag size={14} />
              </Link>
              <Link to="/shop" className="btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '50px', textDecoration: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>
                Return to Shop
              </Link>
            </>
          ) : (
            <>
              <Link to="/checkout" className="btn-primary" style={{ padding: '0.85rem 2rem', borderRadius: '50px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>
                Retry Checkout <RefreshCw size={12} />
              </Link>
              <Link to="/shop" className="btn-secondary" style={{ padding: '0.85rem 2rem', borderRadius: '50px', textDecoration: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>
                Back to Shop
              </Link>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

const labelStyle = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: 700,
  fontSize: '0.65rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'rgba(0,0,0,0.4)',
};
const valStyle = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: 750,
  fontSize: '0.85rem',
  color: '#000000',
  marginTop: '0.25rem',
};
