import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { appointmentAPI } from '../../api';
import { format } from 'date-fns';
import { formatPrice } from '../../utils/format';
import { 
  Calendar, Clock, MapPin, Scissors, X, AlertTriangle, 
  CheckCircle, Loader2, Sparkles, HelpCircle, Star
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function MyBookingsPage() {
  const [searchParams] = useSearchParams();
  const appointmentIdParam = searchParams.get('appointmentId');

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);

  // Review states
  const [reviewingAppointment, setReviewingAppointment] = useState(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewingAppointment) return;
    setSubmittingReview(true);
    try {
      await appointmentAPI.createReview(reviewingAppointment._id, {
        rating: newRating,
        comment: newComment,
      });
      toast.success('Review submitted successfully! Thank you.');
      setReviewingAppointment(null);
      setNewRating(5);
      setNewComment('');
      fetchBookings(activeTab);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const fetchBookings = (statusTab = 'all') => {
    setLoading(true);
    const query = statusTab === 'all' ? {} : { status: statusTab };
    appointmentAPI.getMy(query)
      .then(res => {
        setAppointments(res.data.data.appointments || []);
      })
      .catch(err => {
        console.error('Error fetching bookings:', err);
        toast.error('Failed to load bookings');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings(activeTab);
  }, [activeTab]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancellingId(id);
    try {
      await appointmentAPI.cancel(id);
      toast.success('Appointment cancelled successfully');
      fetchBookings(activeTab);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending:   { bg: '#fffbeb', text: '#d97706', label: 'Pending', icon: HelpCircle },
      confirmed: { bg: '#eff6ff', text: '#2563eb', label: 'Confirmed', icon: CheckCircle },
      completed: { bg: '#f0fdf4', text: '#16a34a', label: 'Completed', icon: CheckCircle },
      cancelled: { bg: '#fef2f2', text: '#dc2626', label: 'Cancelled', icon: AlertTriangle },
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
        <Icon size={12} />
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
            Client Space · Booking History
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
            My<br /><em style={{ fontStyle: 'italic', color: 'rgba(0,0,0,0.45)' }}>Bookings</em>
          </h1>
          <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: '280px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            List of all your current and historic salon appointments.
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
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', background: '#fff' }}>
            <Calendar size={48} color="rgba(0,0,0,0.15)" style={{ marginBottom: '1.25rem', marginLeft: 'auto', marginRight: 'auto' }} />
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', color: '#000000', marginBottom: '0.5rem', fontWeight: 800 }}>No Bookings Found</h3>
            <p style={{ color: 'rgba(0,0,0,0.45)', fontSize: '0.85rem', marginBottom: '2rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>You don't have any appointments in this category.</p>
            <Link to="/saloons" className="btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: '50px', textDecoration: 'none', display: 'inline-block' }}>Book an Appointment</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {appointments.map(apt => {
              const isTarget = apt._id === appointmentIdParam;
              return (
                <div 
                  key={apt._id} 
                  id={`appointment-${apt._id}`}
                  style={{ 
                    border: isTarget ? '2px solid #000000' : '1px solid rgba(0,0,0,0.08)', 
                    padding: '1.75rem', 
                    background: isTarget ? '#fafafa' : '#ffffff', 
                    borderRadius: '16px',
                    boxShadow: isTarget ? '0 8px 30px rgba(0,0,0,0.08)' : '0 4px 20px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s',
                  }}
                  className="hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                  
                  <div style={{ display: 'flex', gap: '1.25rem', flex: 1, minWidth: '280px' }}>
                    <div style={{
                      width: '48px', height: '48px',
                      background: 'rgba(0,0,0,0.02)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      borderRadius: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Scissors size={18} color="rgba(0,0,0,0.6)" />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#000000', margin: 0 }}>{apt.saloon?.name || 'Salon'}</h3>
                      <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.85rem', marginTop: '0.25rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {apt.service?.name} with stylist {apt.barber?.user?.name || 'Stylist'}
                      </p>
                      
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap', fontSize: '0.7rem', color: 'rgba(0,0,0,0.4)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={11} /> {apt.date ? format(new Date(apt.date), 'MMM d, yyyy') : '—'}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={11} /> {apt.startTime} – {apt.endTime}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={11} /> {apt.saloon?.address?.city || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', maxWidth: '380px' }} className="w-full md:w-auto">
                    <div style={{ minWidth: '100px' }}>
                      <p style={{ color: '#000000', fontWeight: 800, fontSize: '1.2rem', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, letterSpacing: '0.02em' }}>LKR {formatPrice(apt.totalAmount)}</p>
                      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#16a34a', marginTop: '0.25rem' }}>{apt.paymentStatus}</p>
                    </div>
                    
                    <div style={{ minWidth: '110px' }}>
                      {getStatusBadge(apt.status)}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {['pending', 'confirmed'].includes(apt.status) && (
                        <button
                          onClick={() => handleCancel(apt._id)}
                          disabled={cancellingId === apt._id}
                          style={{
                            width: '36px', height: '36px',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: '10px',
                            background: '#fef2f2',
                            color: '#dc2626',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s',
                          }}
                          className="hover:bg-red-600 hover:text-white transition-colors"
                          title="Cancel booking"
                        >
                          {cancellingId === apt._id ? <div className="spinner w-3.5 h-3.5" /> : <X size={14} />}
                        </button>
                      )}
                      {apt.status === 'completed' && (
                        apt.isReviewed ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            background: '#f3f4f6', color: '#9ca3af', border: '1px solid rgba(0,0,0,0.06)',
                            padding: '0.45rem 1.25rem', borderRadius: '8px',
                            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.65rem',
                            letterSpacing: '0.05em', textTransform: 'uppercase'
                          }}>
                            <CheckCircle size={10} /> Reviewed
                          </span>
                        ) : (
                          <button 
                            onClick={() => setReviewingAppointment(apt)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                              background: '#000', color: '#fff', border: 'none', cursor: 'pointer',
                              padding: '0.45rem 1rem', borderRadius: '8px',
                              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.65rem',
                              letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'background 0.2s',
                            }} 
                            className="hover:bg-gray-800"
                          >
                            <Star size={10} fill="#fff" /> Review
                          </button>
                        )
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
          </div>
        )}
        {/* Review Modal */}
        {reviewingAppointment && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}>
            <div style={{
              background: '#ffffff', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.08)',
              width: '100%', maxWidth: '480px', padding: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              position: 'relative', textAlign: 'left'
            }}>
              {/* Close Button */}
              <button 
                onClick={() => { setReviewingAppointment(null); setNewRating(5); setNewComment(''); }}
                style={{
                  position: 'absolute', top: '1.5rem', right: '1.5rem',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.3)'
                }}
              >
                <X size={18} />
              </button>

              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#000000', margin: '0 0 0.5rem 0' }}>
                Rate Your Experience
              </h2>
              <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.85rem', marginBottom: '2rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                How was your appointment at <strong>{reviewingAppointment.saloon?.name}</strong> with <strong>{reviewingAppointment.barber?.user?.name || 'Stylist'}</strong>?
              </p>

              <form onSubmit={handleSubmitReview}>
                {/* Stars selector */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', marginBottom: '0.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Choose Rating
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <Star
                          size={32}
                          fill={star <= newRating ? '#fbbf24' : 'none'}
                          color={star <= newRating ? '#fbbf24' : 'rgba(0,0,0,0.18)'}
                          style={{ transition: 'transform 0.1s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment area */}
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', marginBottom: '0.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Review Comments
                  </label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts about the service, stylist's professionalism, cleanliness, etc..."
                    rows={4}
                    style={{
                      width: '100%', padding: '0.85rem', border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: '12px', background: '#ffffff', color: '#000000',
                      fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem',
                      outline: 'none', boxSizing: 'border-box', resize: 'none'
                    }}
                  />
                </div>

                {/* Submits */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => { setReviewingAppointment(null); setNewRating(5); setNewComment(''); }}
                    style={{
                      flex: 1, padding: '0.85rem', background: '#f3f4f6', border: 'none',
                      borderRadius: '50px', cursor: 'pointer', color: '#4b5563',
                      fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.75rem',
                      letterSpacing: '0.05em', textTransform: 'uppercase'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="btn-primary"
                    style={{
                      flex: 1, padding: '0.85rem', borderRadius: '50px',
                      fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '0.75rem',
                      letterSpacing: '0.05em', textTransform: 'uppercase'
                    }}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </DashboardLayout>
  );
}
