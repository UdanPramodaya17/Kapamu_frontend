import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ShoppingBag, Scissors, ArrowUpRight, Check, Package, TrendingUp, User, Phone } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { appointmentAPI, orderAPI, authAPI } from '../../api';
import { format } from 'date-fns';
import { formatPrice } from '../../utils/format';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, selectAccessToken, setCredentials } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

const getBookingBadge = (status) => {
  const configs = {
    pending:   { bg: '#fffbeb', text: '#d97706', label: 'Pending' },
    confirmed: { bg: '#eff6ff', text: '#2563eb', label: 'Confirmed' },
    completed: { bg: '#f0fdf4', text: '#16a34a', label: 'Completed' },
    cancelled: { bg: '#fef2f2', text: '#dc2626', label: 'Cancelled' },
  };
  const c = configs[status] || configs.pending;
  return (
    <span style={{
      padding: '0.25rem 0.7rem', borderRadius: '50px',
      background: c.bg, color: c.text,
      fontSize: '0.6rem', fontWeight: 700,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      letterSpacing: '0.06em', textTransform: 'uppercase',
      flexShrink: 0,
    }}>{c.label}</span>
  );
};

const getOrderBadge = (status) => {
  const configs = {
    pending:    { bg: '#fffbeb', text: '#d97706', label: 'Pending' },
    processing: { bg: '#eff6ff', text: '#2563eb', label: 'Processing' },
    shipped:    { bg: '#fdf4ff', text: '#9333ea', label: 'Shipped' },
    delivered:  { bg: '#f0fdf4', text: '#16a34a', label: 'Delivered' },
    cancelled:  { bg: '#fef2f2', text: '#dc2626', label: 'Cancelled' },
  };
  const c = configs[status] || configs.pending;
  return (
    <span style={{
      padding: '0.25rem 0.7rem', borderRadius: '50px',
      background: c.bg, color: c.text,
      fontSize: '0.6rem', fontWeight: 700,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      letterSpacing: '0.06em', textTransform: 'uppercase',
      flexShrink: 0,
    }}>{c.label}</span>
  );
};

