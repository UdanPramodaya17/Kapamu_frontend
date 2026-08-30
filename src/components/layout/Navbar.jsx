import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Scissors, ShoppingCart, Menu, X, ChevronDown, LogOut, LayoutDashboard, User } from 'lucide-react';
import { selectIsAuthenticated, selectCurrentUser, logout } from '../../features/auth/authSlice';
import { selectCartCount } from '../../features/cart/cartSlice';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';
import NotificationBell from '../notifications/NotificationBell';

export default function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const cartCount = useSelector(selectCartCount);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch { }
    dispatch(logout());
    toast.success('Logged out');
  };

  const dashboardRoute = {
    super_admin: '/admin',
    saloon_admin: '/saloon-admin',
    barber: '/barber',
    customer: '/customer',
  }[user?.role] || '/';

  const profileRoute = {
    customer: '/customer/profile',
    saloon_admin: '/saloon-admin/settings',
    barber: '/barber/settings',
    super_admin: '/admin/profile',
  }[user?.role] || null;

  const navLinks = [
    { to: '/saloons', label: 'Find Salons' },
    { to: '/shop', label: 'Shop' },
    { to: '/ai-style', label: 'AI Style' },
  ];

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'all 0.3s ease',
        backgroundColor: '#000000',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>

            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <img
                src="/kapamu-white.svg"
                alt="Kapamu"
                style={{
                  height: '50px',
                  width: 'auto',
                  objectFit: 'contain',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            </Link>

            {/* Desktop Nav */}
            <div className="navbar-links">
              {navLinks.map(({ to, label }) => {
                const active = location.pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    style={{
                      padding: '0.4rem 1rem',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: active ? '#000000' : 'rgba(255,255,255,0.65)',
                      backgroundColor: active ? '#ffffff' : 'transparent',
                      border: '1px solid',
                      borderColor: active ? '#ffffff' : 'transparent',
                      transition: 'all 0.2s ease',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                        e.currentTarget.style.borderColor = 'transparent';
                      }
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Right Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

              {/* Notification Bell */}
              {isAuthenticated && <NotificationBell />}

              {/* Cart */}
              {isAuthenticated && (
                <Link to="/checkout" style={{
                  position: 'relative',
                  padding: '0.5rem',
                  color: 'rgba(255,255,255,0.65)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                >
                  <ShoppingCart size={18} />
                  {cartCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '16px',
                      height: '16px',
                      background: '#ffffff',
                      color: '#000000',
                      borderRadius: '50%',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Barlow Condensed', sans-serif",
                    }}>
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {isAuthenticated ? (
                <div style={{ position: 'relative' }} className="hidden md:block">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.375rem 0.75rem',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '0.75rem',
                      letterSpacing: '0.05em',
                    }}
                  >
                    <div style={{
                      width: '24px', height: '24px',
                      background: '#ffffff',
                      color: '#000000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.65rem',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      borderRadius: '50%',
                      overflow: 'hidden',
                    }}>
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        user?.name?.[0]?.toUpperCase()
                      )}
                    </div>
                    <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={12} style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setUserMenuOpen(false)} />
                      <div style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 8px)',
                        width: '200px',
                        zIndex: 50,
                        background: '#0a0a0a',
                        border: '1px solid rgba(255,255,255,0.15)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        animation: 'slideDown 0.2s ease-out',
                      }}>
                        <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                          <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
                          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.125rem' }}>{user?.email}</p>
                          <span style={{
                            display: 'inline-block',
                            marginTop: '0.375rem',
                            padding: '0.1rem 0.5rem',
                            background: 'rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '0.6rem',
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                          }}>{user?.role?.replace('_', ' ')}</span>
                        </div>
                        <div style={{ padding: '0.375rem' }}>
                          <Link to={dashboardRoute} onClick={() => setUserMenuOpen(false)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', textDecoration: 'none', transition: 'all 0.15s', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent'; }}
                          >
                            <LayoutDashboard size={13} /> Dashboard
                          </Link>
                          {profileRoute && (
                            <Link to={profileRoute} onClick={() => setUserMenuOpen(false)}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', textDecoration: 'none', transition: 'all 0.15s', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent'; }}
                            >
                              <User size={13} /> Profile
                            </Link>
                          )}
                          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.25rem 0' }} />
                          <button onClick={handleLogout}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent'; }}
                          >
                            <LogOut size={13} /> Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="navbar-auth">
                  <Link to="/login" className="btn-ghost" style={{ fontSize: '0.72rem', color: '#ffffff' }}>Login</Link>
                  <Link to="/register" className="btn-primary" style={{ fontSize: '0.72rem', padding: '0.5rem 1.25rem', background: '#ffffff', color: '#000000', borderColor: '#ffffff' }}>Sign Up</Link>
                </div>
              )}

              {/* Mobile Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="mobile-menu-toggle"
                style={{
                  padding: '0.375rem',
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: 'rgba(255,255,255,0.85)',
                  cursor: 'pointer',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                }}
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{
            background: '#000000',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            padding: '1rem 1.5rem',
            animation: 'slideDown 0.2s ease-out',
            maxHeight: 'calc(100vh - 68px)',
            overflowY: 'auto',
          }}>
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  color: location.pathname.startsWith(to) ? '#ffffff' : 'rgba(255,255,255,0.7)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            ))}
            <div style={{ paddingTop: '1rem' }}>
              {isAuthenticated ? (
                <>
                  <Link
                    to={dashboardRoute}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 0',
                      color: 'rgba(255,255,255,0.75)',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                    }}
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  {profileRoute && (
                    <Link
                      to={profileRoute}
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 0',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                      }}
                    >
                      <User size={16} /> Profile
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.75rem 0',
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '0.75rem',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: '#ffffff',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      borderRadius: '8px',
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '0.75rem',
                      background: '#ffffff',
                      color: '#000000',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      borderRadius: '8px',
                    }}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
