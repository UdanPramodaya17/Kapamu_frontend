import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Users, Building2, Calendar, DollarSign, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import { analyticsAPI } from '../../api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#000000', '#4b5563', '#9ca3af', '#d1d5db', '#e5e7eb'];

export default function SuperAdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getGlobal()
      .then(res => setAnalytics(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = analytics ? [
    { icon: Users, label: 'Total Users', value: analytics.overview.totalUsers.toLocaleString(), color: 'text-black bg-black/5 border-black/10' },
    { icon: Building2, label: 'Total Saloons', value: analytics.overview.totalSaloons.toLocaleString(), color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { icon: Calendar, label: 'Total Appointments', value: analytics.overview.totalAppointments.toLocaleString(), color: 'text-green-700 bg-green-50 border-green-200' },
    { icon: DollarSign, label: 'Global Revenue', value: `LKR ${(analytics.overview.globalRevenue / 1000).toFixed(1)}K`, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  ] : [];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-black">Super Admin Dashboard</h1>
        <p className="text-gray-500 mt-1 font-medium">Platform-wide overview and management</p>
      </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000000' }} />
            <span className="ml-3 text-gray-500 font-medium">Loading analytics...</span>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
              {stats.map((s) => (
                <div key={s.label} className="bg-white p-5 border border-black/10 rounded-2xl flex flex-col shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${s.color}`}>
                      <s.icon size={20} />
                    </div>
                  </div>
                  <p className="font-display text-2xl font-bold text-black mb-1">{s.value}</p>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider font-condensed">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Additional stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Verified Saloons', value: analytics?.overview.verifiedSaloons, icon: CheckCircle, color: 'text-green-600' },
                { label: 'Pending Approval', value: analytics?.overview.pendingSaloons, icon: Clock, color: 'text-yellow-600' },
                { label: 'New Users This Month', value: analytics?.overview.newUsersThisMonth, icon: TrendingUp, color: 'text-blue-600' },
                { label: 'Total Orders', value: analytics?.overview.totalOrders, icon: DollarSign, color: 'text-black' },
              ].map((item) => (
                <div key={item.label} className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon size={16} className={item.color} />
                    <span className="text-xs text-gray-500 font-semibold">{item.label}</span>
                  </div>
                  <p className="text-2xl font-bold font-display text-black">{item.value?.toLocaleString() || 0}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Monthly Users Chart */}
              <div className="lg:col-span-2 bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
                <h3 className="text-black font-bold font-display text-lg mb-6">User Growth (Last 6 Months)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={analytics?.monthlyUsers || []}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#000000" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="_id" stroke="#9ca3af" tick={{ fill: '#4b5563', fontSize: 11 }} />
                    <YAxis stroke="#9ca3af" tick={{ fill: '#4b5563', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '12px', color: '#000' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#000000" fill="url(#colorUsers)" strokeWidth={2} name="New Users" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Role Breakdown */}
              <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
                <h3 className="text-black font-bold font-display text-lg mb-6">User Roles</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={analytics?.roleBreakdown || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="count"
                      nameKey="_id"
                    >
                      {(analytics?.roleBreakdown || []).map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '12px', color: '#000' }}
                      formatter={(v, n) => [v, n]}
                    />
                    <Legend
                      formatter={(value) => <span style={{ color: '#4b5563', fontSize: '12px', fontWeight: 500 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
    </DashboardLayout>
  );
}
