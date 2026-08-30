import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { orderAPI } from '../../api';
import { format } from 'date-fns';
import { formatPrice } from '../../utils/format';
import { 
  ShoppingBag, Package, MapPin, Truck, AlertTriangle, 
  CheckCircle, Loader2, Sparkles, HelpCircle, CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchOrders = (statusTab = 'all') => {
    setLoading(true);
    const query = statusTab === 'all' ? {} : { status: statusTab };
    orderAPI.getMy(query)
      .then(res => {
        setOrders(res.data.data.orders || []);
      })
      .catch(err => {
        console.error('Error fetching orders:', err);
        toast.error('Failed to load orders');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  const getStatusBadge = (status) => {
    const configs = {
      pending:    { bg: '#fffbeb', text: '#d97706', label: 'Pending', icon: HelpCircle },
      processing: { bg: '#eff6ff', text: '#2563eb', label: 'Processing', icon: Loader2 },
      shipped:    { bg: '#fdf4ff', text: '#9333ea', label: 'Shipped', icon: Truck },
      delivered:  { bg: '#f0fdf4', text: '#16a34a', label: 'Delivered', icon: CheckCircle },
      cancelled:  { bg: '#fef2f2', text: '#dc2626', label: 'Cancelled', icon: AlertTriangle },
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.35rem 0.85rem',
        background: config.bg,
        color: config.text,
        border: `1px solid ${config.text}22`,
        borderRadius: '50px',
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        textTransform: 'uppercase'
      }}>
        <Icon size={12} className={status === 'processing' ? 'animate-spin' : ''} />
        {config.label}
      </span>
    );
  };

  return (
    <DashboardLayout>
        
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ width: '24px', height: '1px', background: 'rgba(0,0,0,0.15)' }} />
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)' }}>
            Client Space · Product Orders
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '3rem' }}>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            color: '#000000',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            margin: 0,
          }}>
            My<br /><em style={{ fontStyle: 'italic', color: 'rgba(0,0,0,0.45)' }}>Orders</em>
          </h1>
          <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: '280px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            List of all your active physical orders and tracking info.
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {STATUS_TABS.map(tab => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.4rem 1.25rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  border: '1px solid',
                  borderColor: active ? '#000000' : 'rgba(0,0,0,0.08)',
                  background: active ? '#000000' : 'transparent',
                  color: active ? '#ffffff' : 'rgba(0,0,0,0.45)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  borderRadius: '50px',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 0' }}>
            <div className="spinner" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000' }} />
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', background: '#fff' }}>
            <ShoppingBag size={48} color="rgba(0,0,0,0.15)" style={{ marginBottom: '1.25rem', marginLeft: 'auto', marginRight: 'auto' }} />
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', color: '#000000', marginBottom: '0.5rem', fontWeight: 800 }}>No Orders Found</h3>
            <p style={{ color: 'rgba(0,0,0,0.45)', fontSize: '0.85rem', marginBottom: '2rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>You don't have any product purchases in this category.</p>
            <Link to="/shop" className="btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: '50px', textDecoration: 'none', display: 'inline-block' }}>Visit Shop</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {orders.map(order => (
              <div 
                key={order._id} 
                style={{ 
                  border: '1px solid rgba(0,0,0,0.07)', 
                  padding: '2.5rem', 
                  background: '#ffffff', 
                  borderRadius: '20px',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.02)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.15rem', color: '#000000', margin: 0 }}>
                      Order #{order._id.slice(-6).toUpperCase()}
                    </h3>
                    <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.75rem', marginTop: '0.25rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Placed on {order.createdAt ? format(new Date(order.createdAt), 'MMMM d, yyyy') : '—'}
                    </p>
                  </div>
                  <div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {order.items?.map((item, idx) => {
                    const prodId = item.product?._id || item.product;
                    return (
                      <Link 
                        to={`/shop/${prodId}`}
                        key={idx} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          fontSize: '0.9rem', 
                          gap: '1.5rem',
                          border: '1px solid rgba(0,0,0,0.05)',
                          borderRadius: '16px',
                          padding: '1.25rem',
                          background: '#fafafa',
                          textDecoration: 'none',
                          color: 'inherit',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#f4f4f4';
                          e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#fafafa';
                          e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', minWidth: 0 }}>
                          <div style={{ 
                            width: '130px', 
                            height: '130px', 
                            background: '#ffffff', 
                            border: '1px solid rgba(0,0,0,0.07)', 
                            borderRadius: '14px', 
                            overflow: 'hidden', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {item.product?.images?.[0] ? (
                              <img src={item.product.images[0]} alt={item.product?.name || item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <Package size={38} color="rgba(0,0,0,0.2)" />
                            )}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ color: '#000000', fontWeight: 900, margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.05rem', lineHeight: '1.4' }}>{item.product?.name || item.name || 'Grooming Product'}</p>
                            <p style={{ color: 'rgba(0,0,0,0.45)', fontSize: '0.82rem', margin: '0.45rem 0 0 0', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>Qty: {item.quantity} · LKR {formatPrice(item.price)}</p>
                            <span style={{ 
                              display: 'inline-block',
                              marginTop: '0.75rem',
                              fontSize: '0.68rem',
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              color: '#ea580c',
                            }}>View Details →</span>
                          </div>
                        </div>
                        <span style={{ fontWeight: 900, color: '#000000', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.1rem', flexShrink: 0, paddingRight: '0.5rem' }}>LKR {formatPrice(item.price * item.quantity)}</span>
                      </Link>
                    );
                  })}
                </div>

                <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: '1.25rem', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.72rem', color: 'rgba(0,0,0,0.4)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={11} /> {order.shippingAddress?.city || '—'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CreditCard size={11} /> {order.paymentMethod || 'PayHere'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>TOTAL AMOUNT:</span>
                    <p style={{ color: '#000000', fontWeight: 900, fontSize: '1.25rem', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, letterSpacing: '0.02em' }}>LKR {formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </DashboardLayout>
  );
}
