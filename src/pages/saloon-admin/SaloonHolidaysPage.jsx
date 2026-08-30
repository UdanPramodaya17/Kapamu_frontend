import React, { useEffect, useState } from 'react';
import { Calendar, Trash2, Plus, AlertCircle } from 'lucide-react';
import { saloonAPI } from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

export default function SaloonHolidaysPage() {
  const [saloon, setSaloon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  const fetchSaloon = async () => {
    try {
      const res = await saloonAPI.getMy();
      setSaloon(res.data.data.saloon);
    } catch (err) {
      toast.error('Failed to fetch saloon data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSaloon(); }, []);

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!date) return toast.error('Please select a date.');
    
    setIsSubmitting(true);
    try {
      const res = await saloonAPI.addHoliday({ date, reason });
      setSaloon(res.data.data.saloon);
      toast.success('Holiday added successfully!');
      setDate('');
      setReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add holiday.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    if (!window.confirm('Are you sure you want to remove this holiday?')) return;
    
    try {
      const res = await saloonAPI.removeHoliday(holidayId);
      setSaloon(res.data.data.saloon);
      toast.success('Holiday removed.');
    } catch (err) {
      toast.error('Failed to remove holiday.');
    }
  };

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="spinner" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000000' }} />
          <span className="ml-3 text-gray-500 font-medium">Loading holidays...</span>
        </div>
      ) : !saloon ? (
        <div className="flex items-center justify-center py-20">
          <span className="text-red-600 font-bold">Saloon not found.</span>
        </div>
      ) : (
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-display text-black mb-2">Saloon Holidays</h1>
            <p className="text-gray-500 font-medium">Manage closing dates for your entire saloon. Customers won't be able to book appointments on these days.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Add Holiday Form */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-2 font-display">
                  <Plus size={18} className="text-black"/>
                  Add New Holiday
                </h2>
                <form onSubmit={handleAddHoliday} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-black outline-none focus:border-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Reason (Optional)</label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. Public Holiday"
                      className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-black outline-none focus:border-black"
                    />
                  </div>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex gap-2 items-start mt-2">
                    <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 font-medium">Adding a holiday will not automatically cancel existing bookings. You must cancel them manually.</p>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary py-2.5"
                  >
                    {isSubmitting ? 'Adding...' : 'Mark as Closed'}
                  </button>
                </form>
              </div>
            </div>

            {/* Existing Holidays */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-2 font-display">
                  <Calendar size={18} className="text-black"/>
                  Upcoming Holidays
                </h2>

                {(!saloon.holidays || saloon.holidays.length === 0) ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-black/10">
                    <p className="text-gray-500 font-medium">No holidays scheduled.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {saloon.holidays
                      .sort((a, b) => new Date(a.date) - new Date(b.date))
                      .map((holiday) => (
                      <div key={holiday._id} className="flex items-center justify-between p-4 bg-white border border-black/10 rounded-xl hover:border-black/30 transition-colors shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-black/5 rounded-xl flex flex-col items-center justify-center border border-black/10">
                            <span className="text-[10px] text-black font-bold uppercase font-condensed">
                              {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span className="text-sm text-black font-extrabold">
                              {new Date(holiday.date).toLocaleDateString('en-US', { day: 'numeric' })}
                            </span>
                          </div>
                          <div>
                            <p className="text-black font-bold">{holiday.reason || 'Closed'}</p>
                            <p className="text-sm text-gray-500 font-medium">{new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteHoliday(holiday._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors"
                          title="Remove Holiday"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
