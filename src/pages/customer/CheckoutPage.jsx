import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag, MapPin, CreditCard, Truck, Trash2, Plus, Minus,
  Shield, CheckCircle, ArrowRight, Lock, Package
} from 'lucide-react';
import {
  selectCartItems, selectCartTotal, clearCart, removeFromCart, updateQuantity
} from '../../features/cart/cartSlice';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import { paymentAPI } from '../../api';
import Navbar from '../../components/layout/Navbar';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/format';

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (items.length === 0) {
      navigate('/shop');
    }
  }, [isAuthenticated, items.length, navigate]);

  if (!isAuthenticated || items.length === 0) return null;

  // Submit to PayHere payment gateway
  const handlePayHere = async (formData) => {
    setLoading(true);
    try {
      const res = await paymentAPI.initiate({
        items: items.map(i => ({ product: i._id, quantity: i.quantity })),
        shippingAddress: {
          name: formData.name,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: 'Sri Lanka',
          zipCode: formData.zipCode,
        },
        notes: formData.notes || '',
      });

      const { paymentParams, payhereOrderId } = res.data.data;
      dispatch(clearCart());

      // Set up PayHere callbacks
      window.payhere.onCompleted = function (orderIdVal) {
        console.log("Payment completed:", orderIdVal);
        toast.success("Payment completed successfully!");
        navigate(`/payment/return?order_id=${payhereOrderId}`);
      };

      window.payhere.onDismissed = function () {
        console.log("Payment dismissed");
        toast.error("Payment window closed.");
        setLoading(false);
      };

      window.payhere.onError = function (error) {
        console.log("Payment error:", error);
        toast.error("Payment error: " + error);
        setLoading(false);
      };

      // Prepare payment object
      const payment = {
        sandbox: paymentParams.checkout_url.includes('sandbox'),
        merchant_id: paymentParams.merchant_id,
        return_url: paymentParams.return_url,
        cancel_url: paymentParams.cancel_url,
        notify_url: paymentParams.notify_url,
        order_id: paymentParams.order_id,
        items: paymentParams.items,
        amount: paymentParams.amount,
        currency: paymentParams.currency,
        hash: paymentParams.hash,
        first_name: paymentParams.first_name,
        last_name: paymentParams.last_name,
        email: paymentParams.email,
        phone: paymentParams.phone,
        address: paymentParams.address,
        city: paymentParams.city,
        country: paymentParams.country,
      };

      // Launch payment popup
      window.payhere.startPayment(payment);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Payment initiation failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#000000', position: 'relative' }}>
      <Navbar />

      <style>{`
        .clean-input {
          width: 100%;
          padding: 0.85rem 1.1rem;
          background: #ffffff !important;
          color: #000000 !important;
          border: 1px solid rgba(0,0,0,0.1) !important;
          borderRadius: 12px !important;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.85rem;
          outline: none !important;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        .clean-input:focus {
          border-color: #000000 !important;
          box-shadow: 0 0 0 4px rgba(0,0,0,0.04);
          background: #fafafa !important;
        }
        .clean-input::placeholder {
          color: rgba(0, 0, 0, 0.3) !important;
        }
        .summary-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .summary-scroll::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.01);
        }
        .summary-scroll::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 4px;
        }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 2rem 6rem', position: 'relative', zIndex: 1 }}>

        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '24px', height: '1px', background: 'rgba(0,0,0,0.15)' }} />
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)' }}>
            Secure Checkout
          </span>
        </div>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '3.5rem' }}>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
            color: '#000000',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            margin: 0,
          }}>
            Billing &<br /><em style={{ fontStyle: 'italic', color: 'rgba(0,0,0,0.45)' }}>Payment</em>
          </h1>
          <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: '280px', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Enter your shipping info and complete your purchase securely via PayHere.
          </p>
        </div>

        <form onSubmit={handleSubmit(handlePayHere)}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Left: Input Fields */}
            <div className="col-span-12 lg:col-span-7 flex flex-col gap-8">

              {/* Shipping Details */}
              <div className="border border-black/10 p-5 sm:p-8 md:p-10 rounded-3xl bg-white shadow-sm">
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800, fontSize: '1.4rem', color: '#000000',
                  display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem',
                }}>
                  <MapPin size={18} color="rgba(0,0,0,0.5)" /> Shipping Address
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="sm:col-span-2">
                    <label style={labelStyle}>Full Name</label>
                    <input {...register('name', { required: 'Name is required' })} className="clean-input" placeholder="John Silva" />
                    {errors.name && <p style={errStyle}>{errors.name.message}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input {...register('phone', { required: 'Phone is required' })} className="clean-input" placeholder="+94 77 123 4567" />
                    {errors.phone && <p style={errStyle}>{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>ZIP Code</label>
                    <input {...register('zipCode')} className="clean-input" placeholder="00100" />
                  </div>
                  <div className="sm:col-span-2">
                    <label style={labelStyle}>Street Address</label>
                    <input {...register('street', { required: 'Address is required' })} className="clean-input" placeholder="45 Galle Road" />
                    {errors.street && <p style={errStyle}>{errors.street.message}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>City</label>
                    <input {...register('city', { required: 'City is required' })} className="clean-input" placeholder="Colombo" />
                    {errors.city && <p style={errStyle}>{errors.city.message}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Province / State</label>
                    <input {...register('state')} className="clean-input" placeholder="Western" />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="border border-black/10 p-5 sm:p-8 md:p-10 rounded-3xl bg-white shadow-sm">
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800, fontSize: '1.4rem', color: '#000000',
                  display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem',
                }}>
                  <CreditCard size={18} color="rgba(0,0,0,0.5)" /> Payment Gateway
                </h2>

                {/* PayHere Active Card */}
                <div style={{
                  padding: '1.5rem',
                  border: '1.5px solid #000000',
                  background: 'rgba(0,0,0,0.01)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      border: '2px solid #000000',
                      background: '#000000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff' }} />
                    </div>
                    <div>
                      <p style={{ color: '#000000', fontWeight: 800, fontSize: '0.95rem', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        PayHere Secure Checkout
                      </p>
                      <p style={{ color: 'rgba(0,0,0,0.45)', fontSize: '0.72rem', marginTop: '2px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                        Cards · Internet Banking · eZcash · mCash
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f0fdf4', padding: '0.3rem 0.75rem', border: '1px solid #dcfce7', borderRadius: '50px' }}>
                    <Lock size={12} color="#16a34a" />
                    <span style={{ color: '#16a34a', fontSize: '0.6rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, letterSpacing: '0.04em' }}>SECURED</span>
                  </div>
                </div>

                <div style={{
                  padding: '1.25rem',
                  background: 'rgba(0,0,0,0.015)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'start',
                  gap: '0.75rem',
                }}>
                  <Shield size={16} color="rgba(0,0,0,0.4)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.75rem', lineHeight: 1.6, margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    After clicking complete, you will be securely redirected to PayHere payment gateway. Your billing credentials are fully encrypted and never stored.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Summary panel */}
            <div className="col-span-12 lg:col-span-5">
              <div style={{ 
                border: '1px solid rgba(0,0,0,0.06)', 
                padding: '2.5rem 2.25rem', 
                position: 'sticky', 
                top: '110px',
                background: '#ffffff',
                borderRadius: '20px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.02)',
              }}>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800, fontSize: '1.4rem', color: '#000000',
                  display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem',
                }}>
                  <ShoppingBag size={18} color="rgba(0,0,0,0.5)" /> Order Summary
                </h2>

                {/* Items List (Includes Tiny Thumbnails) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '280px', overflowY: 'auto', marginBottom: '2rem', paddingRight: '0.5rem' }} className="summary-scroll">
                  {items.map(item => (
                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', minWidth: 0 }}>
                        <div style={{
                          width: '42px', height: '42px',
                          background: '#f9f9f9',
                          border: '1px solid rgba(0,0,0,0.06)',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {item.images?.[0] ? (
                            <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Package size={16} color="rgba(0,0,0,0.3)" />
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <span style={{ color: '#000000', fontSize: '0.85rem', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                            <button
                              type="button"
                              onClick={() => item.quantity <= 1 ? dispatch(removeFromCart(item._id)) : dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }))}
                              style={{ width: '22px', height: '22px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.08)', color: '#000000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                            ><Minus size={8} /></button>
                            <span style={{ color: '#000000', fontSize: '0.8rem', width: '16px', textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 750 }}>{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }))}
                              style={{ width: '22px', height: '22px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.08)', color: '#000000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                            ><Plus size={8} /></button>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                        <span style={{ color: '#000000', fontSize: '0.88rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>LKR {formatPrice((item.salePrice || item.price) * item.quantity)}</span>
                        <button
                          type="button"
                          onClick={() => dispatch(removeFromCart(item._id))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', color: 'rgba(0,0,0,0.2)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                          onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                          onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,0,0,0.2)'}
                        ><Trash2 size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotals & totals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '2rem', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    <span style={{ color: 'rgba(0,0,0,0.45)' }}>Subtotal</span>
                    <span style={{ color: '#000000', fontWeight: 700 }}>LKR {formatPrice(total)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    <span style={{ color: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Truck size={12} /> Delivery</span>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>FREE</span>
                  </div>
                  <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '0.25rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    <span style={{ color: '#000000', letterSpacing: '0.04em' }}>TOTAL</span>
                    <span style={{ color: '#000000', fontSize: '1.3rem' }}>LKR {formatPrice(total)}</span>
                  </div>
                </div>

                {/* Checkout Trigger button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '1rem',
                    background: loading 
                      ? 'rgba(0,0,0,0.05)' 
                      : '#ea580c',
                    color: '#ffffff',
                    border: 'none', 
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800, 
                    fontSize: '0.85rem', 
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase', 
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.625rem',
                    borderRadius: '50px',
                    height: '52px',
                    boxShadow: 'none',
                  }}
                  onMouseEnter={e => { 
                    if(!loading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.background = '#c2410c';
                    }
                  }}
                  onMouseLeave={e => { 
                    if(!loading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.background = '#ea580c';
                    }
                  }}
                >
                  {loading ? (
                    'Processing...'
                  ) : (
                    <><Lock size={14} /> Pay Securely · LKR {formatPrice(total)}</>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <p style={{ color: 'rgba(0,0,0,0.35)', fontSize: '0.625rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
                    🔒 Secured by PayHere · Central Bank Approved
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '0.68rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'rgba(0,0,0,0.45)',
  marginBottom: '0.5rem',
};
const errStyle = { color: '#dc2626', fontSize: '0.72rem', marginTop: '6px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 };
