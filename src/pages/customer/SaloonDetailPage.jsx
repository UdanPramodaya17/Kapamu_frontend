import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Star, Clock, Scissors, Calendar, Check, ArrowLeft,
  ChevronLeft, ChevronRight, Image as ImageIcon, ArrowDown
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import CartDrawer from '../../components/shop/CartDrawer';
import SlotPicker from '../../components/booking/SlotPicker';
import { saloonAPI, barberAPI, appointmentAPI, authAPI } from '../../api';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser, selectAccessToken, setCredentials } from '../../features/auth/authSlice';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/format';

export default function SaloonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectAccessToken);

  const [saloon, setSaloon] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Booking state
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [isAnyStylistSelected, setIsAnyStylistSelected] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsReason, setSlotsReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Phone verification state
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneSubmitting, setPhoneSubmitting] = useState(false);

  // Lightbox state
  const [activeLightboxBarber, setActiveLightboxBarber] = useState(null);
  const [lightboxActiveIndex, setLightboxActiveIndex] = useState(0);

  // Hero Cover Carousel state
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [saloonRes, barbersRes, servicesRes] = await Promise.all([
          saloonAPI.getById(id),
          saloonAPI.getBarbers(id),
          saloonAPI.getServices(id),
        ]);
        setSaloon(saloonRes.data.data.saloon);
        setBarbers(barbersRes.data.data.barbers || []);
        setServices(servicesRes.data.data.services || []);
      } catch (err) {
        console.error('Error fetching saloon details:', err);
        setSaloon(null);
        setBarbers([]);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await saloonAPI.getReviews(id);
        setReviews(res.data.data.reviews || []);
      } catch (err) {
        console.error('Error fetching saloon reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchAll();
    fetchReviews();
  }, [id]);

  // Restore pending booking if returning from login
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('kapamu_pending_booking');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.saloonId === id) {
          if (parsed.service) setSelectedService(parsed.service);
          if (parsed.barber) setSelectedBarber(parsed.barber);
          if (typeof parsed.isAnyStylistSelected === 'boolean') setIsAnyStylistSelected(parsed.isAnyStylistSelected);
          if (parsed.date) setSelectedDate(parsed.date);
          if (parsed.slot) setSelectedSlot(parsed.slot);
          sessionStorage.removeItem('kapamu_pending_booking');
        }
      }
    } catch (e) {
      console.warn('Failed to restore pending booking', e);
    }
  }, [id]);

  useEffect(() => {
    if (!selectedService || !selectedDate) return;
    if (!isAnyStylistSelected && !selectedBarber) return;

    setSlotsLoading(true);
    setSlotsReason('');
    setSelectedSlot(null);

    const barberParam = isAnyStylistSelected ? 'any' : selectedBarber?._id;

    appointmentAPI.getSlots({
      saloonId: id,
      barberId: barberParam,
      serviceId: selectedService._id,
      date: selectedDate,
    })
      .then(res => {
        const data = res.data.data;
        setSlots(data.slots || []);
        if (data.reason) setSlotsReason(data.reason);
      })
      .catch((err) => {
        setSlots([]);
        setSlotsReason(err.response?.data?.message || 'Failed to load slots');
      })
      .finally(() => setSlotsLoading(false));
  }, [selectedService, selectedBarber, isAnyStylistSelected, selectedDate, id]);

  const executeBooking = async () => {
    setBookingLoading(true);
    try {
      const barberParam = isAnyStylistSelected ? 'any' : selectedBarber._id;
      const res = await appointmentAPI.create({
        saloon: id,
        barber: barberParam,
        service: selectedService._id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
      });
      const assignedBarberName = res.data.data?.appointment?.barber?.user?.name;
      toast.success(
        assignedBarberName
          ? `Booked with ${assignedBarberName}! 🎉`
          : 'Appointment booked successfully! 🎉'
      );
      navigate('/customer/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleGuestAuthRedirect = (targetPath = '/login') => {
    const pendingBooking = {
      saloonId: id,
      service: selectedService,
      barber: selectedBarber,
      isAnyStylistSelected,
      date: selectedDate,
      slot: selectedSlot,
    };
    try {
      sessionStorage.setItem('kapamu_pending_booking', JSON.stringify(pendingBooking));
    } catch (e) {
      console.warn('Could not save pending booking', e);
    }
    navigate(`${targetPath}?redirect=${encodeURIComponent(window.location.pathname)}`);
  };

  const handleBook = async () => {
    if (!isAuthenticated) {
      handleGuestAuthRedirect('/login');
      return;
    }
    if (!selectedService || (!isAnyStylistSelected && !selectedBarber) || !selectedSlot) {
      toast.error('Please complete all selections');
      return;
    }

    if (!user?.phone) {
      setIsPhoneModalOpen(true);
      return;
    }

    await executeBooking();
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!phoneInput || !/^(?:\+94|94|0)7\d{8}$/.test(phoneInput)) {
      toast.error('Please enter a valid Sri Lankan mobile number (e.g. 0771234567)');
      return;
    }
    setPhoneSubmitting(true);
    try {
      const res = await authAPI.updateProfile({ name: user.name, phone: phoneInput });
      if (res.data.success) {
        const updatedUser = res.data.data.user;
        dispatch(setCredentials({ user: updatedUser, accessToken: token }));
        toast.success('Phone number saved successfully!');
        setIsPhoneModalOpen(false);
        await executeBooking();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update phone number');
    } finally {
      setPhoneSubmitting(false);
    }
  };

  const allImages = [];
  if (saloon?.coverImage && typeof saloon.coverImage === 'string' && saloon.coverImage.trim() !== "") {
    const cleanCover = saloon.coverImage.trim();
    if (cleanCover.toLowerCase() !== "undefined" && cleanCover.toLowerCase() !== "null" && (cleanCover.startsWith("http") || cleanCover.startsWith("/"))) {
      allImages.push(cleanCover);
    }
  }
  if (saloon?.images && saloon.images.length > 0) {
    saloon.images.forEach(img => {
      if (img && typeof img === 'string') {
        const cleanImg = img.trim();
        if (cleanImg.toLowerCase() !== "undefined" && cleanImg.toLowerCase() !== "null" && (cleanImg.startsWith("http") || cleanImg.startsWith("/")) && !allImages.includes(cleanImg)) {
          allImages.push(cleanImg);
        }
      }
    });
  }

  const fallbackSalonImages = [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80"
  ];
  const displayImages = allImages.length > 0 ? allImages.slice(0, 5) : fallbackSalonImages;

  // Auto-carousel timer: changes slide every 4 seconds
  useEffect(() => {
    if (!displayImages || displayImages.length <= 1 || isHeroPaused) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide(prev => (prev + 1) % displayImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [displayImages.length, isHeroPaused]);

  // Keep current slide within bounds
  useEffect(() => {
    if (currentHeroSlide >= displayImages.length) {
      setCurrentHeroSlide(0);
    }
  }, [displayImages.length, currentHeroSlide]);

  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i);
    return { value: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE'), date: format(d, 'd') };
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000' }} />
      </div>
    );
  }

  const displayBarbers = (barbers || []).map((b) => {
    // Filter out empty, broken, "undefined", or "null" values from portfolioImages
    const validDbImages = (b.portfolioImages || []).filter(img => {
      if (!img || typeof img !== 'string') return false;
      const clean = img.trim().toLowerCase();
      if (clean === "" || clean === "undefined" || clean === "null" || clean === "[object object]") return false;
      return clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("/") || clean.startsWith("data:image");
    });
    
    return { ...b, portfolioImages: validDbImages };
  });

  const renderBookingSidebar = () => {
    return (
      <div className="bg-white border border-black/10 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm overflow-hidden text-left">
        {!selectedService ? (
          // State A: Empty booking setup placeholder
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{
              width: '60px', height: '60px',
              borderRadius: '50%',
              background: '#f9f9f9',
              display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center',
              marginBottom: '1.25rem',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <Calendar size={22} color="rgba(0,0,0,0.3)" />
            </div>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.4rem', color: '#000000', margin: '0 0 0.5rem 0' }}>
              Select Service
            </h3>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(0,0,0,0.45)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
              Pick a service from the menu list on the left to start scheduling your appointment slots.
            </p>
          </div>
        ) : (
          // State B: Premium Stepper Booking Form
          <div>

            {/* ── EXPANDED FULL-BLEED LUXURY BLACK HEADER (Taller & More Spacious) ── */}
            <div className="-mt-4 -mx-4 mb-5 sm:-mt-6 sm:-mx-6 sm:mb-6 md:-mt-8 md:-mx-8 md:mb-7 p-6 sm:p-8 md:p-9 min-h-[160px] sm:min-h-[185px] md:min-h-[200px] flex flex-col justify-between bg-gradient-to-br from-black via-zinc-950 to-neutral-900 text-white relative overflow-hidden border-b border-white/10">
              {/* decorative ambient glow & circular rings */}
              <div style={{
                position: 'absolute', top: '-60px', right: '-60px',
                width: '200px', height: '200px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.09) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', bottom: '-40px', left: '-40px',
                width: '140px', height: '140px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10 my-auto">
                <div className="min-w-0 flex-1">
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(255,255,255,0.12)', padding: '0.3rem 0.75rem', borderRadius: '100px', marginBottom: '0.65rem', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.65rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Selected Service</p>
                  </div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 'clamp(1.35rem, 5vw, 1.75rem)', color: '#ffffff', margin: '0 0 0.55rem', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
                    {selectedService.name}
                  </h3>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.09)', padding: '0.35rem 0.85rem', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Clock size={14} color="#ffffff" />
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.78rem', color: '#ffffff', margin: 0, fontWeight: 600 }}>
                      {selectedService.duration} min session
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10 gap-2">
                  <div className="sm:text-right">
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 0.2rem' }}>Total</p>
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 'clamp(1.4rem, 5vw, 1.85rem)', color: '#ffffff', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>
                      LKR {formatPrice(selectedService.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedService(null); setSelectedBarber(null);
                      setIsAnyStylistSelected(true); setSelectedSlot(null);
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.35)',
                      color: '#ffffff', fontSize: '0.75rem',
                      fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
                      cursor: 'pointer', borderRadius: '10px', padding: '0.45rem 1.1rem',
                      transition: 'all 0.2s ease',
                    }}
                    className="sm:mt-2.5 hover:scale-105 active:scale-95"
                    onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#000000'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = '#ffffff'; }}
                  >Change</button>
                </div>
              </div>
            </div>

            {/* ── STEP 1: STYLIST ── */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: '#000000', color: '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6rem', fontWeight: 800, flexShrink: 0,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>1</div>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.72rem', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Choose Stylist</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {/* Any Stylist chip */}
                <button
                  onClick={() => { setSelectedBarber(null); setIsAnyStylistSelected(true); setSelectedSlot(null); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.45rem 0.85rem', borderRadius: '100px',
                    border: isAnyStylistSelected ? '1.5px solid #000000' : '1px solid rgba(0,0,0,0.12)',
                    background: isAnyStylistSelected ? '#000000' : '#ffffff',
                    color: isAnyStylistSelected ? '#ffffff' : '#000000',
                    fontSize: '0.75rem', fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: isAnyStylistSelected ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                  }}
                >
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: isAnyStylistSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.55rem',
                  }}>✦</div>
                  Any Stylist
                </button>

                {displayBarbers.map(b => {
                  const isSel = !isAnyStylistSelected && selectedBarber?._id === b._id;
                  const initials = b.user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
                  return (
                    <button
                      key={b._id}
                      onClick={() => { setSelectedBarber(b); setIsAnyStylistSelected(false); setSelectedSlot(null); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.4rem 0.85rem 0.4rem 0.4rem', borderRadius: '100px',
                        border: isSel ? '1.5px solid #000000' : '1px solid rgba(0,0,0,0.12)',
                        background: isSel ? '#000000' : '#ffffff',
                        color: isSel ? '#ffffff' : '#000000',
                        fontSize: '0.75rem', fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                        boxShadow: isSel ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                      }}
                    >
                      {/* Avatar circle */}
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                        background: isSel ? 'rgba(255,255,255,0.2)' : '#f0f0f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.55rem', fontWeight: 800,
                        color: isSel ? '#ffffff' : '#000000',
                      }}>
                        {(b.avatar || b.user?.avatar)
                          ? <img src={b.avatar || b.user.avatar} alt={b.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : initials}
                      </div>
                      {b.user?.name?.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── STEP 2: DATE ── */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: '#000000', color: '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6rem', fontWeight: 800, flexShrink: 0,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>2</div>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.72rem', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pick a Date</span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }} className="hide-scrollbar">
                {dateOptions.map(d => {
                  const isSel = selectedDate === d.value;
                  return (
                    <button
                      key={d.value}
                      onClick={() => { setSelectedDate(d.value); setSelectedSlot(null); }}
                      style={{
                        flexShrink: 0, minWidth: '54px',
                        padding: '0.65rem 0.5rem',
                        border: isSel ? '1.5px solid #000000' : '1px solid rgba(0,0,0,0.1)',
                        background: isSel ? '#000000' : '#ffffff',
                        color: isSel ? '#ffffff' : '#000000',
                        textAlign: 'center', cursor: 'pointer',
                        transition: 'all 0.15s', borderRadius: '12px',
                        boxShadow: isSel ? '0 4px 12px rgba(0,0,0,0.18)' : 'none',
                        transform: isSel ? 'translateY(-1px)' : 'none',
                      }}
                    >
                      <p style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.52rem', textTransform: 'uppercase', opacity: isSel ? 0.6 : 0.35, letterSpacing: '0.05em' }}>{d.label}</p>
                      <p style={{ margin: '0.2rem 0 0', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.1rem', lineHeight: 1 }}>{d.date}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── STEP 3: TIME ── */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: '#000000', color: '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6rem', fontWeight: 800, flexShrink: 0,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>3</div>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.72rem', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Select Time</span>
              </div>
              {!isAnyStylistSelected && !selectedBarber ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '1rem', borderRadius: '10px',
                  background: 'rgba(0,0,0,0.02)', border: '1px dashed rgba(0,0,0,0.1)',
                }}>
                  <span style={{ fontSize: '1rem' }}>👆</span>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.78rem', color: 'rgba(0,0,0,0.4)', fontWeight: 500 }}>Select a stylist above to see available times</span>
                </div>
              ) : (
                <SlotPicker
                  slots={slots}
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                  loading={slotsLoading}
                  reason={slotsReason}
                />
              )}
            </div>

            {/* ── BOOKING CONFIRM ── */}
            {selectedSlot && (
              <div style={{
                background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '14px', padding: '1.1rem',
                marginTop: '0.5rem',
              }}>
                {/* Summary rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1.1rem' }}>
                  {[
                    { label: 'Service', value: selectedService.name },
                    { label: 'Stylist', value: isAnyStylistSelected ? 'Any Stylist' : (selectedBarber?.user?.name || 'Any Stylist') },
                    { label: 'Date & Time', value: `${format(new Date(selectedDate + 'T00:00:00'), 'EEE, MMM d')} · ${selectedSlot.startTime}` },
                    { label: 'Duration', value: `${selectedService.duration} min` },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)', fontWeight: 500 }}>{row.label}</span>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.78rem', color: '#000000', fontWeight: 700 }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '0.1rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8rem', color: '#000000', fontWeight: 700 }}>Total</span>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', color: '#000000', fontWeight: 800 }}>LKR {formatPrice(selectedService.price)}</span>
                  </div>
                </div>

                {!isAuthenticated ? (
                  <div style={{
                    background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    color: '#ffffff',
                    marginTop: '0.75rem',
                    textAlign: 'center',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'rgba(255,255,255,0.15)', marginBottom: '0.5rem',
                    }}>
                      <span style={{ fontSize: '0.9rem' }}>🔒</span>
                    </div>
                    <h4 style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 800, fontSize: '0.95rem', margin: '0 0 0.35rem 0',
                      color: '#ffffff',
                    }}>
                      Sign in to Confirm Booking
                    </h4>
                    <p style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)',
                      margin: '0 0 1rem 0', lineHeight: 1.5,
                    }}>
                      Please sign in or create a free account to secure your appointment slot at <strong>{saloon?.name || 'this salon'}</strong>.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleGuestAuthRedirect('/login')}
                        style={{
                          width: '100%', padding: '0.75rem',
                          background: '#ffffff', color: '#000000',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.04em',
                          borderRadius: '8px', border: 'none',
                          cursor: 'pointer', transition: 'transform 0.15s, opacity 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        Log In & Continue
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGuestAuthRedirect('/register')}
                        style={{
                          width: '100%', padding: '0.7rem',
                          background: 'transparent', color: '#ffffff',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 600, fontSize: '0.75rem',
                          borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        New User? Create Account
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleBook}
                    disabled={bookingLoading}
                    style={{
                      width: '100%', padding: '0.9rem',
                      background: bookingLoading ? 'rgba(0,0,0,0.5)' : '#000000',
                      color: '#ffffff', border: 'none',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.04em',
                      borderRadius: '10px', cursor: bookingLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    }}
                    onMouseEnter={e => { if (!bookingLoading) e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    {bookingLoading
                      ? <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Booking...</>
                      : <>✓ Confirm Booking · LKR {formatPrice(selectedService.price)}</>}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f6f6f9', color: '#000000', position: 'relative' }}>
      <Navbar />
      <CartDrawer />

      {/* Background grid texture */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      {/* Main container wrapper */}
      <div style={{ position: 'relative', zIndex: 1, paddingTop: '80px', maxWidth: '1440px', margin: '0 auto', paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '6rem' }}>
        
        {/* Breadcrumb / Back Link */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
          <Link to="/saloons" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            color: 'rgba(0,0,0,0.5)', textDecoration: 'none',
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600,
            fontSize: '0.8rem', transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#000000'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,0,0,0.5)'}
          >
            <ArrowLeft size={14} /> Back to all salons
          </Link>
        </div>

        {/* ─── AUTO-NAVIGATING HERO COVER SLIDER (Max 5 Photos) ─── */}
        <div 
          style={{ 
            marginBottom: '2.5rem',
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 12px 36px rgba(0,0,0,0.06)',
            background: '#0a0a0a',
          }}
          onMouseEnter={() => setIsHeroPaused(true)}
          onMouseLeave={() => setIsHeroPaused(false)}
        >
          {/* Main Slide Aspect Box */}
          <div style={{ position: 'relative', width: '100%', height: 'clamp(280px, 44vh, 460px)', overflow: 'hidden' }}>
            {displayImages.map((imgUrl, idx) => {
              const isActive = idx === currentHeroSlide;
              return (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'scale(1)' : 'scale(1.04)',
                    transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s ease',
                    pointerEvents: isActive ? 'auto' : 'none',
                  }}
                >
                  <img
                    src={imgUrl}
                    alt={`${saloon?.name || 'Saloon'} cover ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                  />
                  {/* Subtle bottom gradient for readability */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 40%)',
                    pointerEvents: 'none',
                  }} />
                </div>
              );
            })}

            {/* Previous (<) & Next (>) Arrow Controls */}
            {displayImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentHeroSlide(prev => (prev === 0 ? displayImages.length - 1 : prev - 1));
                  }}
                  aria-label="Previous image"
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                    transition: 'all 0.2s ease',
                    zIndex: 10,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                >
                  <ChevronLeft size={20} strokeWidth={2.5} />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentHeroSlide(prev => (prev + 1) % displayImages.length);
                  }}
                  aria-label="Next image"
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                    transition: 'all 0.2s ease',
                    zIndex: 10,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                >
                  <ChevronRight size={20} strokeWidth={2.5} />
                </button>
              </>
            )}

            {/* Bottom Pagination Dots & Slide Counter */}
            {displayImages.length > 1 && (
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                left: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                zIndex: 10,
                pointerEvents: 'none',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(0,0,0,0.45)',
                  backdropFilter: 'blur(8px)',
                  padding: '6px 12px',
                  borderRadius: '30px',
                  pointerEvents: 'auto',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}>
                  {displayImages.map((_, idx) => {
                    const isActive = idx === currentHeroSlide;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentHeroSlide(idx)}
                        style={{
                          width: isActive ? '24px' : '7px',
                          height: '7px',
                          borderRadius: '10px',
                          background: isActive ? '#ffffff' : 'rgba(255,255,255,0.4)',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    );
                  })}
                </div>

                {/* Counter Badge */}
                <div style={{
                  position: 'absolute',
                  right: '1.25rem',
                  background: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  letterSpacing: '0.04em',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}>
                  {currentHeroSlide + 1} / {displayImages.length}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── SALON GENERAL HEADER INFO ─── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '2.5rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              {saloon?.isVerified && (
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '0.65rem',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  padding: '0.25rem 0.6rem',
                  border: '1px solid rgba(0,0,0,0.1)',
                  background: '#f9f9f9',
                  color: '#000000',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}>
                  <Check size={10} strokeWidth={3} /> Verified Business
                </span>
              )}
            </div>
            
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              color: '#000000',
              letterSpacing: '-0.02em',
              lineHeight: '1.1',
              margin: '0 0 1rem 0',
            }}>
              {saloon?.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Star size={14} fill="#fbbf24" color="#fbbf24" />
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: '#000000' }}>{saloon?.rating > 0 ? saloon.rating.toFixed(1) : '0.0'}</span>
                <span style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.85rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>({saloon?.totalReviews || 0} reviews)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'rgba(0,0,0,0.5)', fontSize: '0.85rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <MapPin size={14} />
                  <span>{saloon?.address?.street ? `${saloon.address.street}, ` : ''}{saloon?.address?.city || 'Colombo'}</span>
                </div>
                {(() => {
                  const googleMapsUrl = saloon?.location?.coordinates && saloon.location.coordinates[0] !== 0
                    ? `https://www.google.com/maps/dir/?api=1&destination=${saloon.location.coordinates[1]},${saloon.location.coordinates[0]}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${saloon?.name || ''} ${saloon?.address?.street || ''} ${saloon?.address?.city || ''}`)}`;

                  return (
                    <a 
                      href={googleMapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        background: '#000000',
                        color: '#ffffff',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '30px',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      className="hover:scale-105 active:scale-95 shadow-sm"
                    >
                      <MapPin size={10} fill="currentColor" color="none" />
                      Directions
                    </a>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* ─── TWO COLUMN DETAILS GRID ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* ─── LEFT COLUMN: INFO & SERVICES (8 COLS) ─── */}
          <div className="col-span-12 lg:col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
            
            {/* About Block */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '2.5rem',
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              textAlign: 'left'
            }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.75rem', color: '#000000', marginBottom: '1rem', marginTop: 0 }}>
                About Salon
              </h2>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(0,0,0,0.6)', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: '680px', margin: 0 }}>
                {saloon?.description || 'Experience first-class grooming options tailored for modern styles. Our expert team uses global products to craft elegant designs.'}
              </p>
            </div>

            {/* Services List / Menu */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '2.5rem',
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              textAlign: 'left'
            }}>
              <div style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '1rem', marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '2rem', color: '#000000', margin: 0 }}>
                  Services Menu
                </h2>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(0,0,0,0.4)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Choose from our premium range of grooming options.
                </p>
              </div>

              {services.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: 'rgba(0,0,0,0.4)', fontSize: '0.9rem' }}>No services listed for this salon.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {services.map(svc => {
                    const isSelected = selectedService?._id === svc._id;
                    return (
                      <div 
                        key={svc._id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1.5rem',
                          borderRadius: '12px',
                          border: isSelected ? '1px solid #000000' : '1px solid rgba(0,0,0,0.06)',
                          background: isSelected ? 'rgba(0,0,0,0.01)' : '#ffffff',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 8px 20px rgba(0,0,0,0.02)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'left', flex: 1, paddingRight: '1.5rem' }}>
                          <h3 style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 700,
                            fontSize: '1rem',
                            color: '#000000',
                            margin: 0
                          }}>{svc.name}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'rgba(0,0,0,0.45)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={12} /> {svc.duration || 30} min
                            </span>
                            <span>·</span>
                            <span style={{ textTransform: 'capitalize' }}>{svc.category || 'grooming'}</span>
                          </div>
                          {svc.description && (
                            <p style={{ fontSize: '0.8rem', color: 'rgba(0,0,0,0.4)', margin: '0.25rem 0 0 0', lineHeight: '1.4' }}>
                              {svc.description}
                            </p>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                          <span style={{ 
                            fontFamily: "'Plus Jakarta Sans', sans-serif", 
                            fontWeight: 800, 
                            fontSize: '1rem', 
                            color: '#000000' 
                          }}>
                            LKR {formatPrice(svc.price)}
                          </span>

                          <button
                            onClick={() => {
                              const willSelect = !isSelected;
                              setSelectedService(willSelect ? svc : null);
                              setSelectedSlot(null);
                              if (willSelect && window.innerWidth < 1024) {
                                setTimeout(() => {
                                  const el = document.getElementById('mobile-booking-section');
                                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }, 80);
                              }
                            }}
                            style={{
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              letterSpacing: '0.05em',
                              padding: '0.6rem 1.25rem',
                              borderRadius: '30px',
                              border: '1px solid #000000',
                              background: isSelected ? '#000000' : '#ffffff',
                              color: isSelected ? '#ffffff' : '#000000',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              outline: 'none'
                            }}
                            onMouseEnter={e => {
                              if (!isSelected) {
                                e.currentTarget.style.background = '#000000';
                                e.currentTarget.style.color = '#ffffff';
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isSelected) {
                                e.currentTarget.style.background = '#ffffff';
                                e.currentTarget.style.color = '#000000';
                              }
                            }}
                          >
                            {isSelected ? 'Selected' : 'Add'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile Booking Sidebar (Only visible on mobile/tablet) */}
            <div id="mobile-booking-section" className="block lg:hidden scroll-mt-20" style={{ marginTop: '2rem' }}>
              {renderBookingSidebar()}
            </div>

            {/* Stylists / Barbers */}
            {displayBarbers.length > 0 && (
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '2.5rem',
                border: '1px solid rgba(0,0,0,0.04)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                textAlign: 'left'
              }}>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.75rem', color: '#000000', marginBottom: '1.5rem', marginTop: 0 }}>
                  Our Stylists
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                  {displayBarbers.map(b => (
                    <div 
                      key={b._id} 
                      style={{ 
                        border: '1px solid rgba(0,0,0,0.06)', 
                        padding: '1.5rem', 
                        borderRadius: '12px', 
                        background: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{
                        width: '64px', height: '64px',
                        background: '#111111',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#ffffff',
                        marginBottom: '1rem',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                        overflow: 'hidden'
                      }}>
                        {b.avatar || b.user?.avatar ? (
                          <img src={b.avatar || b.user.avatar} alt={b.user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          b.user?.name?.[0]?.toUpperCase()
                        )}
                      </div>
                      <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#000000', margin: '0 0 0.25rem 0' }}>
                        {b.user?.name}
                      </h3>
                      <p style={{ 
                        fontFamily: "'Plus Jakarta Sans', sans-serif", 
                        fontSize: '0.75rem', 
                        color: 'rgba(0,0,0,0.4)', 
                        margin: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 600
                      }}>
                        {b.specializations?.slice(0, 2).join(' · ') || 'Grooming Expert'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Barber Portfolios / Showcase */}
            {displayBarbers?.some(b => b.portfolioImages && b.portfolioImages.length > 0) && (
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '2.5rem',
                border: '1px solid rgba(0,0,0,0.04)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                textAlign: 'left'
              }}>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.75rem', color: '#000000', marginBottom: '1.5rem', marginTop: 0 }}>
                  Our Work Showcase
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {displayBarbers.filter(b => b.portfolioImages && b.portfolioImages.length > 0).map(b => (
                    <div 
                      key={b._id} 
                      style={{ 
                        border: '1px solid rgba(0,0,0,0.06)', 
                        padding: '1.5rem', 
                        background: '#ffffff', 
                        borderRadius: '12px',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={{
                          width: '32px', height: '32px',
                          borderRadius: '50%',
                          background: '#000000',
                          color: '#ffffff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '0.85rem',
                          overflow: 'hidden',
                          border: '1px solid rgba(0,0,0,0.1)',
                          flexShrink: 0,
                        }}>
                          {b.avatar || b.user?.avatar ? (
                            <img src={b.avatar || b.user.avatar} alt={b.user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            b.user?.name?.[0]?.toUpperCase()
                          )}
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: '#000000', margin: 0 }}>
                            {b.user?.name}
                          </h3>
                          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.7rem', color: 'rgba(0,0,0,0.4)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                            {b.specializations?.join(', ')}
                          </p>
                        </div>
                      </div>
                      {(() => {
                        const displayImagesList = b.portfolioImages || [];
                        const limit = 4;
                        const visibleImages = displayImagesList.slice(0, limit);
                        const remainingCount = displayImagesList.length - limit;
                        const cols = Math.min(visibleImages.length, 4);

                        return (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: `repeat(${cols}, 1fr)`, 
                            gap: '0.85rem', 
                            width: '100%',
                            maxWidth: cols === 1 ? '140px' : cols === 2 ? '300px' : cols === 3 ? '460px' : '100%'
                          }}>
                            {visibleImages.map((img, i) => {
                              const isLast = i === limit - 1 && remainingCount > 0;
                              return (
                                <div 
                                  key={i} 
                                  onClick={() => {
                                    setActiveLightboxBarber(b);
                                    setLightboxActiveIndex(i);
                                  }}
                                  style={{ 
                                    position: 'relative', 
                                    aspectRatio: '1',
                                    width: '100%',
                                    borderRadius: '8px', 
                                    overflow: 'hidden', 
                                    cursor: 'pointer',
                                    border: '1px solid rgba(0,0,0,0.06)'
                                  }}
                                >
                                  <img 
                                    src={img} 
                                    alt={`${b.user?.name} work`} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                  {isLast && (
                                    <div style={{
                                      position: 'absolute',
                                      inset: 0,
                                      background: 'rgba(0,0,0,0.65)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#ffffff',
                                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                                      fontWeight: 700,
                                      fontSize: '1rem'
                                    }}>
                                      +{remainingCount + 1}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Operating Hours Block */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '2.5rem',
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              textAlign: 'left'
            }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.75rem', color: '#000000', marginBottom: '1.25rem', marginTop: 0 }}>
                Operating Hours
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => {
                  let hours = saloon?.operatingHours?.find(h => h.day === i);
                  if (!saloon?.operatingHours || saloon.operatingHours.length === 0) {
                    hours = { day: i, openTime: '09:00', closeTime: '21:00', isClosed: false };
                  }
                  const isToday = new Date().getDay() === i;
                  return (
                    <div 
                      key={day} 
                      style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.85rem 0',
                        borderBottom: i === 6 ? 'none' : '1px solid rgba(0,0,0,0.05)',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          fontWeight: isToday ? 700 : 500, 
                          fontSize: '0.9rem', 
                          color: isToday ? '#000000' : 'rgba(0,0,0,0.6)' 
                        }}>
                          {day}
                        </span>
                        {isToday && (
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            background: '#000000',
                            color: '#ffffff',
                            padding: '0.15rem 0.4rem',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Today
                          </span>
                        )}
                      </div>
                      
                      <span style={{ 
                        color: hours?.isClosed ? 'rgba(0,0,0,0.3)' : (isToday ? '#000000' : 'rgba(0,0,0,0.6)'), 
                        fontSize: '0.9rem',
                        fontWeight: isToday ? 700 : 500
                      }}>
                        {hours?.isClosed ? 'Closed' : hours ? `${hours.openTime} – ${hours.closeTime}` : 'Closed'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Location & Directions Block */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '2.5rem',
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              textAlign: 'left'
            }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.75rem', color: '#000000', marginBottom: '0.5rem', marginTop: 0 }}>
                Location & Directions
              </h2>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(0,0,0,0.5)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                {saloon?.address?.street ? `${saloon.address.street}, ` : ''}{saloon?.address?.city || 'Colombo'}
              </p>

              {/* Dynamic Google Maps Embed (100% Free) */}
              {saloon?.location?.coordinates && saloon.location.coordinates[0] !== 0 ? (
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
                  <iframe
                    title="Google Maps Location"
                    width="100%"
                    height="280"
                    style={{ border: 0, display: 'block' }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${saloon.location.coordinates[1]},${saloon.location.coordinates[0]}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  ></iframe>
                </div>
              ) : (
                <div style={{ 
                  borderRadius: '12px', 
                  height: '180px', 
                  background: '#fafafa', 
                  border: '1px dashed rgba(0,0,0,0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'rgba(0,0,0,0.4)',
                  fontSize: '0.85rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600,
                  marginBottom: '1.5rem'
                }}>
                  Map preview is not set for this salon.
                </div>
              )}

              {/* Get Directions Button */}
              {(() => {
                const googleMapsUrl = saloon?.location?.coordinates && saloon.location.coordinates[0] !== 0
                  ? `https://www.google.com/maps/dir/?api=1&destination=${saloon.location.coordinates[1]},${saloon.location.coordinates[0]}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${saloon?.name || ''} ${saloon?.address?.street || ''} ${saloon?.address?.city || ''}`)}`;

                return (
                  <a 
                    href={googleMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: '#000000',
                      color: '#ffffff',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      padding: '0.8rem 1.5rem',
                      borderRadius: '30px',
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease',
                    }}
                    className="hover:scale-105 hover:bg-black/90 active:scale-95"
                  >
                    <MapPin size={16} />
                    Get Directions
                  </a>
                );
              })()}
            </div>

            {/* Reviews Card */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '2.5rem',
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              textAlign: 'left'
            }}>
              <div style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '1rem', marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '2rem', color: '#000000', margin: 0 }}>
                  Client Reviews
                </h2>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(0,0,0,0.4)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  What our clients are saying about our styling services.
                </p>
              </div>

              {/* Review summary info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2.5rem', background: '#fafafa', borderRadius: '12px', padding: '2rem', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ textAlign: 'center' }} className="reviews-summary-score">
                  <h3 style={{ fontSize: '4rem', fontWeight: 900, color: '#000000', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>
                    {saloon?.rating > 0 ? saloon.rating.toFixed(1) : '0.0'}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', margin: '0.75rem 0 0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        fill={star <= Math.round(saloon?.rating || 0) ? '#fbbf24' : 'none'}
                        color={star <= Math.round(saloon?.rating || 0) ? '#fbbf24' : 'rgba(0,0,0,0.15)'}
                      />
                    ))}
                  </div>
                  <p style={{ color: 'rgba(0,0,0,0.45)', fontSize: '0.75rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                    {reviews.length} reviews
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                  {[5, 4, 3, 2, 1].map((starsCount) => {
                    const count = reviews.filter((r) => r.rating === starsCount).length;
                    const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={starsCount} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        <span style={{ width: '40px', fontWeight: 700, color: 'rgba(0,0,0,0.5)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          {starsCount} <Star size={9} fill="rgba(0,0,0,0.4)" color="none" />
                        </span>
                        <div style={{ flex: 1, height: '5px', background: 'rgba(0,0,0,0.06)', borderRadius: '50px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', background: '#fbbf24', borderRadius: '50px' }} />
                        </div>
                        <span style={{ width: '30px', textAlign: 'right', fontWeight: 800, color: '#000000' }}>
                          {percent.toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews list */}
              {reviewsLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div className="spinner mx-auto" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000' }} />
                </div>
              ) : reviews.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: 'rgba(0,0,0,0.4)', fontSize: '0.9rem', textAlign: 'center', margin: '2rem 0' }}>No reviews yet for this salon.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                  {reviews.map(r => (
                    <div key={r._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, overflow: 'hidden', flexShrink: 0 }}>
                            {r.customer?.avatar ? (
                              <img src={r.customer.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              r.customer?.name?.[0]?.toUpperCase()
                            )}
                          </div>
                          <div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 750, color: '#000000', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                              {r.customer?.name}
                            </span>
                            <span style={{ display: 'block', fontSize: '0.68rem', color: 'rgba(0,0,0,0.4)', fontWeight: 600, marginTop: '2px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                              {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <div style={{ display: 'flex', gap: '1px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={11}
                                fill={star <= r.rating ? '#fbbf24' : 'none'}
                                color={star <= r.rating ? '#fbbf24' : 'rgba(0,0,0,0.15)'}
                              />
                            ))}
                          </div>
                          {r.barber?.user?.name && (
                            <span style={{ display: 'inline-block', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '50px', padding: '1px 8px', fontSize: '0.6rem', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.02em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.5)' }}>
                              Stylist: {r.barber.user.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {r.comment && (
                        <p style={{ color: 'rgba(0,0,0,0.65)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0, paddingLeft: '2.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {r.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ─── RIGHT COLUMN: STICKY BOOKING SIDEBAR (4 COLS) ─── */}
          <div className="hidden lg:block lg:col-span-4" style={{ position: 'sticky', top: '80px', alignSelf: 'flex-start', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`.booking-sidebar-scroll::-webkit-scrollbar { display: none; }`}</style>
            <div className="booking-sidebar-scroll" style={{ height: '100%' }}>
              {renderBookingSidebar()}
            </div>
          </div>

        </div>

      </div>

      {/* ─── PREMIUM PORTFOLIO SCROLLABLE GRID MODAL ─── */}
      {activeLightboxBarber && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.96)',
          backdropFilter: 'blur(15px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '4rem 2rem 2rem 2rem',
        }}>
          {/* Close button */}
          <button 
            onClick={() => setActiveLightboxBarber(null)}
            style={{
              position: 'absolute',
              top: '2rem',
              right: '2rem',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#ffffff',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              outline: 'none',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            &times;
          </button>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h3 style={{ 
              fontFamily: "'Plus Jakarta Sans', sans-serif", 
              color: '#ffffff', 
              fontSize: '2.5rem', 
              fontWeight: 800,
              margin: '0 0 0.5rem 0'
            }}>
              {activeLightboxBarber.user?.name}'s Collection
            </h3>
            <p style={{ 
              fontFamily: "'Plus Jakarta Sans', sans-serif", 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: '0.9rem',
              margin: 0
            }}>
              Scroll down to view all grooming works & portfolios.
            </p>
          </div>

          {/* Scrollable grid container */}
          <div 
            className="hide-scrollbar"
            style={{
              width: '100%',
              maxWidth: '1000px',
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 200px)',
              paddingBottom: '3rem',
            }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1.25rem',
              width: '100%',
            }}>
              {activeLightboxBarber.portfolioImages?.map((img, idx) => (
                <div 
                  key={idx}
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    aspectRatio: '1',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    background: '#111111',
                    position: 'relative'
                  }}
                >
                  <img 
                    src={img} 
                    alt={`Stylist work ${idx + 1}`}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease' 
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Phone Number Prompt Modal */}
      {isPhoneModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '400px',
            border: '1px solid rgba(0,0,0,0.1)',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            padding: '2rem'
          }}>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: '1.4rem',
              color: '#000000',
              marginBottom: '0.75rem',
              marginTop: 0
            }}>Almost Done!</h2>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.85rem',
              color: 'rgba(0,0,0,0.6)',
              lineHeight: 1.5,
              marginBottom: '1.5rem'
            }}>
              Please enter your phone number to receive real-time appointment confirmations and updates via SMS.
            </p>
            <form onSubmit={handlePhoneSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'rgba(0,0,0,0.45)',
                  marginBottom: '0.5rem'
                }}>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+94 77 123 4567"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.1rem',
                    background: '#ffffff',
                    color: '#000000',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '12px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsPhoneModalOpen(false)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(0,0,0,0.5)',
                    fontSize: '0.85rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={phoneSubmitting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#000000',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '100px'
                  }}
                >
                  {phoneSubmitting ? 'Saving...' : 'Save & Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Floating Mobile Booking Quick Bar (< 1024px) */}
      {selectedService && (
        <div className="block lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/10 p-3 px-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider truncate m-0">
                {selectedService.name}
              </p>
              <p className="text-sm font-black text-black m-0">
                LKR {formatPrice(selectedService.price)}
              </p>
            </div>
            <button
              onClick={() => {
                const el = document.getElementById('mobile-booking-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-4 py-2.5 rounded-xl bg-black text-white text-xs font-extrabold cursor-pointer border-none shadow-md flex items-center gap-1.5 shrink-0 hover:bg-neutral-800 transition-colors"
            >
              {selectedSlot ? 'Review Booking' : 'Choose Slot'} <ArrowDown size={13} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
