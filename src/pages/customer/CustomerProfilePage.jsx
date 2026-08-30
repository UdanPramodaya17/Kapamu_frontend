import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { authAPI, appointmentAPI, orderAPI } from '../../api';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCurrentUser,
  selectAccessToken,
  setCredentials,
  logout,
} from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { formatPrice } from '../../utils/format';
import toast from 'react-hot-toast';
import {
  User, Phone, Mail, Lock, Eye, EyeOff, Shield, Calendar,
  LogOut, Check, Scissors, ShoppingBag, TrendingUp, AlertCircle,
  CheckCircle2, Camera, KeyRound, Info, Image as ImageIcon,
} from 'lucide-react';
import ImageUploader from '../../components/shared/ImageUploader';

// ── Password strength helper ──────────────────────────────────────────────
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const map = [
    { label: '', color: 'transparent' },
    { label: 'Weak', color: '#ef4444' },
    { label: 'Fair', color: '#f59e0b' },
    { label: 'Good', color: '#3b82f6' },
    { label: 'Strong', color: '#22c55e' },
  ];
  return { score, ...map[score] };
}

// ── Reusable input field ──────────────────────────────────────────────────
function InputField({ label, icon: Icon, rightSlot, type = 'text', ...props }) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 700,
        fontSize: '0.68rem',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'rgba(0,0,0,0.4)',
        marginBottom: '0.5rem',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon
            size={14}
            style={{
              position: 'absolute', left: '1rem', top: '50%',
              transform: 'translateY(-50%)', color: 'rgba(0,0,0,0.3)',
              pointerEvents: 'none',
            }}
          />
        )}
        <input
          type={type}
          {...props}
          style={{
            width: '100%',
            padding: `0.85rem 1rem 0.85rem ${Icon ? '2.5rem' : '1rem'}`,
            paddingRight: rightSlot ? '3rem' : '1rem',
            background: props.readOnly ? 'rgba(0,0,0,0.02)' : '#ffffff',
            color: props.readOnly ? 'rgba(0,0,0,0.4)' : '#000000',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '12px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.88rem',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
            cursor: props.readOnly ? 'default' : 'text',
            ...props.style,
          }}
          onFocus={e => { if (!props.readOnly) e.target.style.borderColor = '#000'; }}
          onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; }}
        />
        {rightSlot && (
          <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}>
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section card wrapper ──────────────────────────────────────────────────
function SectionCard({ icon: Icon, title, subtitle, children, borderColor }) {
  return (
    <div style={{
      background: '#ffffff',
      border: `1px solid ${borderColor || 'rgba(0,0,0,0.07)'}`,
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
    }}>
      <div style={{
        padding: '1.5rem 2rem',
        borderBottom: `1px solid ${borderColor || 'rgba(0,0,0,0.06)'}`,
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: borderColor ? `${borderColor}18` : 'rgba(0,0,0,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={16} color={borderColor || 'rgba(0,0,0,0.55)'} />
        </div>
        <div>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800, fontSize: '1rem', color: '#000', margin: 0,
          }}>{title}</h2>
          {subtitle && (
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.7rem', color: 'rgba(0,0,0,0.4)', margin: '2px 0 0',
            }}>{subtitle}</p>
          )}
        </div>
      </div>
      <div style={{ padding: '2rem' }}>
        {children}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function CustomerProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectAccessToken);

  // ── Stats state ──────────────────────────────────────────────────────
  const [stats, setStats] = useState({ bookings: 0, orders: 0, spent: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Personal info state ──────────────────────────────────────────────
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingInfo, setSavingInfo] = useState(false);

  // ── Password state ───────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const passwordStrength = getPasswordStrength(newPassword);

  // ── Load stats ───────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      appointmentAPI.getMy({}),
      orderAPI.getMy({}),
    ]).then(([aptsRes, ordersRes]) => {
      const apts = aptsRes.data.data.appointments || [];
      const orders = ordersRes.data.data.orders || [];
      const spent = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
      setStats({ bookings: apts.length, orders: orders.length, spent });
    }).catch(() => {}).finally(() => setStatsLoading(false));
  }, []);

  // ── Sync user to form fields ─────────────────────────────────────────
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // ── Save personal info ───────────────────────────────────────────────
  const handleSaveInfo = useCallback(async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required');
    if (!phone.trim() || !/^(?:\+94|94|0)7\d{8}$/.test(phone)) {
      return toast.error('Enter a valid Sri Lankan mobile number (e.g. 0771234567)');
    }
    setSavingInfo(true);
    try {
      const res = await authAPI.updateProfile({ name: name.trim(), phone: phone.trim() });
      if (res.data.success) {
        dispatch(setCredentials({ user: res.data.data.user, accessToken: token }));
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingInfo(false);
    }
  }, [name, phone, token, dispatch]);

  // ── Save password ────────────────────────────────────────────────────
  const handleSavePassword = useCallback(async (e) => {
    e.preventDefault();
    if (!currentPassword) return toast.error('Current password is required');
    if (newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    setSavingPassword(true);
    try {
      await authAPI.updatePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  // ── Logout ───────────────────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    try { await authAPI.logout(); } catch { }
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/');
  }, [dispatch, navigate]);

  // ── Avatar upload handler ─────────────────────────────────────────────
  const handleAvatarUpload = async (newImages) => {
    const avatarUrl = newImages && newImages.length > 0 ? newImages[0] : '';
    try {
      const res = await authAPI.updateProfile({ avatar: avatarUrl });
      if (res.data.success) {
        dispatch(setCredentials({ user: res.data.data.user, accessToken: token }));
        toast.success(avatarUrl ? 'Profile photo updated! ✨' : 'Profile photo removed!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile photo');
    }
  };

  // ── Avatar initials ──────────────────────────────────────────────────
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const memberSince = user?.createdAt
    ? format(new Date(user.createdAt), 'MMMM yyyy')
    : 'Unknown';

  // ── Eye toggle button ────────────────────────────────────────────────
  const EyeToggle = ({ show, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(0,0,0,0.35)', display: 'flex' }}
    >
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );

  return (
    <DashboardLayout>

      {/* ── EYEBROW ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: '24px', height: '1px', background: 'rgba(0,0,0,0.15)' }} />
        <span style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700, fontSize: '0.65rem',
          letterSpacing: '0.25em', textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.45)',
        }}>
          Client Space · My Profile
        </span>
      </div>

      {/* ── PAGE HEADER ── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 900,
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          color: '#000000',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          margin: '0 0 0.5rem 0',
        }}>
          My<br /><em style={{ fontStyle: 'italic', color: 'rgba(0,0,0,0.4)' }}>Profile</em>
        </h1>
        <p style={{
          color: 'rgba(0,0,0,0.5)', fontSize: '0.875rem',
          lineHeight: 1.7, fontFamily: "'Plus Jakarta Sans', sans-serif",
          margin: 0,
        }}>
          Manage your personal information, security, and account preferences.
        </p>
      </div>

      {/* ── HERO AVATAR CARD ── */}
      <div className="bg-black rounded-3xl p-6 sm:p-10 mb-8 flex items-center gap-6 sm:gap-8 flex-wrap relative overflow-hidden">
        {/* Subtle background pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />

        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: '88px', height: '88px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            border: '2px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 900, fontSize: '2rem', color: '#ffffff',
            letterSpacing: '-0.02em',
            overflow: 'hidden',
          }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : initials}
          </div>
          {/* Camera overlay */}
          <div 
            onClick={() => {
              const el = document.getElementById('avatar-upload-card');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              position: 'absolute', bottom: 0, right: 0,
              width: '28px', height: '28px', borderRadius: '50%',
              background: '#ffffff', border: '2px solid #000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            title="Upload / Change Profile Photo"
          >
            <Camera size={13} color="#000" />
          </div>
        </div>

        {/* User info */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900, fontSize: '1.5rem', color: '#ffffff',
              margin: 0, letterSpacing: '-0.02em',
            }}>
              {user?.name || 'My Account'}
            </h2>
            <span style={{
              padding: '0.2rem 0.65rem',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '50px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: '0.6rem',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)',
            }}>
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 1rem 0',
          }}>
            {user?.email}
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '1.75rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Bookings', value: statsLoading ? '—' : stats.bookings, icon: Scissors },
              { label: 'Orders', value: statsLoading ? '—' : stats.orders, icon: ShoppingBag },
              { label: 'Total Spent', value: statsLoading ? '—' : `LKR ${formatPrice(stats.spent)}`, icon: TrendingUp },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 900, fontSize: '1.3rem', color: '#ffffff',
                  letterSpacing: '-0.01em',
                }}>
                  {value}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '0.6rem',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.4)', marginTop: '2px',
                }}>
                  <Icon size={9} />
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Member since */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)',
          fontWeight: 600,
          alignSelf: 'flex-start',
        }}>
          <Calendar size={12} />
          Member since {memberSince}
        </div>
      </div>

      {/* ── TWO COLUMN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── PROFILE PHOTO ── */}
        <div id="avatar-upload-card">
          <SectionCard icon={Camera} title="Profile Photo" subtitle="Upload a photo to personalize your account & reviews">
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8rem', color: 'rgba(0,0,0,0.5)', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
              This image will be displayed on your customer dashboard, booking history, and alongside any salon & product reviews you write.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <ImageUploader
                maxImages={1}
                currentImages={user?.avatar ? [user.avatar] : []}
                onUploadSuccess={handleAvatarUpload}
                title="Profile Photo"
              />
            </div>
          </SectionCard>
        </div>

        {/* ── PERSONAL INFORMATION ── */}
        <SectionCard icon={User} title="Personal Information" subtitle="Update your name and phone number">
          <form onSubmit={handleSaveInfo} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <InputField
              label="Full Name"
              icon={User}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              required
            />

            <InputField
              label="Email Address"
              icon={Mail}
              type="email"
              value={user?.email || ''}
              readOnly
              rightSlot={
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} color="#22c55e" />
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.6rem', fontWeight: 700,
                    color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>Verified</span>
                </div>
              }
            />

            <div>
              <InputField
                label="Phone Number"
                icon={Phone}
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0771234567"
                required
              />
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.65rem', color: 'rgba(0,0,0,0.35)',
                margin: '0.35rem 0 0 0',
              }}>
                Sri Lankan format: 07X XXXXXXX or +94 7X XXXXXXX
              </p>
            </div>

            <div style={{ paddingTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={savingInfo}
                style={{
                  width: '100%', padding: '0.9rem',
                  background: savingInfo ? 'rgba(0,0,0,0.5)' : '#000000',
                  color: '#ffffff', border: 'none',
                  borderRadius: '12px', cursor: savingInfo ? 'not-allowed' : 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800, fontSize: '0.78rem',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { if (!savingInfo) e.currentTarget.style.background = '#111'; }}
                onMouseLeave={e => { if (!savingInfo) e.currentTarget.style.background = '#000'; }}
              >
                {savingInfo ? (
                  <><div className="spinner" style={{ width: '14px', height: '14px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Saving...</>
                ) : (
                  <><Check size={14} /> Save Changes</>
                )}
              </button>
            </div>
          </form>
        </SectionCard>

        {/* ── CHANGE PASSWORD ── */}
        <SectionCard icon={KeyRound} title="Change Password" subtitle="Use a strong, unique password">
          <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <InputField
              label="Current Password"
              icon={Lock}
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
              rightSlot={<EyeToggle show={showCurrent} onToggle={() => setShowCurrent(v => !v)} />}
            />

            <div>
              <InputField
                label="New Password"
                icon={Lock}
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                rightSlot={<EyeToggle show={showNew} onToggle={() => setShowNew(v => !v)} />}
              />
              {/* Strength meter */}
              {newPassword.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '3px', borderRadius: '50px',
                        background: i <= passwordStrength.score ? passwordStrength.color : 'rgba(0,0,0,0.08)',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.65rem', fontWeight: 700,
                    color: passwordStrength.color,
                  }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <InputField
              label="Confirm New Password"
              icon={Lock}
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              autoComplete="new-password"
              rightSlot={<EyeToggle show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />}
              style={
                confirmPassword && newPassword !== confirmPassword
                  ? { borderColor: '#ef4444' }
                  : confirmPassword && newPassword === confirmPassword
                  ? { borderColor: '#22c55e' }
                  : {}
              }
            />

            {/* Requirements */}
            <div style={{
              background: 'rgba(0,0,0,0.02)',
              border: '1px solid rgba(0,0,0,0.05)',
              borderRadius: '10px',
              padding: '0.875rem',
              display: 'flex', flexDirection: 'column', gap: '0.4rem',
            }}>
              {[
                { label: 'At least 8 characters', met: newPassword.length >= 8 },
                { label: 'One uppercase letter', met: /[A-Z]/.test(newPassword) },
                { label: 'One number', met: /[0-9]/.test(newPassword) },
                { label: 'Passwords match', met: newPassword.length > 0 && newPassword === confirmPassword },
              ].map(({ label, met }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '14px', height: '14px', borderRadius: '50%',
                    background: met ? '#f0fdf4' : 'rgba(0,0,0,0.05)',
                    border: `1px solid ${met ? '#22c55e' : 'rgba(0,0,0,0.1)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.2s',
                  }}>
                    {met && <Check size={8} color="#22c55e" strokeWidth={3} />}
                  </div>
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.7rem', fontWeight: 600,
                    color: met ? '#16a34a' : 'rgba(0,0,0,0.4)',
                    transition: 'color 0.2s',
                  }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              style={{
                width: '100%', padding: '0.9rem',
                background: savingPassword ? 'rgba(0,0,0,0.5)' : '#000000',
                color: '#ffffff', border: 'none',
                borderRadius: '12px', cursor: savingPassword ? 'not-allowed' : 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, fontSize: '0.78rem',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { if (!savingPassword) e.currentTarget.style.background = '#111'; }}
              onMouseLeave={e => { if (!savingPassword) e.currentTarget.style.background = '#000'; }}
            >
              {savingPassword ? (
                <><div className="spinner" style={{ width: '14px', height: '14px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Updating...</>
              ) : (
                <><Shield size={14} /> Update Password</>
              )}
            </button>
          </form>
        </SectionCard>

        {/* ── ACCOUNT INFORMATION ── */}
        <SectionCard icon={Info} title="Account Information" subtitle="Read-only account details">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              {
                label: 'Account Type',
                value: user?.role?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) || '—',
                icon: User,
              },
              {
                label: 'Email Address',
                value: user?.email || '—',
                icon: Mail,
                badge: (
                  <span style={{
                    padding: '0.15rem 0.5rem',
                    background: '#f0fdf4', color: '#16a34a',
                    border: '1px solid rgba(34,197,94,0.2)',
                    borderRadius: '50px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700, fontSize: '0.55rem',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>Verified</span>
                ),
              },
              {
                label: 'Phone Number',
                value: user?.phone || 'Not set',
                icon: Phone,
              },
              {
                label: 'Member Since',
                value: memberSince,
                icon: Calendar,
              },
            ].map(({ label, value, icon: Icon, badge }, i, arr) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 0',
                borderBottom: i < arr.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                gap: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '8px',
                    background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={13} color="rgba(0,0,0,0.4)" />
                  </div>
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700, fontSize: '0.72rem',
                    color: 'rgba(0,0,0,0.45)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700, fontSize: '0.85rem', color: '#000000',
                    textAlign: 'right',
                  }}>
                    {value}
                  </span>
                  {badge}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── DANGER ZONE ── */}
        <SectionCard
          icon={AlertCircle}
          title="Account Actions"
          subtitle="Sign out or manage your account"
          borderColor="rgba(239,68,68,0.25)"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.82rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, margin: 0,
            }}>
              Sign out of your account on this device. Your bookings and data will remain saved.
            </p>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
                width: '100%', padding: '0.9rem',
                background: '#fef2f2', color: '#dc2626',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '12px', cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, fontSize: '0.78rem',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#dc2626';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#dc2626';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#fef2f2';
                e.currentTarget.style.color = '#dc2626';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
              }}
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </SectionCard>

      </div>

    </DashboardLayout>
  );
}
