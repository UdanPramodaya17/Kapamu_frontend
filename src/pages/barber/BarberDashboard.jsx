import React, { useEffect, useState } from 'react';
import { Calendar, Clock, TrendingUp, DollarSign, Star, Check, X, Settings } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { analyticsAPI, appointmentAPI, barberAPI } from '../../api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function BarberDashboard() {
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [todayApts, setTodayApts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDashboardData = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    try {
      const [analyticsRes, scheduleRes, profileRes] = await Promise.all([
        analyticsAPI.getBarber(),
        appointmentAPI.getBarberSchedule({ date: today }),
        barberAPI.getMe(),
      ]);
      setAnalytics(analyticsRes.data.data);
      setTodayApts(scheduleRes.data.data.appointments || []);
      setProfile(profileRes.data.data.barber);
    } catch (err) {
      console.error('Error fetching barber dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    setUpdatingId(id);
    try {
      await appointmentAPI.updateStatus(id, { status });
      toast.success(`Booking status updated to ${status.replace('_', ' ')}`);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingAppointments = todayApts.filter(apt => apt.status === 'pending').length;

  const stats = analytics ? [
    { icon: Calendar, label: 'Total Bookings', value: analytics.overview.totalAppointments || 0, color: 'text-black bg-black/5 border-black/10' },
    { icon: TrendingUp, label: 'Completed (30d)', value: analytics.overview.totalCompleted || 0, color: 'text-green-700 bg-green-50 border-green-200' },
    { icon: DollarSign, label: 'Earnings (30d)', value: `LKR ${analytics.overview.totalEarnings?.toLocaleString() || 0}`, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { icon: Clock, label: "Today's Pending", value: pendingAppointments, color: 'text-purple-700 bg-purple-50 border-purple-200' },
  ] : [];

  return (
    <DashboardLayout>
      {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="spinner mb-3" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000000' }} />
            <p className="text-gray-500 text-sm">Loading dashboard details...</p>
          </div>
        ) : (
          <>
            {/* Header Greeting & Profile Card */}
            <div className="bg-white border border-black/10 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
              <div className="w-20 h-20 rounded-full bg-black/5 text-black flex items-center justify-center font-bold text-3xl overflow-hidden flex-shrink-0 border border-black/10">
                {profile?.avatar || profile?.user?.avatar ? (
                  <img src={profile.avatar || profile.user.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  profile?.user?.name?.[0]?.toUpperCase()
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2 justify-center md:justify-start">
                  <h2 className="font-display text-2xl font-bold text-black">
                    Welcome back, {profile?.user?.name || 'Barber'}!
                  </h2>
                  <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider font-condensed ${
                    profile?.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {profile?.isActive ? 'On Duty' : 'Off Duty'}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-3 font-medium">
                  {profile?.saloon?.name ? `💈 Stylist at ${profile.saloon.name}` : 'Barber Profile'}
                  {profile?.saloon?.address && ` · ${profile.saloon.address}`}
                </p>
                {profile?.specializations?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                    {profile.specializations.map((spec, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 bg-black/5 border border-black/10 text-gray-700 rounded font-semibold font-condensed uppercase tracking-wider">
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 text-center md:text-right text-gray-500 text-xs">
                <p className="flex items-center gap-1.5 justify-center md:justify-end text-sm text-black font-semibold mb-1">
                  <Clock size={14} className="text-black" />
                  Today's Date
                </p>
                <p className="font-mono font-medium">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
              {stats.map(s => (
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

            {/* Middle Section: Today's Schedule & Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              
              {/* Today's Schedule Timeline */}
              <div className="lg:col-span-2 bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
                <h3 className="text-black font-bold font-display text-lg mb-6 flex items-center gap-2">
                  <Calendar size={18} className="text-black" />
                  Today's Appointments
                  <span className="ml-auto text-xs text-black font-semibold px-2.5 py-0.5 rounded bg-black/5 border border-black/10 font-mono">
                    {todayApts.length} active
                  </span>
                </h3>

                {todayApts.length === 0 ? (
                  <div className="text-center py-14 text-gray-400 border border-dashed border-black/10 rounded-xl bg-gray-50/50">
                    <Calendar size={36} className="mx-auto mb-3 opacity-30 text-gray-500" />
                    <p className="font-semibold text-gray-500">No appointments scheduled for today</p>
                    <p className="text-xs text-gray-400 mt-1">Enjoy your free time or prepare for upcoming slots.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayApts.map(apt => (
                      <div key={apt._id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/30 border border-black/5 hover:border-black/10 hover:bg-gray-50/80 transition-all flex-wrap sm:flex-nowrap">
                        {/* Time */}
                        <div className="w-16 flex-shrink-0 text-center border-r border-black/10 pr-4">
                          <p className="text-black font-bold text-sm font-mono">{apt.startTime}</p>
                          <p className="text-gray-500 text-xs font-mono">{apt.endTime}</p>
                        </div>

                        {/* Customer & Service */}
                        <div className="flex-1 min-w-0 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0 border border-black/10">
                            {apt.customer?.avatar ? (
                              <img src={apt.customer.avatar} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                              apt.customer?.name?.[0]?.toUpperCase() || 'C'
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-black font-bold truncate text-sm">{apt.customer?.name || 'Walk-in Client'}</p>
                              <span className={`badge-${apt.status} shrink-0`}>{apt.status}</span>
                            </div>
                            <p className="text-gray-700 text-xs font-semibold mt-1">
                              {apt.service?.name} · LKR {apt.service?.price?.toLocaleString()}
                            </p>
                            <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
                              {apt.customer?.phone && <span className="truncate">📞 {apt.customer.phone}</span>}
                              {apt.customer?.email && <span className="truncate hidden md:inline">✉️ {apt.customer.email}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Quick Interactive Actions */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start pt-3 sm:pt-0 border-t sm:border-t-0 border-black/5 sm:pl-2 shrink-0">
                          {apt.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
                                disabled={updatingId === apt._id}
                                className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 flex items-center justify-center transition-all border border-green-200"
                                title="Confirm Appointment"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(apt._id, 'cancelled')}
                                disabled={updatingId === apt._id}
                                className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 flex items-center justify-center transition-all border border-red-200"
                                title="Cancel Appointment"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}

                          {apt.status === 'confirmed' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(apt._id, 'completed')}
                                disabled={updatingId === apt._id}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-all border border-green-200"
                              >
                                Mark Done
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(apt._id, 'no_show')}
                                disabled={updatingId === apt._id}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all border border-gray-200"
                                title="Client No Show"
                              >
                                No Show
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Breakdown Panel */}
              <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
                <h3 className="text-black font-bold font-display text-lg mb-6 flex items-center gap-2">
                  <TrendingUp size={18} className="text-black" />
                  Booking Breakdown
                </h3>
                
                <div className="space-y-4">
                  {['completed', 'confirmed', 'pending', 'cancelled', 'no_show'].map(status => {
                    const found = analytics?.statusBreakdown?.find(item => item._id === status);
                    const count = found ? found.count : 0;
                    const total = analytics?.statusBreakdown?.reduce((sum, item) => sum + item.count, 0) || 1;
                    const percent = Math.round((count / total) * 100);
                    
                    const colorClasses = {
                      completed: 'bg-black border-black/20',
                      confirmed: 'bg-gray-600 border-gray-600/20',
                      pending: 'bg-amber-500 border-amber-500/20',
                      cancelled: 'bg-red-500 border-red-500/20',
                      no_show: 'bg-gray-400 border-gray-400/20'
                    };
                    const colorClass = colorClasses[status] || 'bg-black';
                    
                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className={`badge-${status}`}>{status.replace('_', ' ')}</span>
                          <span className="text-gray-500 font-mono">{count} ({percent}%)</span>
                        </div>
                        <div className="h-1.5 bg-black/5 rounded-full overflow-hidden w-full border border-black/5">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions & Leaves Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Quick Navigation Panel */}
              <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
                <h3 className="text-black font-bold font-display text-lg mb-4">Quick Navigation</h3>
                <div className="grid grid-cols-3 gap-3">
                  <a 
                    href="/barber/appointments" 
                    className="flex flex-col gap-1.5 p-4 rounded-xl bg-gray-50/50 border border-black/5 hover:border-black/15 transition-all hover:bg-gray-50"
                  >
                    <Clock size={20} className="text-black" />
                    <span className="text-xs font-bold text-black font-display">Appointments</span>
                    <span className="text-[10px] text-gray-500 font-medium">All booking history</span>
                  </a>
                  <a 
                    href="/barber/schedule" 
                    className="flex flex-col gap-1.5 p-4 rounded-xl bg-gray-50/50 border border-black/5 hover:border-black/15 transition-all hover:bg-gray-50"
                  >
                    <Calendar size={20} className="text-black" />
                    <span className="text-xs font-bold text-black font-display">My Schedule</span>
                    <span className="text-[10px] text-gray-500 font-medium">Time slots & leaves</span>
                  </a>
                  <a 
                    href="/barber/settings" 
                    className="flex flex-col gap-1.5 p-4 rounded-xl bg-gray-50/50 border border-black/5 hover:border-black/15 transition-all hover:bg-gray-50"
                  >
                    <Settings size={20} className="text-black" />
                    <span className="text-xs font-bold text-black font-display">Settings</span>
                    <span className="text-[10px] text-gray-500 font-medium">Photo & portfolio</span>
                  </a>
                </div>
              </div>

              {/* Working Hours & Leaves Panel */}
              <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
                <h3 className="text-black font-bold font-display text-lg mb-4 flex items-center justify-between">
                  <span>Leaves & Off-Days</span>
                  <a href="/barber/schedule" className="text-xs text-black font-bold hover:underline font-display">Mark Leave</a>
                </h3>

                {profile?.leaveSchedule?.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-500">
                    No leave or unavailability scheduled.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
                    {profile?.leaveSchedule?.slice(0, 3).map((leave, i) => (
                      <div key={i} className="flex justify-between items-center py-2.5 px-3 bg-gray-50/50 border border-black/5 rounded-lg text-xs">
                        <div>
                          <p className="text-black font-bold">
                            {leave.date ? format(new Date(leave.date), 'EEEE, MMM d, yyyy') : 'Leave Date'}
                          </p>
                          <p className="text-gray-500 text-[10px] mt-0.5 font-medium">
                            {leave.isFullDay ? 'Full Day' : `${leave.startTime} - ${leave.endTime}`}
                            {leave.reason && ` · "${leave.reason}"`}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-condensed ${
                          leave.status === 'approved' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : leave.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
      )}
    </DashboardLayout>
  );
}
