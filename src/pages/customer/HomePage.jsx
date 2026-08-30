import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Star, MapPin, Shield, Zap, ShoppingBag, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import CartDrawer from '../../components/shop/CartDrawer';
import { saloonAPI, reviewAPI } from '../../api';

const features = [
  { num: '01', icon: Zap, title: 'Instant Booking', desc: 'Book your favorite barber in seconds with real-time slot availability.' },
  { num: '02', icon: Shield, title: 'Verified Salons', desc: 'Every salon is verified and reviewed by our quality control team.' },
  { num: '03', icon: Star, title: 'Top Rated Barbers', desc: 'Connect with the best-rated barbers in your city.' },
  { num: '04', icon: ShoppingBag, title: 'Premium Shop', desc: 'Buy premium grooming products from trusted global brands.' },
];

const stats = [
  { value: '500+', label: 'Verified Salons' },
  { value: '2,000+', label: 'Expert Barbers' },
  { value: '50K+', label: 'Happy Clients' },
  { value: '4.8', label: 'Avg. Rating' },
];

const testimonials = [
  {
    name: 'Rahul Sharma',
    location: 'Mumbai, India',
    title: 'Great way to discover new salons',
    text: 'Recently moved to a new city and did not know any salons. Kapamu gave me a whole new list of top-rated places to choose from!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    name: 'Priya Mehta',
    location: 'Delhi, India',
    title: 'Sleek app and fast booking',
    text: 'Such a sleek and powerful app. I highly recommend booking your appointments on Kapamu. The slot selection is fast and easy.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    name: 'Akash Kumar',
    location: 'Bangalore, India',
    title: 'All my clients love it',
    text: 'My clients love booking appointments online with Kapamu. The real-time notifications and calendar sync are so convenient.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    name: 'Sneha Patel',
    location: 'Colombo, Sri Lanka',
    title: 'So many great booking features',
    text: 'Love this beauty booking app. There are so many great features to explore. The checkout forms and payment integration are top-notch.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'
  }
];

const tickerItems = ['Book Instantly', 'Verified Salons', 'Top Barbers', 'Premium Products', 'Real-Time Slots', 'AI Hairstyles', 'Kapamu'];

const slideshowImages = [
  '/image/p1.jpg',
  '/image/p2.jpg',
  '/image/p3.jpg',
  '/image/p4.jpg',
  '/image/p5.jpg',
  '/image/p6.jpg',
  '/image/p7.jpg',
  '/image/p8.jpg',
  '/image/p9.jpg',
  '/image/p10.jpg',
  '/image/p11.jpg',
  '/image/p12.jpg'
];


