import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Check, X, Plus } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { appointmentAPI, barberAPI } from '../../api';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';

export default function BarberSchedulePage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ date: format(new Date(), 'yyyy-MM-dd'), isFullDay: true, startTime: '09:00', endTime: '18:00', reason: '' });
  const [savingLeave, setSavingLeave] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await appointmentAPI.getBarberSchedule({ date: selectedDate });
      setAppointments(res.data.data.appointments || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, cancelReason = '') => {
    try {
      await appointmentAPI.updateStatus(id, { status, cancelReason });
      toast.success('Status updated');
      fetchSchedule();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleMarkLeave = async () => {
    setSavingLeave(true);
    try {
      const barberRes = await barberAPI.getMe();
      const barberId = barberRes.data.data.barber._id;
      await barberAPI.markLeave(barberId, leaveForm);
      toast.success('Leave marked successfully');
      setShowLeaveModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark leave');
    } finally {
      setSavingLeave(false);
    }
  };

  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i);
    return { value: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE'), date: format(d, 'd') };
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-black">My Schedule</h1>
          <p className="text-gray-500 mt-1">View and manage your appointments</p>
        </div>
        <button
          onClick={() => setShowLeaveModal(true)}
          className="btn-secondary flex items-center gap-2 text-sm py-2.5 px-4 w-full sm:w-auto"
        >
          <Plus size={16} /> Mark Leave
        </button>
      </div>

      {/* Date bar */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
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
            <p className={`text-xs ${selectedDate === d.value ? 'text-gray-300' : 'text-gray-500'}`}>{d.label}</p>
            <p className={`text-lg font-bold mt-0.5 ${selectedDate === d.value ? 'text-white' : 'text-gray-900'}`}>{d.date}</p>
          </button>
        ))}
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="spinner" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000000' }} />
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20 bg-white border border-black/10 rounded-2xl shadow-sm">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-900 font-bold">No appointments for this day</p>
          <p className="text-gray-500 text-sm mt-1">Enjoy your free time!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-gray-500 text-sm">{appointments.length} appointment{appointments.length !== 1 ? 's' : ''}</p>
          {appointments.map(apt => (
            <div key={apt._id} className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Time */}
                <div className="w-16 text-center flex-shrink-0 border-r border-black/10 pr-3">
                  <p className="text-black font-extrabold text-sm">{apt.startTime}</p>
                  <p className="text-gray-500 text-xs">{apt.endTime}</p>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-[200px]">
                  <p className="text-black font-bold text-sm">{apt.customer?.name}</p>
                  <p className="text-gray-600 text-xs">{apt.service?.name} · LKR {apt.service?.price}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge-${apt.status}`}>{apt.status}</span>
                    {apt.customer?.phone && (
                      <span className="text-gray-500 text-xs">📞 {apt.customer.phone}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5">
                  {apt.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
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
                      className="px-3 py-1.5 text-xs rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 transition-all font-semibold"
                    >
                      Mark Done
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mark Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-black/10 rounded-3xl p-6 w-full max-w-md animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-black font-bold font-display text-lg mb-5">Mark Leave / Unavailability</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5 font-semibold">Date</label>
                <input type="date" value={leaveForm.date} onChange={e => setLeaveForm(p => ({...p, date: e.target.value}))} className="input-field" />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="fullday"
                  checked={leaveForm.isFullDay}
                  onChange={e => setLeaveForm(p => ({...p, isFullDay: e.target.checked}))}
                  className="w-4 h-4 accent-black"
                />
                <label htmlFor="fullday" className="text-gray-800 text-sm font-medium">Full day leave</label>
              </div>
              {!leaveForm.isFullDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5 font-semibold">From</label>
                    <input type="time" value={leaveForm.startTime} onChange={e => setLeaveForm(p => ({...p, startTime: e.target.value}))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5 font-semibold">To</label>
                    <input type="time" value={leaveForm.endTime} onChange={e => setLeaveForm(p => ({...p, endTime: e.target.value}))} className="input-field" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-600 mb-1.5 font-semibold">Reason (optional)</label>
                <input value={leaveForm.reason} onChange={e => setLeaveForm(p => ({...p, reason: e.target.value}))} className="input-field" placeholder="e.g. Personal, Medical" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowLeaveModal(false)} className="btn-secondary flex-1 text-sm py-2.5">Cancel</button>
                <button onClick={handleMarkLeave} disabled={savingLeave} className="btn-primary flex-1 text-sm py-2.5">
                  {savingLeave ? <span className="flex items-center justify-center gap-2"><div className="spinner w-4 h-4 border-t-white" /> Saving...</span> : 'Mark Leave'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
