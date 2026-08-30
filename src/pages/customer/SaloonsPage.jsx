import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Search, MapPin, Scissors, Star, ArrowUpRight, Grid, Map } from 'lucide-react';
import { saloonAPI } from '../../api';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import Navbar from '../../components/layout/Navbar';
import toast from 'react-hot-toast';
import SaloonsMap from './SaloonsMap';

export default function SaloonsPage() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [saloons, setSaloons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  const fetchSalons = (searchVal = '', cityVal = '') => {
    saloonAPI.getAll({ search: searchVal, city: cityVal })
      .then(res => {
        setSaloons(res.data.data.saloons || []);
      })
      .catch(err => {
        console.error('Error fetching saloons:', err);
        toast.error('Failed to load salons');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSalons();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchSalons(search, city);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#000000' }}>
      <Navbar />

      {/* ─── HERO HEADER ─── */}
      <section style={{
        paddingTop: '100px',
        paddingBottom: '3.5rem',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.005), transparent)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 1 }}>

          {/* Page label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '16px', height: '1px', background: 'rgba(0,0,0,0.2)' }} />
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: '0.65rem',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'rgba(0,0,0,0.4)',
            }}>Discover · Book · Relax</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '2.5rem' }}>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: '#000000',
            }}>
              Find the<br /><em style={{ fontStyle: 'italic', color: 'rgba(0,0,0,0.45)' }}>Perfect Salon</em>
            </h1>
            <p style={{
              color: 'rgba(0,0,0,0.5)',
              fontSize: '0.85rem',
              lineHeight: 1.6,
              maxWidth: '300px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              Discover top-rated salons near you and book your appointments in real time with our premium partners.
            </p>
          </div>

          {/* Search Form (Responsive Layout) */}
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 md:gap-0 border border-black/10 bg-white w-full md:max-w-2xl rounded-2xl md:rounded-full p-2 md:p-1 shadow-sm">
            {/* Search Input */}
            <div className="flex-1 flex items-center gap-3 py-2 px-4 border-b md:border-b-0 md:border-r border-black/10">
              <Search size={15} color="rgba(0,0,0,0.35)" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                type="text"
                placeholder="Search salons..."
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: '#000000', fontSize: '0.85rem', fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              />
            </div>
            {/* Location Input */}
            <div className="flex items-center gap-3 py-2 px-4 border-b md:border-b-0 md:border-r border-black/10 w-full md:w-48">
              <MapPin size={15} color="rgba(0,0,0,0.35)" />
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                type="text"
                placeholder="City"
                style={{
                  width: '100%', background: 'transparent', border: 'none', outline: 'none',
                  color: '#000000', fontSize: '0.85rem', fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              />
            </div>
            {/* Action Trigger */}
            <button type="submit" className="w-full md:w-auto h-11 px-8 rounded-xl md:rounded-full" style={{ border: 'none', background: '#000000', color: '#ffffff', fontSize: '0.75rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ─── GRID ─── */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '4rem 2rem 8rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700, fontSize: '0.65rem',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'rgba(0,0,0,0.4)',
          }}>
            Showing <span style={{ color: '#000000' }}>{saloons.length}</span> Salons
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.03)', padding: '3px', borderRadius: '30px', border: '1px solid rgba(0,0,0,0.05)' }}>
            <button 
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: viewMode === 'list' ? '#000000' : 'transparent',
                color: viewMode === 'list' ? '#ffffff' : 'rgba(0,0,0,0.5)',
                border: 'none',
                padding: '0.4rem 1rem',
                borderRadius: '30px',
                fontSize: '0.7rem',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                transition: 'all 0.2s'
              }}
            >
              <Grid size={12} />
              List
            </button>
            <button 
              type="button"
              onClick={() => setViewMode('map')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: viewMode === 'map' ? '#000000' : 'transparent',
                color: viewMode === 'map' ? '#ffffff' : 'rgba(0,0,0,0.5)',
                border: 'none',
                padding: '0.4rem 1rem',
                borderRadius: '30px',
                fontSize: '0.7rem',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                transition: 'all 0.2s'
              }}
            >
              <Map size={12} />
              Map View
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1px', background: 'rgba(0,0,0,0.06)' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: '320px', background: '#f5f5f5', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : saloons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            <div style={{ width: '60px', height: '60px', border: '1px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', borderRadius: '50%' }}>
              <Scissors size={24} color="rgba(0,0,0,0.3)" />
            </div>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', color: '#000000', marginBottom: '0.75rem', fontWeight: 800 }}>No Salons Found</h3>
            <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.875rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Try adjusting your search filters</p>
          </div>
        ) : viewMode === 'map' ? (
          <SaloonsMap saloons={saloons} />
        ) : (
          <div className="comic-panel-section" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.02)', padding: '2.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
              {saloons.map((saloon) => (
                <Link
                  key={saloon._id}
                  to={`/saloons/${saloon._id}`}
                  className="salon-card"
                >
                  {/* Image */}
                  <div style={{ height: '245px', background: '#f5f5f5', position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    {(saloon.coverImage || saloon.images?.[0]) ? (
                      <img
                        src={saloon.coverImage || saloon.images[0]}
                        alt={saloon.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="comic-dots-bg" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Scissors size={40} color="rgba(0,0,0,0.2)" />
                      </div>
                    )}

                    {/* Rating badge (Top Left) - Amber Pill */}
                    {saloon.rating && (
                      <div className="comic-badge-rating">
                        <Star size={11} fill="#d97706" color="#d97706" />
                        <span>{saloon.rating}</span>
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
                        }}>{saloon.name}</h3>
                        <ArrowUpRight size={16} className="salon-card-arrow" color="#000000" style={{ flexShrink: 0, marginTop: '3px' }} />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'rgba(0,0,0,0.65)', fontSize: '0.75rem', marginBottom: '1rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                        <MapPin size={11} color="rgba(0,0,0,0.4)" />
                        <span>{saloon.address?.city || 'Location unavailable'}</span>
                        {saloon.totalReviews && <span style={{ color: 'rgba(0,0,0,0.45)' }}>· {saloon.totalReviews} reviews</span>}
                      </div>

                      {saloon.services?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1.25rem' }}>
                          {(Array.isArray(saloon.services) && typeof saloon.services[0] === 'string'
                            ? saloon.services
                            : saloon.services?.slice(0, 3).map(s => s.name || s)
                          )?.slice(0, 3)?.map(s => (
                            <span key={s} style={{
                              padding: '0.3rem 0.75rem',
                              background: 'rgba(0,0,0,0.02)',
                              border: '1px solid rgba(0,0,0,0.08)',
                              borderRadius: '50px',
                              color: '#000000',
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontWeight: 750,
                              fontSize: '0.65rem',
                              letterSpacing: '0.04em',
                              textTransform: 'uppercase',
                            }}>{s}</span>
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
                      }}>{isAuthenticated ? 'View & Book' : 'View Details'}</span>
                      <div className="salon-card-footer-line" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
