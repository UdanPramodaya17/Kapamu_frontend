import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { analyticsAPI } from '../../api';
import {
  Users, Building2, Calendar, DollarSign, TrendingUp,
  CheckCircle, Clock, ShoppingCart, BarChart3, Activity
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const ROLE_COLORS = {
  customer: '#000000',
  saloon_admin: '#3b82f6',
  barber: '#10b981',
  seller: '#f59e0b',
  super_admin: '#8b5cf6',
};
const FALLBACK_COLORS = ['#000000', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#fff', border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: '10px', padding: '10px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}>
        {label && <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: 600 }}>{label}</p>}
        {payload.map((entry, i) => (
          <p key={i} style={{ fontSize: '13px', fontWeight: 700, color: entry.color || '#000' }}>
            {entry.name}: <span>{entry.value?.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function SuperAdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getGlobal()
      .then(res => setAnalytics(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const ov = analytics?.overview || {};
  const monthlyUsers = analytics?.monthlyUsers || [];
  const roleBreakdown = (analytics?.roleBreakdown || []).map((r, i) => ({
    ...r,
    fill: ROLE_COLORS[r._id] || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }));

  // Derive verification data for bar chart
  const saloonStatusData = [
    { name: 'Verified', value: ov.verifiedSaloons || 0, fill: '#10b981' },
    { name: 'Pending', value: ov.pendingSaloons || 0, fill: '#f59e0b' },
  ];

  // KPIs
  const kpis = [
    { label: 'Total Users', value: ov.totalUsers, icon: Users, color: 'text-black bg-black/5 border-black/10', change: `+${ov.newUsersThisMonth || 0} this month` },
    { label: 'Total Saloons', value: ov.totalSaloons, icon: Building2, color: 'text-blue-700 bg-blue-50 border-blue-200', change: `${ov.verifiedSaloons || 0} verified` },
    { label: 'Total Appointments', value: ov.totalAppointments, icon: Calendar, color: 'text-green-700 bg-green-50 border-green-200', change: 'All time' },
    { label: 'Global Revenue', value: `LKR ${((ov.globalRevenue || 0) / 1000).toFixed(1)}K`, icon: DollarSign, color: 'text-amber-700 bg-amber-50 border-amber-200', change: 'Completed appts.' },
    { label: 'Total Orders', value: ov.totalOrders, icon: ShoppingCart, color: 'text-purple-700 bg-purple-50 border-purple-200', change: 'E-shop orders' },
    { label: 'New Users (Month)', value: ov.newUsersThisMonth, icon: TrendingUp, color: 'text-pink-700 bg-pink-50 border-pink-200', change: 'Since 1st' },
    { label: 'Verified Saloons', value: ov.verifiedSaloons, icon: CheckCircle, color: 'text-emerald-700 bg-emerald-50 border-emerald-200', change: `${ov.totalSaloons ? Math.round((ov.verifiedSaloons / ov.totalSaloons) * 100) : 0}% of total` },
    { label: 'Pending Approval', value: ov.pendingSaloons, icon: Clock, color: 'text-orange-700 bg-orange-50 border-orange-200', change: 'Needs review' },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center">
            <BarChart3 size={18} color="#fff" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-black leading-tight">Platform Analytics</h1>
            <p className="text-gray-500 text-sm font-medium">Deep-dive into platform-wide performance & growth metrics</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="spinner mb-3" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000000' }} />
          <p className="text-gray-500 text-sm font-medium">Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* ── KPI GRID ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {kpis.map(kpi => (
                  <div key={kpi.label} className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-black/25 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${kpi.color}`}>
                        <kpi.icon size={18} />
                      </div>
                    </div>
                    <p className="font-display text-2xl font-bold text-black mb-0.5">
                      {typeof kpi.value === 'number' ? kpi.value?.toLocaleString() : kpi.value || 0}
                    </p>
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider font-condensed mb-1">{kpi.label}</p>
                    <p className="text-gray-400 text-xs font-medium">{kpi.change}</p>
                  </div>
                ))}
              </div>

              {/* ── CHARTS ROW 1 ── */}
              <div className="grid lg:grid-cols-3 gap-6 mb-6">

                {/* Monthly User Growth — Area Chart */}
                <div className="lg:col-span-2 bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-display text-lg font-bold text-black">User Growth Trend</h2>
                      <p className="text-gray-400 text-xs font-medium mt-0.5">Monthly new user registrations (last 6 months)</p>
                    </div>
                    <span className="text-xs font-bold font-condensed tracking-wider uppercase px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full flex items-center gap-1">
                      <Activity size={11} /> Live
                    </span>
                  </div>
                  {monthlyUsers.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={230}>
                      <AreaChart data={monthlyUsers} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#000000" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="_id" stroke="#d1d5db" tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }} />
                        <YAxis stroke="#d1d5db" tick={{ fill: '#6b7280', fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone" dataKey="count" stroke="#000000"
                          fill="url(#userGrad)" strokeWidth={2.5} name="New Users"
                          dot={{ r: 4, fill: '#000', strokeWidth: 0 }}
                          activeDot={{ r: 6, fill: '#000' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* User Role Breakdown — Donut */}
                <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
                  <div className="mb-6">
                    <h2 className="font-display text-lg font-bold text-black">User Roles</h2>
                    <p className="text-gray-400 text-xs font-medium mt-0.5">Distribution by role type</p>
                  </div>
                  {roleBreakdown.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={230}>
                      <PieChart>
                        <Pie
                          data={roleBreakdown} cx="50%" cy="45%"
                          innerRadius={58} outerRadius={88}
                          dataKey="count" nameKey="_id"
                          paddingAngle={3}
                        >
                          {roleBreakdown.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} formatter={(v, n) => [v, n]} />
                        <Legend
                          iconType="circle" iconSize={8}
                          formatter={(value) => (
                            <span style={{ color: '#4b5563', fontSize: '12px', fontWeight: 600 }}>
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* ── CHARTS ROW 2 ── */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">

                {/* Saloon Verification Status — Bar Chart */}
                <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
                  <div className="mb-6">
                    <h2 className="font-display text-lg font-bold text-black">Saloon Verification Status</h2>
                    <p className="text-gray-400 text-xs font-medium mt-0.5">Verified vs pending approval</p>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={saloonStatusData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="name" stroke="#d1d5db" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }} />
                      <YAxis stroke="#d1d5db" tick={{ fill: '#6b7280', fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} name="Saloons">
                        {saloonStatusData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  {/* Mini stats below */}
                  <div className="flex gap-4 mt-4 pt-4 border-t border-black/5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs text-gray-600 font-semibold">{ov.verifiedSaloons || 0} Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-xs text-gray-600 font-semibold">{ov.pendingSaloons || 0} Pending</span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-xs text-gray-400 font-medium">
                        {ov.totalSaloons ? Math.round((ov.verifiedSaloons / ov.totalSaloons) * 100) : 0}% approval rate
                      </span>
                    </div>
                  </div>
                </div>

                {/* Platform Summary Table */}
                <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
                  <div className="mb-5">
                    <h2 className="font-display text-lg font-bold text-black">Platform Summary</h2>
                    <p className="text-gray-400 text-xs font-medium mt-0.5">Key metrics at a glance</p>
                  </div>
                  <div className="space-y-0 divide-y divide-black/5">
                    {[
                      { label: 'Total Platform Users', value: ov.totalUsers?.toLocaleString(), icon: '👥' },
                      { label: 'Total Registered Saloons', value: ov.totalSaloons?.toLocaleString(), icon: '🏪' },
                      { label: 'Total Appointments Booked', value: ov.totalAppointments?.toLocaleString(), icon: '📅' },
                      { label: 'Total E-Shop Orders', value: ov.totalOrders?.toLocaleString(), icon: '🛒' },
                      { label: 'Global Booking Revenue', value: `LKR ${(ov.globalRevenue || 0).toLocaleString()}`, icon: '💰' },
                      { label: 'New Signups This Month', value: ov.newUsersThisMonth?.toLocaleString(), icon: '🆕' },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{row.icon}</span>
                          <span className="text-sm text-gray-600 font-medium">{row.label}</span>
                        </div>
                        <span className="text-sm font-bold text-black font-display">{row.value || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── INSIGHT CALLOUTS ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Avg Revenue / Appointment',
                    value: ov.totalAppointments
                      ? `LKR ${Math.round((ov.globalRevenue || 0) / ov.totalAppointments).toLocaleString()}`
                      : 'N/A',
                    desc: 'Based on all completed appointments',
                    color: 'border-l-black',
                    bg: 'bg-black/5',
                  },
                  {
                    title: 'Saloon Verification Rate',
                    value: ov.totalSaloons ? `${Math.round((ov.verifiedSaloons / ov.totalSaloons) * 100)}%` : '0%',
                    desc: `${ov.pendingSaloons || 0} saloon${ov.pendingSaloons !== 1 ? 's' : ''} awaiting review`,
                    color: 'border-l-amber-500',
                    bg: 'bg-amber-50',
                  },
                  {
                    title: 'User Growth (MTD)',
                    value: ov.newUsersThisMonth?.toLocaleString() || '0',
                    desc: 'New registrations since 1st of this month',
                    color: 'border-l-green-500',
                    bg: 'bg-green-50',
                  },
                ].map(insight => (
                  <div key={insight.title} className={`${insight.bg} border border-black/10 border-l-4 ${insight.color} rounded-2xl p-5`}>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 font-condensed mb-2">{insight.title}</p>
                    <p className="font-display text-2xl font-bold text-black mb-1">{insight.value}</p>
                    <p className="text-xs text-gray-500 font-medium">{insight.desc}</p>
                  </div>
                ))}
              </div>
            </>
          )}
    </DashboardLayout>
  );
}
