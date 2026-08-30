import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';
import loginImg from '../../assets/login_editorial.png';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(data);
      setIsSent(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#000000', display: 'flex', position: 'relative', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ─── LEFT COLUMN ─── */}
      <div className="hidden md:flex md:w-[45%] lg:w-[50%]" style={{
        position: 'relative',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '3.5rem',
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.7)), url(${loginImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff',
        borderRight: '1px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', textDecoration: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '440px' }}>
          <img src="/kapamu-white.svg" alt="Kapamu" style={{ height: '38px', width: 'auto', marginBottom: '1.5rem' }} />
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
          }}>
            Reset Your<br />
            <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>Password</em>
          </h2>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
            No worries — it happens to everyone. Enter your email and we'll send you a secure link to reset your password instantly.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Kapamu © 2026</span>
        </div>
      </div>

      {/* ─── RIGHT COLUMN ─── */}
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

          {/* Mobile header */}
          <div className="flex md:hidden" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#000000', textDecoration: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <ArrowLeft size={12} /> Login
            </Link>
            <img src="/kapamu-dark.svg" alt="Kapamu" style={{ height: '26px', width: 'auto' }} />
          </div>

          {!isSent ? (
            <>
              {/* Header */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: '2rem',
                  color: '#000000',
                  lineHeight: 1.15,
                  marginBottom: '0.5rem',
                }}>Forgot Password</h1>
                <p style={{ color: 'rgba(0,0,0,0.45)', fontSize: '0.8rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Enter your email and we'll send a reset link.
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
                        outline: 'none',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = '#000000'}
                      onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.12)'}
                    />
                  </div>
                  {errors.email && <p style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '0.25rem' }}>{errors.email.message}</p>}
                </div>

                <button type="submit" disabled={isLoading} className="btn-primary" style={{
                  width: '100%',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}>
                  {isLoading ? 'Sending...' : <><Send size={14} /> Send Reset Link</>}
                </button>
              </form>

              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <Link to="/login" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  color: 'rgba(0,0,0,0.4)', fontSize: '0.75rem', fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#000000'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,0,0,0.4)'}
                >
                  <ArrowLeft size={12} /> Back to Login
                </Link>
              </div>
            </>
          ) : (
            /* ─── SUCCESS STATE ─── */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px', height: '64px', background: '#000000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}>
                <CheckCircle2 size={28} color="#ffffff" />
              </div>
              <h1 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, fontSize: '1.75rem', color: '#000000',
                marginBottom: '0.75rem', lineHeight: 1.15,
              }}>Check Your Inbox</h1>
              <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '2rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                We've sent a secure password reset link to your email. It expires in 15 minutes.
              </p>
              <Link to="/login" className="btn-primary" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
              }}>
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}