export default function HomePage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [recommendedSaloons, setRecommendedSaloons] = useState([]);
  const [trendingSaloons, setTrendingSaloons] = useState([]);
  const [loadingSaloons, setLoadingSaloons] = useState(true);
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const heroRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slideshowImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  const recScrollRef = useRef(null);
  const trendScrollRef = useRef(null);
  const testimonialScrollRef = useRef(null);

  const scrollContainer = (ref, direction) => {
    if (ref && ref.current) {
      const { scrollLeft } = ref.current;
      const scrollTo = direction === 'left' ? scrollLeft - 360 : scrollLeft + 360;
      ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleMouse = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  useEffect(() => {
    const fetchSaloonsData = async () => {
      try {
        setLoadingSaloons(true);
        const [recRes, trendRes, allRes] = await Promise.all([
          saloonAPI.getAll({ recommended: 'true', limit: 10 }),
          saloonAPI.getAll({ trending: 'true', limit: 10 }),
          saloonAPI.getAll({ limit: 12 }),
        ]);

        const recData = recRes.data.data.saloons || [];
        const trendData = trendRes.data.data.saloons || [];
        const allData = allRes.data.data.saloons || [];

        if (recData.length > 0) {
          setRecommendedSaloons(recData);
        } else {
          setRecommendedSaloons(allData.slice(0, 6));
        }

        if (trendData.length > 0) {
          setTrendingSaloons(trendData);
        } else {
          setTrendingSaloons(allData.slice(6, 12).length > 0 ? allData.slice(6, 12) : allData);
        }
      } catch (err) {
        console.error('Error fetching recommended/trending saloons:', err);
      } finally {
        setLoadingSaloons(false);
      }
    };
    fetchSaloonsData();
  }, []);

  useEffect(() => {
    reviewAPI.getFeatured()
      .then(res => {
        setFeaturedReviews(res.data.data.reviews || []);
      })
      .catch(err => {
        console.error('Error fetching featured reviews:', err);
      });
  }, []);

  const displayRec = recommendedSaloons;
  const displayTrend = trendingSaloons;

  const displayTestimonials = featuredReviews.length > 0
    ? featuredReviews.map(r => ({
        name: r.customer?.name || 'Happy Customer',
        location: r.saloon ? `${r.saloon.name}` : r.product ? `Purchased: ${r.product.name}` : 'Kapamu Client',
        title: r.rating ? `${r.rating} Star Rating` : 'Highly Recommended',
        text: r.comment || 'Amazing service and product. Highly recommended!',
        avatar: r.customer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
        rating: r.rating || 5
      }))
    : testimonials;

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#000000' }}>
      <Navbar />
      <CartDrawer />

      {/* ─── HERO ─── */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: 'calc(100vh - 64px)',
          marginTop: '64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          background: '#000000',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        {/* Full-width Slideshow */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          {slideshowImages.map((src, index) => (
            <div
              key={src}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: index === currentSlideIndex ? 1 : 0,
                transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: index === currentSlideIndex ? 1 : 0,
              }}
            >
              <img
                src={src}
                alt={`Salon showcase ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: index === currentSlideIndex ? 'scale(1.04)' : 'scale(1)',
                  transition: 'transform 5s cubic-bezier(0.16, 1, 0.3, 1)',
                  filter: 'brightness(55%) grayscale(20%)',
                }}
              />
            </div>
          ))}
        </div>

        {/* Centered Typography Overlay */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1000px',
          width: '100%',
          padding: '0 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: '0.65rem',
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: '#ffffff',
            marginBottom: '2rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50px',
            backdropFilter: 'blur(8px)',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}>
            Welcome to Kapamu
          </span>
          
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(2.5rem, 6.5vw, 5.5rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            marginBottom: '2rem',
            textShadow: '0 4px 30px rgba(0,0,0,0.5)',
          }}>
            Redefining the <em style={{ fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.95)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Art</em> of Grooming
          </h1>

          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: 'clamp(0.9rem, 2.5vw, 1.15rem)',
            lineHeight: 1.6,
            maxWidth: '660px',
            marginBottom: '3rem',
            textShadow: '0 2px 12px rgba(0,0,0,0.3)',
          }}>
            Discover world-wide top-rated salons, book expert barbers in real-time, and shop premium grooming lines in one curated space.
          </p>

          <div>
            <Link
              to="/saloons"
              className="btn-primary"
              style={{
                background: '#ffffff',
                color: '#000000',
                borderColor: '#ffffff',
                padding: '1.1rem 3rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                borderRadius: '0',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#000000';
                e.currentTarget.style.borderColor = '#ffffff';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Find a Salon
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: '2.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>Scroll</span>
          <div 
            style={{
              width: '1px',
              height: '50px',
              background: 'linear-gradient(to bottom, #ffffff, transparent)',
              animation: 'scrollLine 2.8s infinite ease-in-out',
            }}
          />
        </div>
      </section>

      {/* ─── TICKER ─── */}
      <div style={{ overflow: 'hidden', borderTop: '1px solid #000000', borderBottom: '1px solid #000000', padding: '0.75rem 0', background: '#000000' }}>
        <div style={{ display: 'flex', gap: '3rem', animation: 'marquee 25s linear infinite', whiteSpace: 'nowrap', width: 'max-content' }}>
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: '0.7rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1rem',
            }}>
              {item}
              <span style={{ fontSize: '0.35rem', color: 'rgba(255,255,255,0.4)' }}>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── STATS FULL ROW ─── */}
      <section style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-black/10">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="py-8 px-4 md:py-14 md:px-8"
                style={{
                  textAlign: 'center',
                  transition: 'background 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.01)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 'clamp(2.5rem, 4vw, 3.75rem)',
                  color: '#000000',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  marginBottom: '0.5rem',
                }}>{stat.value}</div>
                <div style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(0,0,0,0.4)',
                }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES (Premium Carbon Section) ─── */}
      <section style={{ padding: '5.5rem 0', background: '#070707', color: '#ffffff', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '4rem',
            flexWrap: 'wrap',
            gap: '2rem',
          }}>
            <div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.75rem' }}>Our Features</span>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
                Why Choose<br /><em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.55)' }}>Kapamu</em>?
              </h2>
            </div>
            <div style={{ maxWidth: '380px' }}>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
                Everything you need for a premium salon experience, powered by intelligent technology and verified professionals.
              </p>
              <Link to="/saloons" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'all 0.3s ease' }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#ffffff';
                  const arrow = e.currentTarget.querySelector('.explore-arrow');
                  if (arrow) arrow.style.transform = 'translate(3px, -3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                  const arrow = e.currentTarget.querySelector('.explore-arrow');
                  if (arrow) arrow.style.transform = 'translate(0, 0)';
                }}
              >
                Explore All <ArrowUpRight size={14} className="explore-arrow" style={{ transition: 'transform 0.3s ease', color: 'rgba(255,255,255,0.4)' }} />
              </Link>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {features.map(({ num, icon: Icon, title, desc }) => (
              <div
                key={title}
                style={{
                  padding: '2.25rem 1.75rem',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.00) 100%)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '240px',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.00) 100%)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <span style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 800,
                      fontStyle: 'italic',
                      fontSize: '2rem',
                      color: 'rgba(255,255,255,0.2)',
                      lineHeight: 1,
                    }}>{num}</span>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                      <Icon size={16} color="#ffffff" />
                    </div>
                  </div>

                  <h3 style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    color: '#ffffff',
                    marginBottom: '0.75rem',
                    letterSpacing: '-0.01em',
                  }}>{title}</h3>

                  <p style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: '0.85rem',
                    lineHeight: 1.65,
                    margin: 0,
                  }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RECOMMENDED SALONS ─── */}
      <section style={{ padding: '4rem 0', background: '#fdfdfd', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
          <div className="comic-panel-section" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
              <div>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', display: 'block', marginBottom: '0.5rem' }}>Curated Selection</span>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', color: '#000000', letterSpacing: '-0.02em', margin: 0 }}>Recommended Salons</h2>
              </div>
              <Link to="/saloons" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#000000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #000000', paddingBottom: '3px', transition: 'all 0.2s' }}>
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {/* Horizontal Scroll Slider with Centered Left/Right Arrows */}
            <div style={{ position: 'relative' }}>
              {/* Left Arrow */}
              <button
                onClick={() => scrollContainer(recScrollRef, 'left')}
                aria-label="Scroll left"
                style={{
                  position: 'absolute',
                  left: '-22px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 20,
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.12)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  color: '#000000',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#000000';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.25)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#000000';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                }}
              >
                <ChevronLeft size={22} />
              </button>

              {/* Right Arrow */}
              <button
                onClick={() => scrollContainer(recScrollRef, 'right')}
                aria-label="Scroll right"
                style={{
                  position: 'absolute',
                  right: '-22px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 20,
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.12)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  color: '#000000',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#000000';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.25)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#000000';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                }}
              >
                <ChevronRight size={22} />
              </button>

              {/* Scroll Track */}
              <div
                ref={recScrollRef}
                className="hide-scrollbar"
                style={{
                  display: 'flex',
                  gap: '2rem',
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  scrollBehavior: 'smooth',
                  padding: '0.5rem 0.25rem 1.5rem 0.25rem',
                }}
              >
                {displayRec.map((s) => (
                  <Link 
                    to={`/saloons/${s._id}`} 
                    key={s._id} 
                    className="salon-card"
                    style={{
                      flex: '0 0 340px',
                      minWidth: '320px',
                      maxWidth: '350px',
                      scrollSnapAlign: 'start',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Image */}
                    <div style={{ height: '240px', background: '#f5f5f5', position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      {s.coverImage ? (
                        <img 
                          src={s.coverImage} 
                          alt={s.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          className="salon-card-image"
                        />
                      ) : (
                        <div className="comic-dots-bg" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Scissors size={40} color="rgba(0,0,0,0.2)" />
                        </div>
                      )}

                      {/* Rating badge (Top Left) - Comic Yellow */}
                      {s.rating && (
                        <div className="comic-badge-rating">
                          <Star size={11} fill="#d97706" color="#d97706" />
                          <span>{s.rating}</span>
                        </div>
                      )}

                      {/* Scissors Hover Icon (Top Right) */}
                      <div className="scissors-hover-icon">
                        <Scissors size={13} color="#000000" />
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                          <h3 style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 800,
                            fontSize: '1.25rem',
                            color: '#000000',
                            letterSpacing: '-0.01em',
                            lineHeight: '1.2',
                          }}>{s.name}</h3>
                          <ArrowUpRight size={16} className="salon-card-arrow" color="#000000" style={{ flexShrink: 0, marginTop: '3px' }} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'rgba(0,0,0,0.65)', fontSize: '0.75rem', marginBottom: '1rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                          <MapPin size={11} color="rgba(0,0,0,0.4)" />
                          <span>{s.address?.city || 'Location unavailable'}</span>
                          {s.totalReviews && <span style={{ color: 'rgba(0,0,0,0.45)' }}>· {s.totalReviews} reviews</span>}
                        </div>

                        {s.services?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1.25rem' }}>
                            {(Array.isArray(s.services) && typeof s.services[0] === 'string'
                              ? s.services
                              : s.services?.slice(0, 3).map(serv => serv.name || serv)
                            )?.slice(0, 3)?.map((serv, idx) => (
                              <span key={idx} style={{
                                padding: '0.3rem 0.75rem',
                                background: 'rgba(0,0,0,0.02)',
                                border: '1px solid rgba(0,0,0,0.08)',
                                borderRadius: '50px',
                                color: '#000000',
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontWeight: 800,
                                fontSize: '0.65rem',
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                              }}>
                                {serv}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '1rem',
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                      }}>
                        <span className="salon-card-footer-text" style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 800,
                          fontSize: '0.65rem',
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: '#000000',
                        }}>View Details</span>
                        <div className="salon-card-footer-line" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STYLESEAT-STYLE BLACK BUSINESS SECTION ─── */}
      <section style={{ 
        padding: '4rem 0', 
        background: '#ffffff', 
        borderBottom: '1px solid rgba(0,0,0,0.06)' 
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '0 2rem'
        }}>
          <div style={{
            background: '#000000', 
            borderRadius: '24px',
            padding: '3.5rem 3rem',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '3rem',
            position: 'relative',
            overflow: 'hidden',
            flexWrap: 'wrap',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            {/* Subtle background glow */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0) 70%)',
              pointerEvents: 'none',
              zIndex: 1,
            }} />

            {/* Left Photo Column */}
            <div style={{
              flex: '1 1 280px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
            }}>
              {/* Paper overlay image style */}
              <div style={{
                position: 'relative',
                transform: 'rotate(-4deg)',
                width: '100%',
                maxWidth: '280px',
                aspectRatio: '3/4',
                background: '#ffffff',
                padding: '0.75rem 0.75rem 2.5rem 0.75rem',
                boxShadow: '0 15px 30px rgba(0,0,0,0.5)',
                borderRadius: '4px',
                border: '1px solid rgba(0,0,0,0.1)',
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80" 
                  alt="Stylist working"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '2px',
                  }}
                />
                {/* Vintage tape decoration at the top */}
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(2deg)',
                  width: '90px',
                  height: '28px',
                  background: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(2px)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px dashed rgba(0,0,0,0.15)',
                }} />
              </div>
            </div>

            {/* Right Content Column */}
            <div style={{
              flex: '2 1 600px',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 2,
            }}>
              {/* Top Header */}
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  marginBottom: '0.5rem',
                  lineHeight: '1.2',
                }}>Set up your business on Kapamu</h2>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: 'rgba(255,255,255,0.55)',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  margin: '0 0 1.5rem 0',
                }}>
                  Join Sri Lanka's largest network of clients searching for top professionals.
                </p>
                <Link to="/register" style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#000000',
                  background: '#ffffff',
                  padding: '0.85rem 2rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'all 0.3s ease',
                  border: '1px solid #ffffff',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#000000';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#000000';
                }}>
                  Get Started
                </Link>
              </div>

              {/* Three Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem',
              }}>
                {/* Card 1 */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '180px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }}>
                  <div>
                    <h3 style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: '#ffffff',
                      marginBottom: '0.5rem',
                    }}>Grow your business</h3>
                    <p style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: 'rgba(255,255,255,0.45)',
                      fontSize: '0.75rem',
                      lineHeight: '1.5',
                      margin: 0,
                    }}>
                      Unlock business growth by using our marketing tools to attract new clients.
                    </p>
                  </div>
                  <Link to="/register" style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    color: '#000000',
                    background: '#ffffff',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    alignSelf: 'flex-start',
                    marginTop: '1rem',
                    transition: 'all 0.2s ease',
                    border: '1px solid #ffffff',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#000000';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.color = '#000000';
                  }}>Learn More</Link>
                </div>

                {/* Card 2 */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '180px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }}>
                  <div>
                    <h3 style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: '#ffffff',
                      marginBottom: '0.5rem',
                    }}>Manage your business</h3>
                    <p style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: 'rgba(255,255,255,0.45)',
                      fontSize: '0.75rem',
                      lineHeight: '1.5',
                      margin: 0,
                    }}>
                      Take charge of your business and make booking and scheduling a breeze.
                    </p>
                  </div>
                  <Link to="/register" style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    color: '#000000',
                    background: '#ffffff',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    alignSelf: 'flex-start',
                    marginTop: '1rem',
                    transition: 'all 0.2s ease',
                    border: '1px solid #ffffff',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#000000';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.color = '#000000';
                  }}>Learn More</Link>
                </div>

                {/* Card 3 */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '180px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }}>
                  <div>
                    <h3 style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: '#ffffff',
                      marginBottom: '0.5rem',
                    }}>Elevate your client experience</h3>
                    <p style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: 'rgba(255,255,255,0.45)',
                      fontSize: '0.75rem',
                      lineHeight: '1.5',
                      margin: 0,
                    }}>
                      Prioritize client satisfaction with features that create a seamless booking experience.
                    </p>
                  </div>
                  <Link to="/register" style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    color: '#000000',
                    background: '#ffffff',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    alignSelf: 'flex-start',
                    marginTop: '1rem',
                    transition: 'all 0.2s ease',
                    border: '1px solid #ffffff',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#000000';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.color = '#000000';
                  }}>Learn More</Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─── TRENDING SALONS ─── */}
      <section style={{ padding: '4rem 0', background: '#fdfdfd', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
          <div className="comic-panel-section" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
              <div>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', display: 'block', marginBottom: '0.5rem' }}>Popular Picks</span>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', color: '#000000', letterSpacing: '-0.02em', margin: 0 }}>Trending Salons</h2>
              </div>
              <Link to="/saloons" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#000000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #000000', paddingBottom: '3px', transition: 'all 0.2s' }}>
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {/* Horizontal Scroll Slider with Centered Left/Right Arrows */}
            <div style={{ position: 'relative' }}>
              {/* Left Arrow */}
              <button
                onClick={() => scrollContainer(trendScrollRef, 'left')}
                aria-label="Scroll left"
                style={{
                  position: 'absolute',
                  left: '-22px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 20,
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.12)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  color: '#000000',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#000000';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.25)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#000000';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                }}
              >
                <ChevronLeft size={22} />
              </button>

              {/* Right Arrow */}
              <button
                onClick={() => scrollContainer(trendScrollRef, 'right')}
                aria-label="Scroll right"
                style={{
                  position: 'absolute',
                  right: '-22px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 20,
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.12)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  color: '#000000',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#000000';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.25)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#000000';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                }}
              >
                <ChevronRight size={22} />
              </button>

              {/* Scroll Track */}
              <div
                ref={trendScrollRef}
                className="hide-scrollbar"
                style={{
                  display: 'flex',
                  gap: '2rem',
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  scrollBehavior: 'smooth',
                  padding: '0.5rem 0.25rem 1.5rem 0.25rem',
                }}
              >
                {displayTrend.map((s) => (
                  <Link 
                    to={`/saloons/${s._id}`} 
                    key={s._id} 
                    className="salon-card"
                    style={{
                      flex: '0 0 340px',
                      minWidth: '320px',
                      maxWidth: '350px',
                      scrollSnapAlign: 'start',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Image */}
                    <div style={{ height: '240px', background: '#f5f5f5', position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      {s.coverImage ? (
                        <img 
                          src={s.coverImage} 
                          alt={s.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          className="salon-card-image"
                        />
                      ) : (
                        <div className="comic-dots-bg" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Scissors size={40} color="rgba(0,0,0,0.2)" />
                        </div>
                      )}

                      {/* Rating badge (Top Left) - Comic Yellow */}
                      {s.rating && (
                        <div className="comic-badge-rating">
                          <Star size={11} fill="#d97706" color="#d97706" />
                          <span>{s.rating}</span>
                        </div>
                      )}

                      {/* Scissors Hover Icon (Top Right) */}
                      <div className="scissors-hover-icon">
                        <Scissors size={13} color="#000000" />
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                          <h3 style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 800,
                            fontSize: '1.25rem',
                            color: '#000000',
                            letterSpacing: '-0.01em',
                            lineHeight: '1.2',
                          }}>{s.name}</h3>
                          <ArrowUpRight size={16} className="salon-card-arrow" color="#000000" style={{ flexShrink: 0, marginTop: '3px' }} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'rgba(0,0,0,0.65)', fontSize: '0.75rem', marginBottom: '1rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                          <MapPin size={11} color="rgba(0,0,0,0.4)" />
                          <span>{s.address?.city || 'Location unavailable'}</span>
                          {s.totalReviews && <span style={{ color: 'rgba(0,0,0,0.45)' }}>· {s.totalReviews} reviews</span>}
                        </div>

                        {s.services?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1.25rem' }}>
                            {(Array.isArray(s.services) && typeof s.services[0] === 'string'
                              ? s.services
                              : s.services?.slice(0, 3).map(serv => serv.name || serv)
                            )?.slice(0, 3)?.map((serv, idx) => (
                              <span key={idx} style={{
                                padding: '0.3rem 0.75rem',
                                background: 'rgba(0,0,0,0.02)',
                                border: '1px solid rgba(0,0,0,0.08)',
                                borderRadius: '50px',
                                color: '#000000',
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontWeight: 800,
                                fontSize: '0.65rem',
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                              }}>
                                {serv}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '1rem',
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                      }}>
                        <span className="salon-card-footer-text" style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 800,
                          fontSize: '0.65rem',
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: '#000000',
                        }}>View Details</span>
                        <div className="salon-card-footer-line" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA (Black Section) ─── */}
      <section style={{ padding: '4.5rem 0', background: '#000000', color: '#ffffff', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '3rem' }}>
          <div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.75rem' }}>Get Started Today</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              Ready to<br />Elevate<br /><em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.55)' }}>Your Style?</em>
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: '300px' }}>
              Join thousands of customers who book their grooming appointments on Kapamu every day.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn-primary" style={{ background: '#ffffff', color: '#000000', borderColor: '#ffffff' }}>
                Create Free Account <ArrowUpRight size={14} />
              </Link>
              <Link to="/saloons" className="btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#ffffff' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#000000'; e.currentTarget.style.borderColor = '#ffffff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              >
                Browse Salons
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS (Compact Layout) ─── */}
      <section style={{ borderTop: '1px solid rgba(0,0,0,0.08)', padding: '4.5rem 0', background: '#ffffff', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', position: 'relative' }}>

          {/* Header Row with Title and Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
            <div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', display: 'block', marginBottom: '0.5rem' }}>Client Stories</span>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 2.5rem)', color: '#000000', letterSpacing: '-0.02em', margin: 0 }}>Reviews</h2>
            </div>

            {/* Slider Navigation buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => scrollContainer(testimonialScrollRef, 'left')}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: '1px solid rgba(0,0,0,0.1)',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#000000'; e.currentTarget.style.background = '#f9f9f9'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.background = '#ffffff'; }}
                aria-label="Previous testimonials"
              >
                <ChevronLeft size={18} color="#000000" />
              </button>
              <button
                onClick={() => scrollContainer(testimonialScrollRef, 'right')}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: '1px solid rgba(0,0,0,0.1)',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#000000'; e.currentTarget.style.background = '#f9f9f9'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.background = '#ffffff'; }}
                aria-label="Next testimonials"
              >
                <ChevronRight size={18} color="#000000" />
              </button>
            </div>
          </div>

          {/* Slider Container */}
          <div
            ref={testimonialScrollRef}
            className="hide-scrollbar"
            style={{
              display: 'flex',
              gap: '1.5rem',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              padding: '0.25rem 0.25rem 1.5rem',
              margin: '0 -0.25rem',
            }}
          >
            {displayTestimonials.map((t, idx) => (
              <div
                key={`${t.name}-${idx}`}
                style={{
                  flex: '0 0 320px',
                  scrollSnapAlign: 'start',
                  padding: '2rem',
                  background: '#f5f5f5',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '420px',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.04)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  {/* Star rating */}
                  <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1.25rem' }}>
                    {[...Array(t.rating || 5)].map((_, si) => (
                      <Star key={si} size={25} fill="#fbbf24" color="#fbbf24" />
                    ))}
                    {[...Array(5 - (t.rating || 5))].map((_, si) => (
                      <Star key={si} size={25} fill="none" color="#fbbf24" style={{ opacity: 0.25 }} />
                    ))}
                  </div>

                  {/* Review Title */}
                  <h4 style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#000000',
                    lineHeight: '1.4',
                    marginBottom: '0.75rem',
                    letterSpacing: '-0.01em',
                  }}>{t.title}</h4>

                  {/* Review Text */}
                  <p style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: 'rgba(0,0,0,0.6)',
                    fontSize: '0.875rem',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem',
                  }}>{t.text}</p>
                </div>

                {/* Avatar and name bottom row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: '#000000',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '1px solid rgba(0,0,0,0.08)',
                  }}>
                    {t.avatar ? (
                      <img
                        src={t.avatar}
                        alt={t.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      t.name?.[0]?.toUpperCase() || 'C'
                    )}
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#000000', fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>{t.name}</p>
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(0,0,0,0.4)', fontSize: '0.75rem', fontWeight: 500, margin: '0.1rem 0 0' }}>{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ 
        background: '#000000', 
        color: '#ffffff', 
        padding: '5rem 2rem 3rem 2rem', 
        borderTop: '1px solid rgba(255,255,255,0.06)' 
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '4rem',
          marginBottom: '4rem',
          textAlign: 'left'
        }}>
          {/* Brand Info Column */}
          <div>
            <h3 style={{ 
              fontFamily: "'Plus Jakarta Sans', sans-serif", 
              fontWeight: 800, 
              fontSize: '1.25rem', 
              letterSpacing: '0.15em', 
              color: '#ffffff', 
              margin: '0 0 1.5rem 0',
              textTransform: 'uppercase'
            }}>Kapamu</h3>
            <p style={{ 
              fontFamily: "'Plus Jakarta Sans', sans-serif", 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: '0.85rem', 
              lineHeight: '1.75', 
              margin: 0,
              maxWidth: '360px'
            }}>
              Kapamu is more than just booking — it's a lifestyle. Built from the ground up, it represents those who value precision, luxury, and premium grooming.
            </p>
          </div>

          {/* Company Links Column */}
          <div>
            <h4 style={{ 
              fontFamily: "'Plus Jakarta Sans', sans-serif", 
              fontWeight: 700, 
              fontSize: '0.85rem', 
              letterSpacing: '0.1em', 
              color: '#ffffff', 
              margin: '0 0 1.5rem 0',
              textTransform: 'uppercase'
            }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                { label: 'Home', path: '/' },
                { label: 'About us', path: '/about' },
                { label: 'Shipping policy', path: '/shipping' },
                { label: 'Privacy policy', path: '/privacy' },
                { label: 'Refund policy', path: '/refund' },
                { label: 'Terms & conditions', path: '/terms' }
              ].map((link) => (
                <Link 
                  key={link.label} 
                  to={link.path} 
                  style={{ 
                    fontFamily: "'Plus Jakarta Sans', sans-serif", 
                    color: 'rgba(255,255,255,0.45)', 
                    fontSize: '0.85rem', 
                    textDecoration: 'none',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Column */}
          <div>
            <h4 style={{ 
              fontFamily: "'Plus Jakarta Sans', sans-serif", 
              fontWeight: 700, 
              fontSize: '0.85rem', 
              letterSpacing: '0.1em', 
              color: '#ffffff', 
              margin: '0 0 1.5rem 0',
              textTransform: 'uppercase'
            }}>Get In Touch</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <span style={{ 
                fontFamily: "'Plus Jakarta Sans', sans-serif", 
                color: 'rgba(255,255,255,0.45)', 
                fontSize: '0.85rem' 
              }}>
                +94 720858684
              </span>
              <a 
                href="mailto:Kapamubooking@gmail.com" 
                style={{ 
                  fontFamily: "'Plus Jakarta Sans', sans-serif", 
                  color: 'rgba(255,255,255,0.45)', 
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
              >
                Kapamubooking@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div style={{ 
          borderTop: '1px solid rgba(255,255,255,0.06)', 
          paddingTop: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ 
            fontFamily: "'Plus Jakarta Sans', sans-serif", 
            fontSize: '0.75rem', 
            color: 'rgba(255,255,255,0.3)', 
            margin: 0 
          }}>
            Copyright 2026 @ Kapamu.com - All Right Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
