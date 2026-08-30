import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Scissors, Eye, EyeOff, Mail, Lock, User, Phone, ChevronRight, ArrowLeft } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { authAPI } from '../../api';
import { setCredentials } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';
import loginImg from '../../assets/login_editorial.png';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { role: 'customer' }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await authAPI.register(data);
      const { user, accessToken, refreshToken } = res.data.data;
      dispatch(setCredentials({ user, accessToken, refreshToken }));
      toast.success('Welcome to Kapamu! 🎉');

      const roleRoutes = {
        super_admin: '/admin',
        saloon_admin: '/saloon-admin',
        barber: '/barber',
        customer: '/customer',
      };
      navigate(roleRoutes[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        const res = await authAPI.googleAuth({ token: tokenResponse.access_token, role: 'customer' });
        const { user, accessToken, refreshToken } = res.data.data;
        dispatch(setCredentials({ user, accessToken, refreshToken }));
        toast.success('Welcome to Kapamu! 🎉');

        const roleRoutes = {
          super_admin: '/admin',
          saloon_admin: '/saloon-admin',
          barber: '/barber',
          customer: '/customer',
        };
        navigate(roleRoutes[user.role] || '/');
      } catch (err) {
        console.error("Google Auth Frontend Error:", err);
        toast.error(err.response?.data?.message || 'Google registration failed');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google Login Popup Error:", error);
      toast.error('Google popup closed or failed');
    },
  });

  const handleGoogleRegister = () => registerWithGoogle();

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
        {/* Top back link */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', textDecoration: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>

        {/* Feature Highlights */}
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
            marginBottom: '1.5rem',
          }}>
            Start Your<br />
            <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>Journey Today</em>
          </h2>
          
          <div className="space-y-4">
            {[
              'Smart booking engine with real-time availability',
              'Role-based dashboards for every user type',
              'Integrated e-commerce for grooming products',
            ].map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                <div style={{ width: '18px', height: '18px', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronRight size={10} color="#ffffff" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Kapamu © 2026</span>
        </div>
      </div>

      {/* ─── RIGHT COLUMN: REGISTER FORM ─── */}
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        position: 'relative',
      }} className="md:w-[55%] lg:w-[50%]">
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', width: '100%', maxWidth: '360px', zIndex: 1 }}>
          {/* Mobile Back Link & Logo */}
          <div className="flex md:hidden" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
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
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: '2rem',
              color: '#000000',
              lineHeight: 1.15,
              marginBottom: '0.5rem',
            }}>Create Account</h1>
            <p style={{ color: 'rgba(0,0,0,0.45)', fontSize: '0.8rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#000000', fontWeight: 700, textDecoration: 'underline' }}>Sign in</Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label style={{
                display: 'block',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(0,0,0,0.8)',
                marginBottom: '0.4rem',
              }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(0,0,0,0.35)' }} />
                <input
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                  type="text"
                  placeholder="John Doe"
                  style={{
                    width: '100%',
                    paddingLeft: '2.5rem',
                    border: '1px solid rgba(0,0,0,0.12)',
                    background: '#ffffff',
                    color: '#000000',
                    height: '40px',
                    fontSize: '0.85rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    borderRadius: 0,
                  }}
                />
              </div>
              {errors.name && <p style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '0.25rem' }}>{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label style={{
                display: 'block',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(0,0,0,0.8)',
                marginBottom: '0.4rem',
              }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(0,0,0,0.35)' }} />
                <input
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                  type="email"
                  placeholder="name@domain.com"
                  style={{
                    width: '100%',
                    paddingLeft: '2.5rem',
                    border: '1px solid rgba(0,0,0,0.12)',
                    background: '#ffffff',
                    color: '#000000',
                    height: '40px',
                    fontSize: '0.85rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    borderRadius: 0,
                  }}
                />
              </div>
              {errors.email && <p style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '0.25rem' }}>{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label style={{
                display: 'block',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(0,0,0,0.8)',
                marginBottom: '0.4rem',
              }}>Phone Number *</label>
              <div style={{ position: 'relative' }}>
                <Phone size={14} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(0,0,0,0.35)' }} />
                <input
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^(?:\+94|94|0)7\d{8}$/,
                      message: 'Must be a valid Sri Lankan mobile number (e.g. 0771234567)'
                    }
                  })}
                  type="tel"
                  placeholder="+94 77 123 4567"
                  style={{
                    width: '100%',
                    paddingLeft: '2.5rem',
                    border: '1px solid rgba(0,0,0,0.12)',
                    background: '#ffffff',
                    color: '#000000',
                    height: '40px',
                    fontSize: '0.85rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    borderRadius: 0,
                  }}
                />
              </div>
              {errors.phone && <p style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '0.25rem' }}>{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(0,0,0,0.8)',
                marginBottom: '0.4rem',
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(0,0,0,0.35)' }} />
                <input
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    paddingLeft: '2.5rem',
                    paddingRight: '2.5rem',
                    border: '1px solid rgba(0,0,0,0.12)',
                    background: '#ffffff',
                    color: '#000000',
                    height: '40px',
                    fontSize: '0.85rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    borderRadius: 0,
                  }}
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
              height: '42px',
              marginTop: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '1.25rem 0' }}>
            <div style={{ flexGrow: 1, borderTop: '1px solid rgba(0,0,0,0.08)' }}></div>
            <span style={{ flexShrink: 0, margin: '0 1rem', color: 'rgba(0,0,0,0.4)', fontSize: '0.7rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Or sign up with</span>
            <div style={{ flexGrow: 1, borderTop: '1px solid rgba(0,0,0,0.08)' }}></div>
          </div>

          <button type="button" onClick={handleGoogleRegister} style={{
            width: '100%',
            height: '40px',
            border: '1px solid rgba(0,0,0,0.12)',
            background: '#ffffff',
            color: '#000000',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
          >
            <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
        </div>
      </div>
    </div>
  );
}
