import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Calendar, TrendingUp, Clock, DollarSign,
  ArrowUpRight, BarChart2, CheckCircle2, AlertCircle,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { analyticsAPI, saloonAPI } from '../../api';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { format } from 'date-fns';

const statusConfig = {
  pending:   { bg: '#fffbeb', text: '#d97706', label: 'Pending' },
  confirmed: { bg: '#eff6ff', text: '#2563eb', label: 'Confirmed' },
  completed: { bg: '#f0fdf4', text: '#16a34a', label: 'Completed' },
  cancelled: { bg: '#fef2f2', text: '#dc2626', label: 'Cancelled' },
};

function StatusBadge({ status }) {
  const c = statusConfig[status] || statusConfig.pending;
  return (
    <span style={{
      padding: '0.2rem 0.65rem', borderRadius: '50px',
      background: c.bg, color: c.text,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 700, fontSize: '0.6rem',
      letterSpacing: '0.06em', textTransform: 'uppercase',
      flexShrink: 0,
    }}>{c.label}</span>
  );
}

export default function SaloonAdminDashboard() {
  const user = useSelector(selectCurrentUser);
  const [saloon, setSaloon] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    saloonAPI.getMy()
      .then(res => {
        const s = res.data.data.saloon;
        setSaloon(s);
        return analyticsAPI.getSaloon(s._id, { period: '7d' });
      })
      .then(aRes => setAnalytics(aRes.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const ov = analytics?.overview || {};

  const statTiles = [
    {
      icon: Calendar, label: 'Total Bookings', value: ov.totalAppointments ?? '—',
      iconBg: '#eff6ff', iconColor: '#2563eb', sub: 'Last 7 days',
    },
    {
      icon: CheckCircle2, label: 'Completed', value: ov.completedAppointments ?? '—',
      iconBg: '#f0fdf4', iconColor: '#16a34a', sub: 'Last 7 days',
    },
    {
      icon: Clock, label: 'Pending', value: ov.pendingAppointments ?? '—',
      iconBg: '#fffbeb', iconColor: '#d97706', sub: 'Awaiting action',
    },
    {
      icon: DollarSign, label: 'Revenue', value: ov.totalRevenue != null ? `LKR ${ov.totalRevenue.toLocaleString()}` : '—',
      iconBg: '#f0fdf4', iconColor: '#16a34a', sub: 'Last 7 days',
    },
  ];

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
          Salon Admin · Overview
        </span>
      </div>

      {/* ── PAGE HEADER ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2.5rem',
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            color: '#000000',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            margin: 0,
          }}>
            {saloon ? saloon.name : 'Dashboard'}<br />
            <em style={{ fontStyle: 'italic', color: 'rgba(0,0,0,0.4)' }}>Overview</em>
          </h1>
          {saloon && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: saloon.isVerified ? '#22c55e' : '#f59e0b',
              }} />
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.75rem', fontWeight: 600, color: 'rgba(0,0,0,0.5)',
              }}>
                {saloon.isVerified ? 'Verified Salon' : 'Pending Verification'}
              </span>
            </div>
          )}
        </div>

        {/* Analytics link */}
        <Link
          to="/saloon-admin/analytics"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: '#000000', color: '#ffffff',
            borderRadius: '50px', textDecoration: 'none',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800, fontSize: '0.75rem',
            letterSpacing: '0.05em', textTransform: 'uppercase',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#222'}
          onMouseLeave={e => e.currentTarget.style.background = '#000'}
        >
          <BarChart2 size={14} />
          Full Analytics
          <ArrowUpRight size={12} />
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 0' }}>
          <div className="spinner" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000' }} />
        </div>
      ) : !saloon ? (
        /* ── No salon setup ── */
        <div style={{
          background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✂️</div>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 900, fontSize: '1.75rem', color: '#000', marginBottom: '0.5rem',
          }}>
            Set Up Your Salon
          </h2>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: 'rgba(0,0,0,0.45)', fontSize: '0.9rem', marginBottom: '2rem',
          }}>
            You haven't created your salon profile yet. Get started to accept bookings!
          </p>
          <Link to="/saloon-admin/settings" className="btn-primary" style={{ display: 'inline-block' }}>
            Create Salon Profile
          </Link>
        </div>
      ) : (
        <>
          {/* ── STAT TILES ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.75rem',
          }}>
            {statTiles.map(({ icon: Icon, label, value, iconBg, iconColor, sub }) => (
              <div key={label} style={{
                background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)',
                borderRadius: '20px', padding: '1.5rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '11px',
                  background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem',
                }}>
                  <Icon size={18} color={iconColor} />
                </div>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 900,
                  fontSize: typeof value === 'string' && value.startsWith('LKR') ? '1.3rem' : '2rem',
                  color: '#000', margin: 0, letterSpacing: '-0.02em', lineHeight: 1,
                }}>{value}</p>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', marginTop: '0.4rem',
                }}>{label}</p>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.68rem', color: 'rgba(0,0,0,0.3)', marginTop: '0.2rem',
                }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* ── TWO PANEL ROW ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>

            {/* Recent Bookings */}
            <div style={{
              background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: '20px', overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}>
              <div style={{
                padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <h3 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800, fontSize: '0.95rem', color: '#000', margin: 0,
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  <Calendar size={15} /> Recent Bookings
                </h3>
                <Link to="/saloon-admin/bookings" style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '0.62rem',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  color: 'rgba(0,0,0,0.4)', textDecoration: 'none',
                }}>View All →</Link>
              </div>
              <div style={{ padding: '0.75rem 1.25rem 1.25rem' }}>
                {!analytics?.recentAppointments?.length ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'rgba(0,0,0,0.3)' }}>
                    <Calendar size={28} style={{ margin: '0 auto 0.5rem' }} />
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem' }}>No bookings yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {analytics.recentAppointments.slice(0, 6).map(apt => (
                      <div key={apt._id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.875rem', background: 'rgba(0,0,0,0.01)',
                        border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px',
                        gap: '0.75rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                          <div style={{
                            width: '34px', height: '34px', borderRadius: '50%',
                            background: '#f5f5f5', border: '1px solid rgba(0,0,0,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 800, fontSize: '0.75rem', color: '#000',
                            flexShrink: 0,
                          }}>
                            {apt.customer?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontWeight: 800, fontSize: '0.85rem', color: '#000',
                              margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>{apt.customer?.name}</p>
                            <p style={{
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontSize: '0.68rem', color: 'rgba(0,0,0,0.4)',
                              margin: '2px 0 0', fontWeight: 600,
                              textTransform: 'uppercase', letterSpacing: '0.04em',
                            }}>{apt.service?.name}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                          <StatusBadge status={apt.status} />
                          <span style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: '0.65rem', color: 'rgba(0,0,0,0.35)', fontWeight: 600,
                          }}>LKR {apt.service?.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: '20px', overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800, fontSize: '0.95rem', color: '#000', margin: 0,
                }}>Quick Actions</h3>
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '1px', background: 'rgba(0,0,0,0.05)',
              }}>
                {[
                  { label: 'Bookings', sub: 'Manage appointments', to: '/saloon-admin/bookings', icon: Calendar },
                  { label: 'Analytics', sub: 'Revenue & trends', to: '/saloon-admin/analytics', icon: BarChart2 },
                  { label: 'Barbers', sub: 'Manage team', to: '/saloon-admin/barbers', icon: TrendingUp },
                  { label: 'Settings', sub: 'Salon profile', to: '/saloon-admin/settings', icon: AlertCircle },
                ].map(({ label, sub, to, icon: Icon }) => (
                  <Link key={to} to={to} style={{
                    display: 'flex', flexDirection: 'column', gap: '0.4rem',
                    padding: '1.25rem', background: '#ffffff',
                    textDecoration: 'none', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Icon size={16} color="rgba(0,0,0,0.45)" />
                      <ArrowUpRight size={11} color="rgba(0,0,0,0.2)" />
                    </div>
                    <span style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 800, fontSize: '0.72rem',
                      letterSpacing: '0.06em', textTransform: 'uppercase', color: '#000',
                    }}>{label}</span>
                    <span style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '0.68rem', color: 'rgba(0,0,0,0.38)',
                    }}>{sub}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
