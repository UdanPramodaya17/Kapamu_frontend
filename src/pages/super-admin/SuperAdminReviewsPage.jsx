import React, { useEffect, useState } from 'react';
import {
  Star, Trash2, Search, Building2, ShoppingBag, RefreshCw, AlertTriangle, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { reviewAPI } from '../../api';

const TABS = [
  { key: 'all', label: 'All Reviews', bg: '#f3f4f6', color: '#1f2937' },
  { key: 'product', label: 'Product Reviews', bg: '#eff6ff', color: '#1e40af' },
  { key: 'saloon', label: 'Saloon Reviews', bg: '#fdf2f8', color: '#9d174d' },
];

export default function SuperAdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState(null); // stores review object to delete
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReviews = async (type = activeTab) => {
    try {
      setLoading(true);
      const params = {};
      if (type !== 'all') {
        params.type = type;
      }
      const res = await reviewAPI.getAllAdmin(params);
      setReviews(res.data.data.reviews || []);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(activeTab);
  }, [activeTab]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(true);
    try {
      await reviewAPI.deleteAdmin(deleteModal._id);
      toast.success('Review deleted and ratings recalculated successfully! 🧹');
      setDeleteModal(null);
      fetchReviews(activeTab);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeatured = async (reviewId) => {
    try {
      await reviewAPI.toggleFeaturedAdmin(reviewId);
      toast.success('Homepage featured status updated! 💫');
      fetchReviews(activeTab);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle featured status');
    }
  };

  const filtered = reviews.filter(r => 
    r.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.product?.name && r.product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.saloon?.name && r.saloon.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-black">Manage Reviews</h1>
          <p className="text-gray-500 mt-1 font-medium">Moderate customer product reviews and booking-verified saloon reviews</p>
        </div>
        <button
          onClick={() => fetchReviews(activeTab)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-xl text-gray-600 hover:text-black text-sm font-semibold transition-colors"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {TABS.map(tab => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '0.5rem 1.25rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.02em',
                  borderRadius: '30px',
                  border: active ? '1px solid #000000' : '1px solid rgba(0,0,0,0.08)',
                  background: active ? '#000000' : '#ffffff',
                  color: active ? '#ffffff' : 'rgba(0,0,0,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="bg-white border border-black/10 rounded-2xl p-4 mb-6 shadow-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by customer, comment, saloon or product..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 text-black border border-black/10 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-black transition-colors text-sm"
            />
          </div>
        </div>

        {/* Table list */}
        <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/10 bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Reviewed Item</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Comment</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-black/10">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center">
                      <div className="spinner mx-auto" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000000' }} />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-gray-500">
                      <Star className="mx-auto mb-3 text-gray-300" size={40} />
                      <p className="font-semibold">No reviews found.</p>
                    </td>
                  </tr>
                ) : filtered.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50/50 transition-colors group">
                    
                    {/* Customer */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
                          {r.customer?.avatar ? (
                            <img src={r.customer.avatar} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            r.customer?.name?.[0]?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-black">{r.customer?.name || 'Unknown User'}</p>
                          <p className="text-xs text-gray-400">{r.customer?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Item */}
                    <td className="p-4">
                      {r.product ? (
                        <div className="flex items-center gap-2">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            <ShoppingBag size={10} /> Product
                          </span>
                          <span className="font-semibold text-black">{r.product?.name}</span>
                        </div>
                      ) : r.saloon ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#fdf2f8', color: '#9d174d', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              <Building2 size={10} /> Salon
                            </span>
                            <span className="font-semibold text-black">{r.saloon?.name}</span>
                          </div>
                          {r.barber?.user?.name && (
                            <p className="text-[11px] text-gray-400 font-medium">Stylist: {r.barber.user.name}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Unknown Item</span>
                      )}
                    </td>

                    {/* Rating */}
                    <td className="p-4">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            size={12}
                            fill={star <= r.rating ? '#fbbf24' : 'none'}
                            color={star <= r.rating ? '#fbbf24' : '#e5e7eb'}
                          />
                        ))}
                      </div>
                    </td>

                    {/* Comment */}
                    <td className="p-4 max-w-xs">
                      <p className="text-gray-600 line-clamp-2 leading-relaxed">{r.comment || <em className="text-gray-300">No comment written</em>}</p>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-gray-500 text-xs font-medium">
                      {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Featured */}
                        <button
                          onClick={() => handleToggleFeatured(r._id)}
                          title={r.isFeatured ? "Remove from Home Page Featured" : "Pin to Home Page Featured"}
                          style={{
                            padding: '6px',
                            borderRadius: '8px',
                            border: r.isFeatured ? '1px solid #fef08a' : '1px solid rgba(0,0,0,0.06)',
                            background: r.isFeatured ? '#fef9c3' : '#ffffff',
                            color: r.isFeatured ? '#ca8a04' : 'rgba(0,0,0,0.3)',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                          className="hover:scale-105"
                        >
                          <Star size={14} fill={r.isFeatured ? "#ca8a04" : "none"} color={r.isFeatured ? "#ca8a04" : "currentColor"} />
                        </button>

                        <button
                          onClick={() => setDeleteModal(r)}
                          title="Delete Review"
                          className="p-2 rounded-lg border border-red-100 hover:border-red-300 text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-black/10 shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-black font-display">Delete Review</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Are you sure you want to delete the review by <strong>{deleteModal.customer?.name}</strong>? 
              This will remove the review permanently and recalculate the rating aggregates.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 text-gray-500 hover:text-black text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {actionLoading ? (
                  <div className="spinner w-4 h-4" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                ) : null}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
