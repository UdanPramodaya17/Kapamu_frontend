import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Scissors, Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { authAPI } from '../../api';
import { setCredentials } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';
import loginImg from '../../assets/login_editorial.png';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect');

  const { register, handleSubmit, formState: { errors } } = useForm();

  const handlePostLoginRedirect = (user) => {
    if (redirectUrl && user.role === 'customer') {
      navigate(redirectUrl);
      return;
    }
    const roleRoutes = {
      super_admin: '/admin',
      saloon_admin: '/saloon-admin',
      barber: '/barber',
      customer: '/customer',
    };
    navigate(roleRoutes[user.role] || '/');
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await authAPI.login(data);
      const { user, accessToken, refreshToken } = res.data.data;
      dispatch(setCredentials({ user, accessToken, refreshToken }));
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);
      handlePostLoginRedirect(user);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        const res = await authAPI.googleAuth({ token: tokenResponse.access_token, role: 'customer' });
        const { user, accessToken, refreshToken } = res.data.data;
        dispatch(setCredentials({ user, accessToken, refreshToken }));
        toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);
        handlePostLoginRedirect(user);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Google login failed');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => toast.error('Google login failed'),
  });

  const handleGoogleLogin = () => loginWithGoogle();

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#000000', display: 'flex', position: 'relative', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* ─── LEFT COLUMN: EDITORIAL SPLIT SCREEN (Hidden on Mobile) ─── */}
      <div className="hidden md:flex md:w-[45%] lg:w-[50%]" style={{
        position: 'relative',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '3.5rem',
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.65)), url(${loginImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff',
        borderRight: '1px solid rgba(0,0,0,0.08)',
      }}>
        {/* Top bar with back to home link */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', textDecoration: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>

        {/* Bottom quotes */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '440px' }}>
          <img
            src="/kapamu-white.svg"
            alt="Kapamu"
            style={{
              height: '38px',
              width: 'auto',
              marginBottom: '1.5rem',
            }}
          />
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
          }}>
            Elevate<br />
            <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>Your Style</em>
          </h2>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.6,
          }}>
            Kapamu brings top-rated salons, real-time booking, and global grooming brands directly to you. Log in to explore your personalized suggestions.
          </p>
        </div>

        {/* Copyright or minor footer */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Kapamu © 2026</span>
        </div>
      </div>

      {/* ─── RIGHT COLUMN: LOGIN FORM ─── */}
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        position: 'relative',
      }} className="md:w-[55%] lg:w-[50%]">
        {/* Grid overlay for form side */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', width: '100%', maxWidth: '360px', zIndex: 1 }}>
          {/* Mobile Back Link & Logo */}
          <div className="flex md:hidden" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#000000', textDecoration: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <ArrowLeft size={12} /> Home
            </Link>
            <img
              src="/kapamu-dark.svg"
              alt="Kapamu"
              style={{
                height: '26px',
                width: 'auto',
              }}
            />
          </div>

          {/* Form Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: '2rem',
              color: '#000000',
              lineHeight: 1.15,
              marginBottom: '0.5rem',
            }}>Sign In</h1>
            <p style={{ color: 'rgba(0,0,0,0.45)', fontSize: '0.8rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              New to Kapamu?{' '}
              <Link to="/register" style={{ color: '#000000', fontWeight: 700, textDecoration: 'underline' }}>Join free today</Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label style={{
                display: 'block',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(0,0,0,0.8)',
                marginBottom: '0.5rem',
              }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(0,0,0,0.35)' }} />
                <input
                  {...register('email', { required: 'Email is required' })}
                  type="email"
                  placeholder="email@example.com"
                  style={{
                    width: '100%',
                    paddingLeft: '2.5rem',
                    border: '1px solid rgba(0,0,0,0.12)',
                    background: '#ffffff',
                    color: '#000000',
                    height: '42px',
                    fontSize: '0.85rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    borderRadius: 0,
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#000000'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.12)'}
                />
              </div>
              {errors.email && <p style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '0.25rem' }}>{errors.email.message}</p>}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(0,0,0,0.8)',
                }}>Password</label>
                <Link to="/forgot-password" style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(0,0,0,0.4)',
                  textDecoration: 'none',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#000000'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,0,0,0.4)'}
                >Forgot Password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(0,0,0,0.35)' }} />
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    paddingLeft: '2.5rem',
                    paddingRight: '2.5rem',
                    border: '1px solid rgba(0,0,0,0.12)',
                    background: '#ffffff',
                    color: '#000000',
                    height: '42px',
                    fontSize: '0.85rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    borderRadius: 0,
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#000000'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.12)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(0,0,0,0.35)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '0.25rem' }}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary" style={{
              width: '100%',
              height: '44px',
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
