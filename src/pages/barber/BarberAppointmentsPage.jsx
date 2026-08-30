import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar, Clock, Check, X, Search, Filter, User,
  Phone, Mail, CheckCircle2, AlertCircle, Scissors, ArrowUpDown, ChevronDown
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { appointmentAPI } from '../../api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { id: 'all', label: 'All Bookings' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'no_show', label: 'No Show' },
];

export default function BarberAppointmentsPage() {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const appointmentIdParam = searchParams.get('appointmentId');

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(dateParam || 'all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (dateParam) {
      setDateFilter(dateParam);
    }
  }, [dateParam]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (dateFilter !== 'all') {
        params.date = dateFilter;
      }
      const res = await appointmentAPI.getBarberSchedule(params);
      setAppointments(res.data.data.appointments || []);
    } catch (err) {
      console.error('Failed to fetch barber appointments:', err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [dateFilter]);

  const handleStatusUpdate = async (id, status, cancelReason = '') => {
    setUpdatingId(id);
    try {
      await appointmentAPI.updateStatus(id, { status, cancelReason });
      toast.success(`Booking status updated to ${status.replace('_', ' ')}`);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      // Tab filter
      if (activeTab !== 'all' && apt.status !== activeTab) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const clientName = (apt.customer?.name || '').toLowerCase();
        const clientPhone = (apt.customer?.phone || '').toLowerCase();
        const clientEmail = (apt.customer?.email || '').toLowerCase();
        const serviceName = (apt.service?.name || '').toLowerCase();
        return (
          clientName.includes(query) ||
          clientPhone.includes(query) ||
          clientEmail.includes(query) ||
          serviceName.includes(query)
        );
      }
      return true;
    });
  }, [appointments, activeTab, searchTerm]);

  // Counts by status
  const counts = useMemo(() => {
    const map = { all: appointments.length };
    STATUS_TABS.forEach(t => {
      if (t.id !== 'all') {
        map[t.id] = appointments.filter(a => a.status === t.id).length;
      }
    });
    return map;
  }, [appointments]);

  return (
    <DashboardLayout>
      {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-black">Appointments Hub</h1>
            <p className="text-gray-500 mt-1 font-medium">Manage, search, and track all your customer appointments</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 bg-black text-white rounded-full font-condensed uppercase tracking-wider">
              {appointments.length} Total Records
            </span>
          </div>
        </div>

        {/* Top Control Bar: Search & Date Filters */}
        <div className="bg-white border border-black/10 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client name, phone, email, or service..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-black/10 rounded-xl text-sm outline-none focus:border-black transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Date Range Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative">
              <input
                type="date"
                value={dateFilter === 'all' ? '' : dateFilter}
                onChange={e => setDateFilter(e.target.value || 'all')}
                className="bg-gray-50 border border-black/10 rounded-xl px-3 py-2 text-sm text-black outline-none focus:border-black"
                title="Filter by specific date"
              />
            </div>
            {dateFilter !== 'all' && (
              <button
                onClick={() => setDateFilter('all')}
                className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                Reset Date
              </button>
            )}
          </div>
        </div>

        {/* Status Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {STATUS_TABS.map(tab => {
            const isSelected = activeTab === tab.id;
            const count = counts[tab.id] || 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white border border-black/10 text-gray-700 hover:border-black/30'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-black/5 text-gray-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28">
            <div className="spinner mb-3" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000000' }} />
            <p className="text-gray-500 text-sm font-medium">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white border border-black/10 rounded-2xl p-12 text-center shadow-sm">
            <Calendar size={44} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-bold text-gray-800 text-lg">No appointments found</h3>
            <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
              {searchTerm
                ? `No bookings matched your search query "${searchTerm}".`
                : activeTab !== 'all'
                ? `You have no ${activeTab} appointments.`
                : 'You have no scheduled appointments yet.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map(apt => {
              const aptDateFormatted = format(new Date(apt.date), 'EEEE, MMMM d, yyyy');
              const isTarget = apt._id === appointmentIdParam;
              return (
                <div
                  key={apt._id}
                  id={`appointment-${apt._id}`}
                  className={`bg-white border rounded-2xl p-5 shadow-sm transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                    isTarget ? 'border-black ring-2 ring-black bg-zinc-50/80 shadow-md' : 'border-black/10 hover:border-black/20'
                  }`}
                >
                  {/* Left: Client & Service Details */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Customer Avatar */}
                    <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-base overflow-hidden flex-shrink-0 border border-black/10">
                      {apt.customer?.avatar ? (
                        <img src={apt.customer.avatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        apt.customer?.name?.[0]?.toUpperCase() || 'C'
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-black text-base truncate">
                          {apt.customer?.name || 'Walk-in Client'}
                        </h3>
                        <span className={`badge-${apt.status} shrink-0`}>
                          {apt.status}
                        </span>
                      </div>

                      {/* Service Info */}
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                        <Scissors size={14} className="text-gray-500" />
                        <span>{apt.service?.name}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-black font-bold">LKR {apt.service?.price?.toLocaleString()}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500 text-xs font-mono">{apt.service?.duration} min</span>
                      </div>

                      {/* Contact Channels */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        {apt.customer?.phone && (
                          <a
                            href={`tel:${apt.customer.phone}`}
                            className="flex items-center gap-1 hover:text-black transition"
                          >
                            <Phone size={12} /> {apt.customer.phone}
                          </a>
                        )}
                        {apt.customer?.email && (
                          <a
                            href={`mailto:${apt.customer.email}`}
                            className="flex items-center gap-1 hover:text-black transition"
                          >
                            <Mail size={12} /> {apt.customer.email}
                          </a>
                        )}
                        {apt.notes && (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200">
                            Note: {apt.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Scheduled Slot */}
                  <div className="bg-gray-50/80 border border-black/5 rounded-xl p-3.5 flex lg:flex-col justify-between items-center lg:items-start min-w-[200px] shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold mb-1">
                      <Calendar size={13} />
                      <span>{aptDateFormatted}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-black font-mono">
                      <Clock size={14} className="text-gray-400" />
                      <span>{apt.startTime} - {apt.endTime}</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 justify-end shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-black/5">
                    {apt.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
                          disabled={updatingId === apt._id}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
                        >
                          <Check size={14} /> Confirm
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Please enter cancellation reason for the client:');
                            if (reason !== null) {
                              handleStatusUpdate(apt._id, 'cancelled', reason);
                            }
                          }}
                          disabled={updatingId === apt._id}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-semibold text-xs transition flex items-center gap-1.5"
                        >
                          <X size={14} /> Cancel
                        </button>
                      </>
                    )}

                    {apt.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(apt._id, 'completed')}
                          disabled={updatingId === apt._id}
                          className="px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-xl font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2 size={14} /> Mark Completed
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(apt._id, 'no_show')}
                          disabled={updatingId === apt._id}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs transition"
                          title="Client did not show up"
                        >
                          No Show
                        </button>
                      </>
                    )}

                    {apt.status === 'completed' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
                        <CheckCircle2 size={14} /> Service Fulfilled
                      </span>
                    )}

                    {apt.status === 'cancelled' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
                        <AlertCircle size={14} /> Cancelled
                      </span>
                    )}

                    {apt.status === 'no_show' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
                        No Show
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </DashboardLayout>
  );
}
