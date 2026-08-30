import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Clock, User, Check, X, Search } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { saloonAPI, appointmentAPI } from '../../api';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

export default function SaloonBookingsPage() {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const appointmentIdParam = searchParams.get('appointmentId');

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saloonId, setSaloonId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dateParam || format(new Date(), 'yyyy-MM-dd'));
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (dateParam) {
      setSelectedDate(dateParam);
    }
  }, [dateParam]);

  useEffect(() => {
    saloonAPI.getMy()
      .then(res => setSaloonId(res.data.data.saloon._id))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!saloonId) return;
    fetchAppointments();
  }, [saloonId, selectedDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentAPI.getSaloonAppointments({
        saloonId,
        date: selectedDate,
        limit: 50,
      });
      setAppointments(res.data.data.appointments || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, cancelReason = '') => {
    setUpdatingId(id);
    try {
      await appointmentAPI.updateStatus(id, { status, cancelReason });
      toast.success(`Status updated to ${status}`);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const dateOptions = Array.from({ length: 30 }, (_, i) => {
    const d = addDays(new Date(), i - 5);
    return { value: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE'), date: format(d, 'd') };
  });

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-black">Bookings</h1>
        <p className="text-gray-500 mt-1 font-medium">Manage all salon appointments</p>
      </div>

      {/* Date picker */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1 no-scrollbar">
          {dateOptions.map(d => (
            <button
              key={d.value}
              onClick={() => setSelectedDate(d.value)}
              className={`flex-shrink-0 w-14 py-3 rounded-xl border text-center transition-all ${
                selectedDate === d.value
                  ? 'border-black bg-black text-white'
                  : 'border-black/10 bg-white hover:border-black/30'
              }`}
            >
              <p className={`text-xs ${selectedDate === d.value ? 'text-gray-300' : 'text-gray-500 font-medium'}`}>{d.label}</p>
              <p className={`text-lg font-bold mt-0.5 ${selectedDate === d.value ? 'text-white' : 'text-black'}`}>{d.date}</p>
            </button>
          ))}
        </div>
        <div className="flex-shrink-0 sm:border-l sm:border-black/10 sm:pl-3">
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-auto bg-white border border-black/10 rounded-xl px-4 py-3 text-black text-sm focus:border-black outline-none"
            title="Select specific date"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="spinner" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000000' }} />
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20 bg-white border border-black/10 rounded-2xl shadow-sm">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 font-medium">No appointments for this date</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-gray-500 text-sm mb-4 font-medium">{appointments.length} appointment{appointments.length !== 1 ? 's' : ''}</p>
          {appointments.map(apt => {
            const isTarget = apt._id === appointmentIdParam;
            return (
              <div
                key={apt._id}
                id={`appointment-${apt._id}`}
                className={`bg-white border rounded-2xl p-4 shadow-sm transition-all duration-300 ${
                  isTarget ? 'border-black ring-2 ring-black bg-zinc-50/80 shadow-md' : 'border-black/10'
                }`}
              >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Time */}
                <div className="w-20 text-left sm:text-center flex-shrink-0">
                  <p className="text-black font-extrabold text-lg">{apt.startTime}</p>
                  <p className="text-gray-500 text-xs font-semibold">{apt.endTime}</p>
                </div>

                {/* Customer */}
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <div className="w-10 h-10 bg-black/5 text-black border border-black/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {apt.customer?.avatar ? (
                      <img src={apt.customer.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-sm">{apt.customer?.name?.[0]?.toUpperCase() || 'C'}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex flex-col gap-0.5">
                    <p className="text-black font-bold text-sm truncate">{apt.customer?.name}</p>
                    <p className="text-gray-700 text-xs font-medium">📞 {apt.customer?.phone || 'No phone provided'}</p>
                    <p className="text-gray-700 text-xs font-medium truncate">✉️ {apt.customer?.email || 'No email provided'}</p>
                    <p className="text-black text-xs font-semibold mt-0.5">{apt.service?.name} — LKR {apt.service?.price}</p>
                  </div>
                </div>

                {/* Barber */}
                <div className="flex items-center gap-2 text-gray-700 text-xs font-semibold">
                  <User size={14} />
                  <span>{apt.barber?.user?.name || 'Any Barber'}</span>
                </div>

                {/* Status badge + quick actions */}
                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5">
                  <span className={`badge-${apt.status}`}>{apt.status}</span>

                  {apt.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
                        disabled={updatingId === apt._id}
                        className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 flex items-center justify-center transition-all"
                        title="Confirm"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Please enter a cancellation reason:');
                          if (reason !== null) {
                            handleStatusUpdate(apt._id, 'cancelled', reason);
                          }
                        }}
                        disabled={updatingId === apt._id}
                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 flex items-center justify-center transition-all"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </>
                  )}
                  {apt.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(apt._id, 'completed')}
                      disabled={updatingId === apt._id}
                      className="px-3 py-1.5 text-xs rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 transition-all font-semibold"
                    >
                      Mark Done
                    </button>
                  )}
                </div>
              </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
