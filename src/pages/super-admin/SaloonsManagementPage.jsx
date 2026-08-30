import React, { useEffect, useState } from 'react';
import { Building2, Plus, Search, X, Trash2, Ban, CheckCircle, Flame, Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { saloonAPI, authAPI } from '../../api';

export default function SaloonsManagementPage() {
  const [saloons, setSaloons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingSaloonData, setPendingSaloonData] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchSaloons = async () => {
    try {
      setLoading(true);
      const res = await saloonAPI.getAll({ limit: 50, all: 'true' });
      setSaloons(res.data.data.saloons);
    } catch (err) {
      toast.error('Failed to fetch saloons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaloons();
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        saloonName: data.saloonName,
        address: { city: data.city, street: data.street },
        ownerName: data.ownerName,
        ownerEmail: data.ownerEmail,
        ownerPassword: Math.random().toString(36).slice(-10) + 'Aa1@', // Dummy strong password
        ownerPhone: data.ownerPhone || '',
      };

      // Owner ge email ekata OTP eka yawanna
      await authAPI.sendVerification({ email: payload.ownerEmail });

      setPendingSaloonData(payload);
      setShowOtpModal(true);
      toast.success(`Verification code sent to ${payload.ownerEmail}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAndCreate = async () => {
    if (!otp || otp.length !== 6) {
      return toast.error('Please enter a valid 6-digit OTP');
    }

    try {
      setIsSubmitting(true);
      await authAPI.verifyCode({ email: pendingSaloonData.ownerEmail, code: otp });

      await saloonAPI.create(pendingSaloonData);
      await authAPI.sendSetupPassword({ email: pendingSaloonData.ownerEmail });

      toast.success('Saloon created & Password setup link sent to owner!');
      setShowOtpModal(false);
      setIsModalOpen(false);
      setPendingSaloonData(null);
      setOtp('');
      reset();
      fetchSaloons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP or creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to completely delete this saloon? This action cannot be undone.')) return;
    try {
      await saloonAPI.delete(id);
      toast.success('Saloon deleted successfully');
      fetchSaloons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete saloon');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus ? 'block' : 'unblock';
    if (!window.confirm(`Are you sure you want to ${action} this saloon?`)) return;
    try {
      await saloonAPI.toggleStatus(id);
      toast.success(`Saloon ${currentStatus ? 'blocked' : 'unblocked'} successfully`);
      fetchSaloons();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} saloon`);
    }
  };

  const handleToggleRecommended = async (id) => {
    try {
      await saloonAPI.toggleRecommended(id);
      toast.success('Recommended status updated successfully');
      fetchSaloons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle recommended status');
    }
  };

  const handleToggleTrending = async (id) => {
    try {
      await saloonAPI.toggleTrending(id);
      toast.success('Trending status updated successfully');
      fetchSaloons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle trending status');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-black">Manage Saloons</h1>
          <p className="text-gray-500 mt-1 font-medium">Add and oversee platform saloons</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 w-full sm:w-auto">
          <Plus size={18} /> Add Saloon
        </button>
      </div>

        {/* List of Saloons */}
        <div className="bg-white border border-black/10 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-black/10 flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search saloons..." className="input-field pl-10" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/10 text-gray-500 text-sm">
                  <th className="p-4 font-semibold">Saloon Name</th>
                  <th className="p-4 font-semibold">Location</th>
                  <th className="p-4 font-semibold">Admin / Owner</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      <div className="spinner mx-auto mb-2" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000000' }} /> Loading saloons...
                    </td>
                  </tr>
                ) : saloons.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      No saloons found. Create one.
                    </td>
                  </tr>
                ) : (
                  saloons.map(s => (
                    <tr key={s._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-black/5 text-black flex items-center justify-center border border-black/10">
                            <Building2 size={18} />
                          </div>
                          <span className="text-black font-semibold">{s.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-700 font-medium">{s.address?.city || 'N/A'}</td>
                      <td className="p-4 text-gray-700 font-medium">{s.owner?.name || s.owner?.email || 'N/A'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded border text-xs font-semibold uppercase tracking-wider font-condensed ${
                          s.isVerified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                          {s.isVerified ? 'Verified' : 'Pending'}
                        </span>
                        <span className={`ml-2 px-2.5 py-0.5 rounded border text-xs font-semibold uppercase tracking-wider font-condensed ${
                          s.isActive ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {s.isActive ? 'Active' : 'Blocked'}
                        </span>
                        {s.isRecommended && (
                          <span className="ml-2 px-2.5 py-0.5 rounded border text-xs font-semibold uppercase tracking-wider font-condensed bg-purple-50 text-purple-700 border-purple-200">
                            ★ Rec
                          </span>
                        )}
                        {s.isTrending && (
                          <span className="ml-2 px-2.5 py-0.5 rounded border text-xs font-semibold uppercase tracking-wider font-condensed bg-orange-50 text-orange-700 border-orange-200">
                            🔥 Trend
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleToggleRecommended(s._id)} 
                            title={s.isRecommended ? "Remove from Recommended" : "Mark as Recommended"} 
                            className={`p-2 rounded-lg border transition-colors ${
                              s.isRecommended ? 'bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-400 border-gray-200'
                            }`}
                          >
                            <Star size={16} fill={s.isRecommended ? 'currentColor' : 'none'} className={s.isRecommended ? 'text-yellow-500' : 'text-gray-400'} />
                          </button>
                          <button 
                            onClick={() => handleToggleTrending(s._id)} 
                            title={s.isTrending ? "Remove from Trending" : "Mark as Trending"} 
                            className={`p-2 rounded-lg border transition-colors ${
                              s.isTrending ? 'bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-400 border-gray-200'
                            }`}
                          >
                            <Flame size={16} fill={s.isTrending ? 'currentColor' : 'none'} className={s.isTrending ? 'text-orange-500' : 'text-gray-400'} />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(s._id, s.isActive)} 
                            title={s.isActive ? "Block Saloon" : "Unblock Saloon"} 
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-black border border-gray-200 transition-colors"
                          >
                            {s.isActive ? <Ban size={16} className="text-orange-600" /> : <CheckCircle size={16} className="text-green-600" />}
                          </button>
                          <button 
                            onClick={() => handleDelete(s._id)} 
                            title="Delete Saloon" 
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Saloon Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl border border-black/10 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white pb-4 border-b border-black/10 p-6 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold font-display text-black">Register New Saloon</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black transition">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-black uppercase tracking-wider font-condensed">Saloon Details</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1 font-semibold">Saloon Name *</label>
                      <input {...register('saloonName', { required: 'Required' })} className="input-field" placeholder="e.g. Urban Cuts" />
                      {errors.saloonName && <span className="text-xs text-red-500 font-semibold">{errors.saloonName.message}</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1 font-semibold">City *</label>
                      <input {...register('city', { required: 'Required' })} className="input-field" placeholder="Colombo" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1 font-semibold">Street</label>
                      <input {...register('street')} className="input-field" placeholder="123 Main St" />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-black/10" />

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-black uppercase tracking-wider font-condensed">Owner Account Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1 font-semibold">Full Name *</label>
                      <input {...register('ownerName', { required: 'Required' })} className="input-field" placeholder="John Doe" />
                      {errors.ownerName && <span className="text-xs text-red-500 font-semibold">{errors.ownerName.message}</span>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1 font-semibold">Email *</label>
                      <input {...register('ownerEmail', { required: 'Required' })} type="email" className="input-field" placeholder="john@example.com" />
                      {errors.ownerEmail && <span className="text-xs text-red-500 font-semibold">{errors.ownerEmail.message}</span>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1 font-semibold">Phone</label>
                      <input {...register('ownerPhone')} className="input-field" placeholder="+94 77 XXX XXXX" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-black/10">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 hover:text-black transition">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="btn-primary w-32">
                    {isSubmitting ? <div className="spinner w-4 h-4 mx-auto border-t-white" /> : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* OTP Verification Modal */}
        {showOtpModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white border border-black/10 p-6 rounded-3xl w-full max-w-sm shadow-2xl animate-fade-in">
              <h3 className="text-xl font-bold font-display text-black mb-2">Verify Saloon Owner</h3>
              <p className="text-sm text-gray-500 mb-6">
                Enter the 6-digit code sent to <span className="text-black font-semibold">{pendingSaloonData?.ownerEmail}</span>
              </p>

              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="input-field w-full mb-4 text-center tracking-widest text-lg font-bold"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyAndCreate}
                  disabled={isSubmitting}
                  className="btn-primary flex-1"
                >
                  {isSubmitting ? <div className="spinner w-4 h-4 mx-auto border-t-white" /> : 'Verify & Create'}
                </button>
              </div>
            </div>
          </div>
        )}
    </DashboardLayout>
  );
}
