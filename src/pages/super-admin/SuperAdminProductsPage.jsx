import React, { useEffect, useState } from 'react';
import {
  Package, CheckCircle, XCircle, Clock, Search, Image as ImageIcon,
  Tag, DollarSign, Store, RefreshCw, Eye, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { productAPI } from '../../api';

const STATUS_TABS = [
  { key: 'pending', label: 'Pending Review', color: '#f59e0b', bg: '#fef3c7', border: '#fde68a' },
  { key: 'approved', label: 'Approved', color: '#10b981', bg: '#d1fae5', border: '#6ee7b7' },
  { key: 'rejected', label: 'Rejected', color: '#ef4444', bg: '#fee2e2', border: '#fca5a5' },
];

const CATEGORIES = ['shampoo', 'conditioner', 'styling', 'tools', 'skincare', 'beard', 'accessories', 'other'];

export default function SuperAdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [rejectModal, setRejectModal] = useState(null); // { productId, productName }
  const [rejectReason, setRejectReason] = useState('');
  const [previewProduct, setPreviewProduct] = useState(null);

  const fetchProducts = async (status = activeTab) => {
    try {
      setLoading(true);
      const res = await productAPI.getPendingAdmin({ status });
      setProducts(res.data.data.products || []);
      setStats(res.data.data.stats || { pending: 0, approved: 0, rejected: 0 });
    } catch (err) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(activeTab);
  }, [activeTab]);

  const handleApprove = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: 'approve' }));
    try {
      await productAPI.approve(id);
      toast.success('✅ Product approved and is now live on the website!');
      fetchProducts(activeTab);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModal) return;
    setActionLoading(prev => ({ ...prev, [rejectModal.productId]: 'reject' }));
    try {
      await productAPI.reject(rejectModal.productId, { reason: rejectReason || 'Does not meet our standards.' });
      toast.success('Product rejected.');
      setRejectModal(null);
      setRejectReason('');
      fetchProducts(activeTab);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(prev => ({ ...prev, [rejectModal?.productId]: null }));
    }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.vendorId?.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.vendorId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const s = STATUS_TABS.find(t => t.key === status);
    if (!s) return null;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '2px 10px', borderRadius: '20px',
        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
        fontFamily: "'Barlow Condensed', sans-serif",
      }}>
        {status === 'pending' && <Clock size={10} />}
        {status === 'approved' && <CheckCircle size={10} />}
        {status === 'rejected' && <XCircle size={10} />}
        {status}
      </span>
    );
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-black">Product Approvals</h1>
          <p className="text-gray-500 mt-1 font-medium">Review and approve seller/saloon product submissions</p>
        </div>
        <button
          onClick={() => fetchProducts(activeTab)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-xl text-gray-600 hover:text-black text-sm font-semibold transition-colors"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                activeTab === tab.key
                  ? 'border-black shadow-md bg-white scale-[1.02]'
                  : 'border-black/10 bg-white hover:border-black/30'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-semibold mb-1">{tab.label}</p>
                  <p className="text-3xl font-bold text-black font-display">{stats[tab.key] || 0}</p>
                </div>
                <div className="p-2 rounded-lg" style={{ background: tab.bg }}>
                  {tab.key === 'pending' && <Clock size={22} style={{ color: tab.color }} />}
                  {tab.key === 'approved' && <CheckCircle size={22} style={{ color: tab.color }} />}
                  {tab.key === 'rejected' && <XCircle size={22} style={{ color: tab.color }} />}
                </div>
              </div>
              {activeTab === tab.key && (
                <div className="mt-2 h-0.5 rounded-full bg-black" />
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white border border-black/10 rounded-2xl p-4 mb-6 shadow-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, category, or store..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 text-black border border-black/10 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-black transition-colors text-sm"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/10 bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  <th className="p-4">Product</th>
                  <th className="p-4">Vendor</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-black/10">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center">
                      <div className="spinner mx-auto" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000000' }} />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-gray-500">
                      <Package className="mx-auto mb-3 text-gray-300" size={40} />
                      <p className="font-semibold">No {activeTab} products found.</p>
                    </td>
                  </tr>
                ) : filtered.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                    {/* Product */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-black/10 bg-gray-50 shrink-0 flex items-center justify-center">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={20} className="text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-black line-clamp-1">{product.name}</p>
                          {product.rejectionReason && activeTab === 'rejected' && (
                            <p className="text-xs text-red-500 font-medium line-clamp-1 mt-0.5">
                              Reason: {product.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Vendor */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Store size={12} className="text-gray-400" />
                        <div>
                          <p className="font-semibold text-black text-sm">
                            {product.vendorId?.storeName || product.vendorId?.name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{product.vendorModel || 'Global'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      <p className="font-bold text-black">LKR {product.salePrice || product.price}</p>
                      {product.salePrice && (
                        <p className="text-xs text-gray-400 line-through">LKR {product.price}</p>
                      )}
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-xs bg-gray-50 text-gray-700 border border-black/10 rounded px-2 py-0.5 capitalize font-semibold w-fit" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                        <Tag size={10} /> {product.category}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">{getStatusBadge(product.status)}</td>

                    {/* Date */}
                    <td className="p-4 text-gray-500 text-xs font-medium">
                      {new Date(product.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-end">
                        {/* Preview */}
                        <button
                          onClick={() => setPreviewProduct(product)}
                          title="Preview"
                          className="p-2 rounded-lg border border-black/10 hover:border-black/30 text-gray-500 hover:text-black transition-colors"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Approve */}
                        {product.status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(product._id)}
                            disabled={!!actionLoading[product._id]}
                            title="Approve"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs font-bold transition-colors disabled:opacity-60"
                            style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.05em' }}
                          >
                            {actionLoading[product._id] === 'approve' ? (
                              <div className="spinner w-3 h-3" style={{ borderColor: 'rgba(16,185,129,0.2)', borderTopColor: '#10b981' }} />
                            ) : <CheckCircle size={14} />}
                            APPROVE
                          </button>
                        )}

                        {/* Reject */}
                        {product.status !== 'rejected' && (
                          <button
                            onClick={() => { setRejectModal({ productId: product._id, productName: product.name }); setRejectReason(''); }}
                            disabled={!!actionLoading[product._id]}
                            title="Reject"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors disabled:opacity-60"
                            style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.05em' }}
                          >
                            {actionLoading[product._id] === 'reject' ? (
                              <div className="spinner w-3 h-3" style={{ borderColor: 'rgba(239,68,68,0.2)', borderTopColor: '#ef4444' }} />
                            ) : <XCircle size={14} />}
                            REJECT
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-black/10 shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
                <XCircle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-black font-display">Reject Product</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{rejectModal.productName}</p>
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rejection Reason (sent to seller)</label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                placeholder="e.g. Product images are low quality. Please re-upload with better photos."
                className="w-full bg-gray-50 border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black transition-colors resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="px-4 py-2 text-gray-500 hover:text-black text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!!actionLoading[rejectModal.productId]}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {actionLoading[rejectModal.productId] === 'reject' ? (
                  <div className="spinner w-4 h-4" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                ) : null}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Preview Modal */}
      {previewProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-black/10 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-black/10 flex justify-between items-center">
              <h3 className="font-bold text-black font-display">Product Preview</h3>
              <button onClick={() => setPreviewProduct(null)} className="text-gray-500 hover:text-black transition">✕</button>
            </div>
            <div className="p-6">
              {/* Image */}
              {previewProduct.images?.length > 0 ? (
                <div className="w-full h-52 rounded-xl overflow-hidden mb-5 border border-black/10">
                  <img src={previewProduct.images[0]} alt={previewProduct.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-52 rounded-xl bg-gray-50 border border-black/10 flex items-center justify-center mb-5">
                  <ImageIcon size={40} className="text-gray-300" />
                </div>
              )}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h2 className="font-bold text-xl text-black font-display">{previewProduct.name}</h2>
                  <div className="text-right">
                    <p className="font-extrabold text-black text-lg">LKR {previewProduct.salePrice || previewProduct.price}</p>
                    {previewProduct.salePrice && <p className="text-xs text-gray-400 line-through">LKR {previewProduct.price}</p>}
                  </div>
                </div>
                {previewProduct.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">{previewProduct.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-gray-50 text-gray-700 border border-black/10 rounded px-2 py-1 capitalize font-semibold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    <Tag size={10} className="inline mr-1" />{previewProduct.category}
                  </span>
                  <span className="text-xs bg-gray-50 text-gray-700 border border-black/10 rounded px-2 py-1 font-semibold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    Stock: {previewProduct.inventory?.quantity || 0}
                  </span>
                </div>
                <div className="pt-3 border-t border-black/5 flex items-center gap-2 text-sm text-gray-500">
                  <Store size={14} />
                  <span>by <strong className="text-black">{previewProduct.vendorId?.storeName || previewProduct.vendorId?.name || 'Global'}</strong></span>
                  {getStatusBadge(previewProduct.status)}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-black/10 flex gap-3 justify-end">
              {previewProduct.status !== 'approved' && (
                <button
                  onClick={() => { handleApprove(previewProduct._id); setPreviewProduct(null); }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  <CheckCircle size={16} /> Approve
                </button>
              )}
              {previewProduct.status !== 'rejected' && (
                <button
                  onClick={() => { setRejectModal({ productId: previewProduct._id, productName: previewProduct.name }); setPreviewProduct(null); setRejectReason(''); }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-sm font-bold transition-colors"
                >
                  <XCircle size={16} /> Reject
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