export default function CustomerDashboard() {
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectAccessToken);
  const dispatch = useDispatch();

  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!phone.trim() || !/^(?:\+94|94|0)7\d{8}$/.test(phone)) {
      toast.error('Please enter a valid Sri Lankan mobile number (e.g. 0771234567)');
      return;
    }
    setUpdating(true);
    try {
      const res = await authAPI.updateProfile({ name, phone });
      if (res.data.success) {
        dispatch(setCredentials({ user: res.data.data.user, accessToken: token }));
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    Promise.all([
      appointmentAPI.getMy({ limit: 5 }),
      orderAPI.getMy({ limit: 3 }),
    ])
      .then(([aptsRes, ordersRes]) => {
        setAppointments(aptsRes.data.data.appointments || []);
        setOrders(ordersRes.data.data.orders || []);
      })
      .catch((err) => {
        console.error('Error fetching dashboard data:', err);
        setAppointments([]);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const completedBookings = appointments.filter(a => a.status === 'completed').length;

  return (
    <DashboardLayout>

      {/* ── EYEBROW ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: '24px', height: '1px', background: 'rgba(0,0,0,0.15)' }} />
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)' }}>
          Client Space · Control Panel
        </span>
      </div>

      {/* ── PAGE HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '64px', height: '64px',
            borderRadius: '50%',
            background: '#000000',
            color: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800, fontSize: '1.5rem',
            overflow: 'hidden',
            flexShrink: 0,
            border: '2px solid rgba(0,0,0,0.1)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
          }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.name?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          <div>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              color: '#000000',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              margin: 0,
            }}>
              Welcome back,<br />
              <em style={{ fontStyle: 'italic', color: 'rgba(0,0,0,0.4)' }}>{user?.name?.split(' ')[0] || 'Guest'}</em>
            </h1>
          </div>
        </div>
        <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: '260px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Overview of your bookings, purchases, and style updates.
        </p>
      </div>

      {/* ── STAT TILES ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Bookings',
            value: appointments.length,
            icon: Calendar,
            iconBg: '#eff6ff',
            iconColor: '#2563eb',
          },
          {
            label: 'Completed',
            value: completedBookings,
            icon: Check,
            iconBg: '#f0fdf4',
            iconColor: '#16a34a',
          },
          {
            label: 'Orders Placed',
            value: orders.length,
            icon: Package,
            iconBg: '#fdf4ff',
            iconColor: '#9333ea',
          },
          {
            label: 'Total Spent',
            value: `LKR ${formatPrice(totalSpent)}`,
            icon: TrendingUp,
            iconBg: '#fffbeb',
            iconColor: '#d97706',
          },
        ].map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div style={{
              width: '40px', height: '40px',
              background: iconBg,
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              <Icon size={20} color={iconColor} />
            </div>
            <div>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: typeof value === 'string' ? '1.25rem' : '1.8rem', color: '#000', margin: 0, lineHeight: 1 }}>{value}</p>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', marginTop: '0.5rem' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── QUICK ACTIONS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Book Appointment', icon: Scissors, to: '/saloons', sub: 'Find & book salons' },
          { label: 'My Bookings', icon: Calendar, to: '/customer/bookings', sub: 'View all appointments' },
          { label: 'Browse Shop', icon: ShoppingBag, to: '/shop', sub: 'Premium grooming products' },
          { label: 'Order History', icon: Package, to: '/customer/orders', sub: 'Track your orders' },
        ].map(({ label, icon: Icon, to, sub }) => (
          <Link
            key={label}
            to={to}
            className="bg-white border border-black/10 rounded-2xl p-5 text-black hover:border-black/30 hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
            style={{ textDecoration: 'none' }}
          >
            <div className="flex justify-between items-center">
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <Icon size={18} />
              </div>
              <ArrowUpRight size={14} className="text-gray-400 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <div>
              <span className="block font-extrabold text-sm tracking-wide uppercase text-black" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</span>
              <span className="text-xs text-gray-400 font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{sub}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── RECENT DATA PANELS ── */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
          <div className="spinner" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000' }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Bookings */}
          <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-5 border-b border-black/5 flex items-center justify-between">
              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, fontSize: '1.1rem', color: '#000000',
                display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0,
              }}>
                <Calendar size={16} /> Recent Bookings
              </h3>
              <Link to="/customer/bookings" className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black transition" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", textDecoration: 'none' }}>View All →</Link>
            </div>

            <div className="p-4 sm:p-5 flex-1">
              {appointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'rgba(0,0,0,0.35)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <Calendar size={28} color="rgba(0,0,0,0.15)" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ fontSize: '0.85rem' }}>No active bookings</p>
                  <Link to="/saloons" className="btn-secondary" style={{ marginTop: '1rem', fontSize: '0.65rem' }}>Book Now</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {appointments.slice(0, 3).map(apt => (
                    <div key={apt._id} className="border border-black/10 p-3.5 sm:p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center shrink-0 shadow-sm">
                          <Scissors size={16} className="text-black" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-black font-extrabold text-sm sm:text-base leading-snug line-clamp-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>
                            {apt.saloon?.name || 'Saloon Appointment'}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            <span>{apt.date && format(new Date(apt.date), 'MMM d, yyyy')}</span>
                            <span>·</span>
                            <span>{apt.startTime}</span>
                            {apt.service?.name && (
                              <>
                                <span>·</span>
                                <span className="text-gray-700 font-bold line-clamp-1">{apt.service.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5">
                        {getBookingBadge(apt.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-5 border-b border-black/5 flex items-center justify-between">
              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, fontSize: '1.1rem', color: '#000000',
                display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0,
              }}>
                <ShoppingBag size={16} /> Recent Orders
              </h3>
              <Link to="/customer/orders" className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black transition" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", textDecoration: 'none' }}>View All →</Link>
            </div>

            <div className="p-4 sm:p-5 flex-1">
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'rgba(0,0,0,0.35)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <ShoppingBag size={28} color="rgba(0,0,0,0.15)" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ fontSize: '0.85rem' }}>No orders yet</p>
                  <Link to="/shop" className="btn-secondary" style={{ marginTop: '1rem', fontSize: '0.65rem' }}>Shop Now</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {orders.slice(0, 3).map(order => (
                    <div key={order._id} className="border border-black/10 p-3.5 sm:p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center shrink-0 shadow-sm">
                          <Package size={16} className="text-black" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-black font-extrabold text-sm sm:text-base leading-snug font-mono" style={{ margin: 0 }}>
                            #{order._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-500 font-semibold mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {order.items?.length || 1} {order.items?.length === 1 ? 'item' : 'items'} · <span className="text-black font-bold">LKR {formatPrice(order.totalAmount)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5">
                        {getOrderBadge(order.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Profile Settings */}
          <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm col-span-1 lg:col-span-2">
            <div className="p-5 border-b border-black/5">
              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, fontSize: '1.1rem', color: '#000000',
                display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0,
              }}>
                <User size={16} /> Personal Information
              </h3>
            </div>

            <div className="p-5 sm:p-6">
              <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white border border-black/10 rounded-xl text-sm font-medium text-black focus:outline-none focus:border-black transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="+94 77 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white border border-black/10 rounded-xl text-sm font-medium text-black focus:outline-none focus:border-black transition"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={updating}
                    className="btn-primary w-full sm:w-auto px-8 py-3 text-sm"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      )}
    </DashboardLayout>
  );
}
