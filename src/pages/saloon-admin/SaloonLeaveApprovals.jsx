import React, { useEffect, useState } from 'react';
import { Check, X, Clock, Calendar as CalendarIcon, User } from 'lucide-react';
import { saloonAPI, barberAPI } from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

export default function SaloonLeaveApprovals() {
  const [saloon, setSaloon] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const saloonRes = await saloonAPI.getMy();
      const mySaloon = saloonRes.data.data.saloon;
      setSaloon(mySaloon);

      const barbersRes = await saloonAPI.getBarbers(mySaloon._id);
      setBarbers(barbersRes.data.data.barbers || []);
    } catch (err) {
      toast.error('Failed to load leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusUpdate = async (barberId, leaveId, status) => {
    try {
      await barberAPI.updateLeaveStatus(barberId, leaveId, { status });
      toast.success(`Leave request ${status}.`);
      fetchData(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update leave status.');
    }
  };

  // Flatten all leaves into an array with barber info
  const allLeaves = barbers.flatMap(b => 
    (b.leaveSchedule || []).map(leave => ({
      ...leave,
      barberId: b._id,
      barberName: b.user?.name || 'Unknown',
      barberAvatar: b.user?.avatar,
    }))
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  const pendingLeaves = allLeaves.filter(l => l.status === 'pending');
  const pastLeaves = allLeaves.filter(l => l.status !== 'pending');

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="spinner" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000000' }} />
          <span className="ml-3 text-gray-500 font-medium">Loading requests...</span>
        </div>
      ) : (
        <div className="max-w-5xl">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold font-display text-black mb-2">Leave Requests</h1>
              <p className="text-gray-500 font-medium">Manage time-off requests from your barbers.</p>
            </div>
            <div className="bg-black/5 border border-black/10 px-4 py-2 rounded-xl">
              <span className="text-black font-bold uppercase tracking-wider font-condensed text-xs">Pending: {pendingLeaves.length}</span>
            </div>
          </div>

          <div className="space-y-8">
            {/* Pending Section */}
            <section>
              <h2 className="text-lg font-bold font-display text-black mb-4 flex items-center gap-2">
                <Clock size={18} className="text-yellow-600" />
                Pending Approvals
              </h2>
              {pendingLeaves.length === 0 ? (
                <div className="bg-white border border-dashed border-black/10 rounded-2xl p-8 text-center">
                  <p className="text-gray-500 font-medium">No pending leave requests.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingLeaves.map(leave => (
                    <div key={leave._id} className="bg-white border border-black/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center border border-black/10 overflow-hidden shrink-0">
                          {leave.barberAvatar ? (
                            <img src={leave.barberAvatar} alt={leave.barberName} className="w-full h-full object-cover" />
                          ) : (
                            <User size={20} className="text-gray-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-black font-bold">{leave.barberName}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-700 mt-1 font-semibold flex-wrap">
                            <span className="flex items-center gap-1"><CalendarIcon size={14} /> {new Date(leave.date).toLocaleDateString()}</span>
                            {leave.isFullDay ? (
                              <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs">Full Day</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs">{leave.startTime} - {leave.endTime}</span>
                            )}
                          </div>
                          {leave.reason && (
                            <p className="text-sm text-gray-500 mt-2 italic font-medium">"{leave.reason}"</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <button 
                          onClick={() => handleStatusUpdate(leave.barberId, leave._id, 'rejected')}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                        >
                          <X size={16} /> Reject
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(leave.barberId, leave._id, 'approved')}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-colors"
                        >
                          <Check size={16} /> Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Actioned Section */}
            {pastLeaves.length > 0 && (
              <section>
                <h2 className="text-lg font-bold font-display text-black mb-4">Past Requests</h2>
                <div className="grid gap-3">
                  {pastLeaves.slice(0, 10).map(leave => (
                    <div key={leave._id} className="bg-white border border-black/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm opacity-90">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-black text-sm font-bold min-w-[120px]">{leave.barberName}</span>
                        <span className="text-gray-700 text-sm font-medium">{new Date(leave.date).toLocaleDateString()}</span>
                        <span className="text-gray-500 text-xs hidden md:block max-w-xs truncate">{leave.reason || 'No reason'}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded border text-xs font-semibold uppercase tracking-wider font-condensed w-fit ${
                        leave.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {leave.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
