import React, { useEffect, useState } from 'react';
import { Store, Plus, Search, Filter, Ban, CheckCircle, Smartphone, MapPin, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { sellerAPI } from '../../api';

export default function SuperAdminSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const res = await sellerAPI.getAll();
      setSellers(res.data.data.sellers || []);
    } catch (err) {
      toast.error('Failed to fetch sellers');
      setSellers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus ? 'block' : 'unblock';
    if (!window.confirm(`Are you sure you want to ${action} this seller?`)) return;
    
    try {
      await sellerAPI.toggleStatus(id);
      toast.success(`Seller ${action}ed successfully`);
      fetchSellers();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} seller`);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        password: Math.random().toString(36).slice(-10) + 'Aa1@', // Dummy strong password
      };
      
      await sellerAPI.create(payload);
      toast.success('Seller registered successfully! They can log in to setup their store.');
      setIsModalOpen(false);
      reset();
      fetchSellers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register seller');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSellers = sellers.filter(s => 
    s.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-black">Manage Sellers</h1>
          <p className="text-gray-500 mt-1 font-medium">Verify, approve, and manage marketplace vendors</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 w-full sm:w-auto">
          <Plus size={18} /> Register Seller
        </button>
      </div>

        {/* Filters */}
        <div className="bg-white border border-black/10 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between shadow-sm">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by store name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 text-black border border-black/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-black transition-colors text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-white border border-black/10 px-4 py-2 rounded-xl text-gray-700 hover:text-black text-sm flex items-center gap-2 transition-colors">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        {/* Seller List */}
        <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/10 bg-gray-50/50 text-gray-500 text-sm">
                  <th className="p-4 font-semibold">Store</th>
                  <th className="p-4 font-semibold">Account Owner</th>
                  <th className="p-4 font-semibold">Contact</th>
                  <th className="p-4 font-semibold">Location</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-black/10">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center">
                      <div className="spinner mx-auto" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000000' }} />
                    </td>
                  </tr>
                ) : filteredSellers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      No sellers found.
                    </td>
                  </tr>
                ) : (
                  filteredSellers.map((seller) => (
                    <tr key={seller._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                            {seller.storeName?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-black">{seller.storeName}</p>
                            {seller.isVerified && <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-1.5 rounded uppercase font-bold tracking-wider font-condensed">Verified</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-black font-semibold">{seller.owner?.name}</p>
                        <p className="text-gray-500 text-xs">{seller.owner?.email}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-700 font-medium flex items-center gap-1"><Smartphone size={12}/> {seller.contactPhone || 'N/A'}</p>
                      </td>
                      <td className="p-4 text-gray-600 font-medium">
                        {seller.address?.city ? (
                          <span className="flex items-center gap-1"><MapPin size={12}/> {seller.address.city}</span>
                        ) : 'N/A'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded border text-xs font-semibold uppercase tracking-wider font-condensed ${
                          seller.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {seller.isActive ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleToggleStatus(seller._id, seller.isActive)}
                          className={`p-2 rounded-lg border transition-colors ${
                            seller.isActive 
                              ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200' 
                              : 'bg-green-50 hover:bg-green-100 text-green-600 border-green-200'
                          }`}
                          title={seller.isActive ? 'Block Seller' : 'Unblock Seller'}
                        >
                          {seller.isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Seller Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md border border-black/10 shadow-2xl overflow-hidden">
              <div className="border-b border-black/10 p-5 flex justify-between items-center bg-white">
                <h2 className="text-xl font-bold text-black flex items-center gap-2 font-display">
                  <Store className="text-black" size={20} /> Register New Seller
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black transition">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-3 font-condensed">Owner Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1 font-semibold">Owner Name *</label>
                      <input {...register('name', { required: 'Required' })} className="input-field py-2 text-sm" placeholder="John Doe" />
                      {errors.name && <span className="text-xs text-red-500 font-semibold">{errors.name.message}</span>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1 font-semibold">Owner Email *</label>
                      <input {...register('email', { required: 'Required' })} type="email" className="input-field py-2 text-sm" placeholder="john@example.com" />
                      {errors.email && <span className="text-xs text-red-500 font-semibold">{errors.email.message}</span>}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-3 font-condensed">Store Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1 font-semibold">Store Name *</label>
                      <input {...register('storeName', { required: 'Required' })} className="input-field py-2 text-sm" placeholder="John's Beauty Supplies" />
                      {errors.storeName && <span className="text-xs text-red-500 font-semibold">{errors.storeName.message}</span>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1 font-semibold">Contact Phone *</label>
                      <input 
                        {...register('contactPhone', { 
                          required: 'Phone number is required',
                          pattern: {
                            value: /^(?:\+94|94|0)7\d{8}$/,
                            message: 'Valid phone required (e.g. 0771234567 or +94771234567)'
                          }
                        })} 
                        className="input-field py-2 text-sm" 
                        placeholder="0771234567" 
                      />
                      {errors.contactPhone && <span className="text-xs text-red-500 font-semibold">{errors.contactPhone.message}</span>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1 font-semibold">City</label>
                      <input {...register('city')} className="input-field py-2 text-sm" placeholder="New York" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-5 border-t border-black/10">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 hover:text-black transition text-sm">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="btn-primary py-2 px-6 text-sm flex items-center justify-center min-w-[100px]">
                    {isSubmitting ? <div className="spinner w-4 h-4 border-t-white" /> : 'Register'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </DashboardLayout>
  );
}
