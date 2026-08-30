import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, ArrowLeft, ShieldCheck } from 'lucide-react';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';
import loginImg from '../../assets/login_editorial.png';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState(null);

    const { register, handleSubmit, formState: { errors } } = useForm();

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const urlToken = urlParams.get('token');
        if (!urlToken) {
            toast.error('Invalid or missing reset token');
            navigate('/login');
        } else {
            setToken(urlToken);
        }
    }, [location, navigate]);

    const onSubmit = async (data) => {
        if (!token) return;
        setIsLoading(true);
        try {
            await authAPI.setNewPassword({ token, newPassword: data.newPassword });
            toast.success('Password reset successfully! You can now log in.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password. Link might be expired.');
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
                        Create a New<br />
                        <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>Secure Password</em>
                    </h2>
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
                        Choose a strong password that's at least 6 characters long. Don't reuse passwords from other services.
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

                    {/* Header */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.35rem 0.75rem',
                            border: '1px solid rgba(0,0,0,0.1)',
                            marginBottom: '1.25rem',
                        }}>
                            <ShieldCheck size={12} style={{ color: 'rgba(0,0,0,0.5)' }} />
                            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.5)' }}>Secure Reset</span>
                        </div>
                        <h1 style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 800,
                            fontSize: '2rem',
                            color: '#000000',
                            lineHeight: 1.15,
                            marginBottom: '0.5rem',
                        }}>New Password</h1>
                        <p style={{ color: 'rgba(0,0,0,0.45)', fontSize: '0.8rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            Please enter your new secure password below.
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
                            }}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={14} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(0,0,0,0.35)' }} />
                                <input
                                    {...register('newPassword', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
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
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#000000'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.12)'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', color: 'rgba(0,0,0,0.35)', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', padding: 0,
                                    }}
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            {errors.newPassword && <p style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '0.25rem' }}>{errors.newPassword.message}</p>}
                        </div>

                        <button type="submit" disabled={isLoading} className="btn-primary" style={{
                            width: '100%',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 700,
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                        }}>
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}