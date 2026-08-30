import React, { useEffect, useState } from 'react';
import { Users, Plus, X, Trash2, Ban, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { saloonAPI, barberAPI, authAPI } from '../../api';
import ImageUploader from '../../components/shared/ImageUploader';

export default function SaloonBarbersPage() {
  const [saloon, setSaloon] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const saloonRes = await saloonAPI.getMy();
      const mySaloon = saloonRes.data.data.saloon;
      setSaloon(mySaloon);

      if (mySaloon) {
        const barbersRes = await saloonAPI.getBarbers(mySaloon._id, { all: 'true' });
        setBarbers(barbersRes.data.data.barbers || []);
      }
    } catch (err) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    if (!saloon) {
      toast.error('You need a verified saloon first.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        password: Math.random().toString(36).slice(-10) + 'Aa1@', // Dummy strong password
        specializations: data.specializations ? data.specializations.split(',').map(s => s.trim()) : [],
        workingHours: [], // Can implement schedule builder later
      };

      await barberAPI.add(payload);

      // Barber ge email ekata password setup link eka yawanna
      await authAPI.sendSetupPassword({ email: payload.email });
      toast.success('Barber registered & Setup link sent!');
      setIsModalOpen(false);
      reset();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add barber');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to completely delete this barber?')) return;
    try {
      await barberAPI.delete(id);
      toast.success('Barber deleted successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete barber');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus === false ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} this barber?`)) return;
    try {
      await barberAPI.toggleStatus(id);
      toast.success(`Barber ${currentStatus === false ? 'unblocked' : 'blocked'} successfully`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} barber`);
    }
  };

  const handlePortfolioUpload = async (newImages) => {
    if (!selectedBarber) return;
    try {
      await barberAPI.updateByAdmin(selectedBarber._id, { portfolioImages: newImages });
      // update local state
      setBarbers(prev => prev.map(b => b._id === selectedBarber._id ? { ...b, portfolioImages: newImages } : b));
      setSelectedBarber({ ...selectedBarber, portfolioImages: newImages });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update portfolio');
    }
  };

  const handleAvatarUpload = async (newImages) => {
    if (!selectedBarber) return;
    try {
      const avatarUrl = newImages.length > 0 ? newImages[0] : '';
      await barberAPI.updateByAdmin(selectedBarber._id, { avatar: avatarUrl });
      // update local state
      setBarbers(prev => prev.map(b => b._id === selectedBarber._id ? { 
        ...b, 
        avatar: avatarUrl, 
        user: b.user ? { ...b.user, avatar: avatarUrl } : b.user 
      } : b));
      setSelectedBarber(prev => prev ? { 
        ...prev, 
        avatar: avatarUrl, 
        user: prev.user ? { ...prev.user, avatar: avatarUrl } : prev.user 
      } : null);
      toast.success(avatarUrl ? 'Barber avatar updated!' : 'Barber avatar removed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update avatar');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-black">My Barbers</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage staff for {saloon?.name || 'your salon'}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!saloon}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus size={18} /> Register Barber
        </button>
      </div>

      {/* List of Barbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <div className="spinner mx-auto mb-3" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000000' }} />
            <p className="text-gray-500 font-medium">Loading barbers...</p>
          </div>
        ) : barbers.length === 0 ? (
          <div className="col-span-full bg-white border border-black/10 p-10 text-center rounded-2xl shadow-sm">
            <Users size={40} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-black mb-2">No Barbers Yet</h3>
            <p className="text-gray-500 font-medium">You haven't registered any barbers. Add one to start taking bookings!</p>
          </div>
        ) : (
          barbers.map(b => (
            <div key={b._id} className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-end gap-2 mb-2">
                <button onClick={() => { setSelectedBarber(b); setIsPortfolioModalOpen(true); }} title="Manage Portfolio" className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/50 transition-colors">
                  <ImageIcon size={16} className="text-indigo-600" />
                </button>
                <button onClick={() => handleToggleStatus(b._id, b.isActive)} title={b.isActive === false ? "Unblock Barber" : "Block Barber"} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 text-black transition-colors">
                  {b.isActive === false ? <CheckCircle size={16} className="text-green-600" /> : <Ban size={16} className="text-orange-600" />}
                </button>
                <button onClick={() => handleDelete(b._id)} title="Delete Barber" className="p-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200/50 transition-colors">
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
              <div className="flex items-center gap-4 mb-2 pr-2">
                {b.avatar || b.user?.avatar || b.portfolioImages?.[0] ? (
                  <img 
                    src={b.avatar || b.user?.avatar || b.portfolioImages[0]} 
                    alt={b.user?.name} 
                    className="w-14 h-14 rounded-full object-cover shrink-0 border border-black/10"
                  />
                ) : (
                  <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold shrink-0">
                    {b.user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-black">{b.user?.name}</h3>
                  <p className="text-sm text-gray-500 font-medium">{b.user?.email}</p>
                </div>
              </div>
              {b.isActive === false && (
                <span className="inline-block mb-4 px-2.5 py-0.5 rounded border bg-red-50 text-red-700 border-red-200 text-xs font-semibold uppercase tracking-wider font-condensed">
                  Blocked
                </span>
              )}
              {b.specializations?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {b.specializations.map((spec, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded-md border border-black/10 font-semibold font-condensed">
                      {spec}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Barber Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-black/10 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="bg-white border-b border-black/10 p-5 flex justify-between items-center">
              <h2 className="text-xl font-bold font-display text-black">Register Barber</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto flex-1">
              <p className="text-sm text-black bg-black/5 p-3 rounded-lg border border-black/10 mb-4 font-medium">
                Create a new account for your barber. We will send them an email to set up their password.
              </p>

              <div>
                <label className="block text-sm text-gray-700 mb-1 font-semibold">Full Name *</label>
                <input {...register('name', { required: 'Required' })} className="input-field" placeholder="Alex Barber" />
                {errors.name && <span className="text-xs text-red-500 font-semibold">{errors.name.message}</span>}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1 font-semibold">Email *</label>
                <input {...register('email', { required: 'Required' })} type="email" className="input-field" placeholder="alex@barber.com" />
                {errors.email && <span className="text-xs text-red-500 font-semibold">{errors.email.message}</span>}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1 font-semibold">Phone Number *</label>
                <input {...register('phone', { 
                  required: 'Required',
                  pattern: {
                    value: /^(?:\+94|94|0)7\d{8}$/,
                    message: 'Invalid Sri Lankan mobile number'
                  }
                })} type="tel" className="input-field" placeholder="+94 77 123 4567" />
                {errors.phone && <span className="text-xs text-red-500 font-semibold">{errors.phone.message}</span>}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1 font-semibold">Specializations</label>
                <input {...register('specializations')} className="input-field" placeholder="Haircut, Shaving, Beard Trim" />
                <p className="text-xs text-gray-400 mt-1">Comma separated</p>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-black/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 hover:text-black transition">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-28">
                  {isSubmitting ? <div className="spinner w-4 h-4 mx-auto border-t-white" /> : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Portfolio Modal */}
      {isPortfolioModalOpen && selectedBarber && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl border border-black/10 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="bg-white border-b border-black/10 p-5 flex justify-between items-center">
              <h2 className="text-xl font-bold font-display text-black flex items-center gap-2">
                <ImageIcon size={20} className="text-black" /> {selectedBarber.user?.name}'s Portfolio
              </h2>
              <button onClick={() => { setIsPortfolioModalOpen(false); setSelectedBarber(null); }} className="text-gray-500 hover:text-black transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-6 overflow-y-auto flex-1">
              <div>
                <h3 className="text-black font-bold mb-2">Profile Photo</h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-black/5">
                  <ImageUploader 
                    maxImages={1} 
                    currentImages={selectedBarber.avatar ? [selectedBarber.avatar] : []}
                    onUploadSuccess={handleAvatarUpload}
                    title="Barber Profile Photo"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-black font-bold mb-2">Works / Portfolio</h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-black/5">
                  <ImageUploader 
                    maxImages={10} 
                    currentImages={selectedBarber.portfolioImages || []}
                    onUploadSuccess={handlePortfolioUpload}
                    title="Portfolio Images"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
