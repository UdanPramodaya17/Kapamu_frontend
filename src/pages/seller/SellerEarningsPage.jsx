import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  DollarSign, Clock, CheckCircle, TrendingUp, Wallet, Building2,
  RefreshCw, AlertCircle, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { earningsAPI, sellerAPI, saloonAPI } from '../../api';
import { selectUserRole } from '../../features/auth/authSlice';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending Payout' },
  { key: 'paid', label: 'Paid Out' },
];

export default function SellerEarningsPage() {
  const role = useSelector(selectUserRole);
  const [earnings, setEarnings] = useState([]);
  const [summary, setSummary] = useState({});
  const [bankDetails, setBankDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [commissionRate, setCommissionRate] = useState(10);

  // Bank form state
  const [editingBank, setEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({ bankName: '', accountHolder: '', accountNumber: '', branchCode: '' });
  const [savingBank, setSavingBank] = useState(false);
  const [saloonId, setSaloonId] = useState(null);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const [earningsRes, commissionRes] = await Promise.all([
        earningsAPI.getMine({ status: statusFilter }),
        earningsAPI.getCommissionRate(),
      ]);
      const data = earningsRes.data.data;
      setEarnings(data.earnings || []);
      setSummary(data.summary || {});
      setBankDetails(data.bankDetails || {});
      setBankForm(data.bankDetails || { bankName: '', accountHolder: '', accountNumber: '', branchCode: '' });
      setCommissionRate(commissionRes.data.data.commissionRate || 10);

      // If user is a saloon admin, fetch their saloon details to get saloonId
      if (role === 'saloon_admin' && !saloonId) {
        const saloonRes = await saloonAPI.getMy();
        if (saloonRes.data?.success && saloonRes.data.data.saloon) {
          setSaloonId(saloonRes.data.data.saloon._id);
        }
      }
    } catch (err) {
      toast.error('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [statusFilter]);

  const handleSaveBank = async () => {
    setSavingBank(true);
    try {
      if (role === 'saloon_admin') {
        if (!saloonId) {
          throw new Error('Saloon ID not loaded. Please try again.');
        }
        await saloonAPI.update(saloonId, { bankDetails: bankForm });
      } else {
        await sellerAPI.updateMyProfile({ bankDetails: bankForm });
      }
      toast.success('Bank details saved!');
      setEditingBank(false);
      setBankDetails(bankForm);
    } catch (err) {
      toast.error(err?.message || 'Failed to save bank details');
    } finally {
      setSavingBank(false);
    }
  };

  const formatLKR = (n) => `LKR ${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-black">My Earnings</h1>
            <p className="text-gray-500 mt-1 font-medium">Track your revenue, commissions, and payouts</p>
          </div>
          <button onClick={fetchEarnings} className="flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-xl text-gray-600 hover:text-black text-sm font-semibold transition-colors">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <SummaryCard
            title="Total Sales"
            value={formatLKR(summary.totalSales)}
            subtitle={`${summary.totalOrders || 0} orders`}
            icon={<TrendingUp size={20} />}
            iconBg="#eff6ff" iconColor="#3b82f6"
          />
          <SummaryCard
            title="Your Earnings"
            value={formatLKR(summary.totalEarned)}
            subtitle={`After ${commissionRate}% commission`}
            icon={<DollarSign size={20} />}
            iconBg="#f0fdf4" iconColor="#22c55e"
          />
          <SummaryCard
            title="Pending Payout"
            value={formatLKR(summary.pendingAmount)}
            subtitle={`${summary.pendingCount || 0} items waiting`}
            icon={<Clock size={20} />}
            iconBg="#fef3c7" iconColor="#f59e0b"
          />
          <SummaryCard
            title="Paid Out"
            value={formatLKR(summary.paidAmount)}
            subtitle={`${summary.paidCount || 0} items settled`}
            icon={<Wallet size={20} />}
            iconBg="#f0fdf4" iconColor="#10b981"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Earnings Table — 2 cols */}
          <div className="lg:col-span-2">
            {/* Status Filter */}
            <div className="flex gap-2 mb-4">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    statusFilter === f.key
                      ? 'bg-black text-white'
                      : 'bg-white border border-black/10 text-gray-500 hover:text-black'
                  }`}
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                      <th className="p-4">Product</th>
                      <th className="p-4">Sale Amount</th>
                      <th className="p-4">Commission</th>
                      <th className="p-4">Your Share</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-black/10">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="p-12 text-center">
                          <div className="spinner mx-auto" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000' }} />
                        </td>
                      </tr>
                    ) : earnings.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-12 text-center text-gray-500">
                          <DollarSign className="mx-auto mb-3 text-gray-300" size={36} />
                          <p className="font-semibold">No earnings yet</p>
                          <p className="text-xs mt-1 text-gray-400">Your earnings will appear here when customers buy your products</p>
                        </td>
                      </tr>
                    ) : earnings.map(e => (
                      <tr key={e._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-black line-clamp-1">{e.productName}</p>
                          <p className="text-xs text-gray-500">Qty: {e.quantity}</p>
                        </td>
                        <td className="p-4 font-semibold text-black">{formatLKR(e.itemTotal)}</td>
                        <td className="p-4 text-red-600 font-semibold">-{formatLKR(e.commissionAmount)}</td>
                        <td className="p-4 text-green-700 font-bold">{formatLKR(e.vendorAmount)}</td>
                        <td className="p-4">
                          {e.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.05em' }}>
                              <Clock size={10} /> PENDING
                            </span>
                          )}
                          {e.status === 'paid' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.05em' }}>
                              <CheckCircle size={10} /> PAID
                            </span>
                          )}
                          {e.status === 'cancelled' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.05em' }}>
                              <XCircle size={10} /> CANCELLED
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-gray-500 text-xs font-medium">
                          {new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {e.paidReference && (
                            <p className="text-green-700 mt-0.5 font-semibold">Ref: {e.paidReference}</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right sidebar — Bank Details + Commission Info */}
          <div className="space-y-6">
            {/* Commission Info */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-black mb-3 font-display flex items-center gap-2">
                <AlertCircle size={16} className="text-gray-400" /> Commission Rate
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-display font-bold text-black">{commissionRate}%</span>
                <span className="text-sm text-gray-500 font-medium">platform fee per sale</span>
              </div>
              <p className="text-xs text-gray-400 mt-2 font-medium">
                You receive {100 - commissionRate}% of each product sale. Commission is automatically calculated.
              </p>
            </div>

            {/* Bank Details */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-black font-display flex items-center gap-2">
                  <Building2 size={16} className="text-gray-400" /> Bank Account
                </h3>
                <button
                  onClick={() => setEditingBank(!editingBank)}
                  className="text-xs font-bold text-black hover:text-gray-600 transition underline"
                >
                  {editingBank ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {editingBank ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Bank Name</label>
                    <input
                      value={bankForm.bankName}
                      onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                      className="w-full bg-gray-50 border border-black/10 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:border-black"
                      placeholder="e.g. Bank of Ceylon"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Account Holder</label>
                    <input
                      value={bankForm.accountHolder}
                      onChange={e => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                      className="w-full bg-gray-50 border border-black/10 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:border-black"
                      placeholder="Full name on bank account"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Account Number</label>
                    <input
                      value={bankForm.accountNumber}
                      onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                      className="w-full bg-gray-50 border border-black/10 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:border-black"
                      placeholder="1234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Branch Code</label>
                    <input
                      value={bankForm.branchCode}
                      onChange={e => setBankForm({ ...bankForm, branchCode: e.target.value })}
                      className="w-full bg-gray-50 border border-black/10 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:border-black"
                      placeholder="001"
                    />
                  </div>
                  <button
                    onClick={handleSaveBank}
                    disabled={savingBank}
                    className="w-full btn-primary py-2 text-sm mt-2"
                  >
                    {savingBank ? 'Saving...' : 'Save Bank Details'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {bankDetails.bankName ? (
                    <>
                      <BankRow label="Bank" value={bankDetails.bankName} />
                      <BankRow label="Holder" value={bankDetails.accountHolder} />
                      <BankRow label="Account" value={bankDetails.accountNumber ? `****${bankDetails.accountNumber.slice(-4)}` : 'N/A'} />
                      <BankRow label="Branch" value={bankDetails.branchCode || 'N/A'} />
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <Building2 className="mx-auto text-gray-300 mb-2" size={28} />
                      <p className="text-sm text-gray-500 font-medium">No bank account added</p>
                      <p className="text-xs text-gray-400 mt-1">Add your bank details to receive payouts</p>
                      <button onClick={() => setEditingBank(true)} className="mt-3 text-xs font-bold text-black underline">
                        Add Bank Account
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
    </DashboardLayout>
  );
}

function SummaryCard({ title, value, subtitle, icon, iconBg, iconColor }) {
  return (
    <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm hover:border-black/30 transition-all">
      <div className="flex justify-between items-start mb-3">
        <p className="text-gray-500 text-sm font-semibold">{title}</p>
        <div className="p-2 rounded-lg" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-black font-display tracking-tight">{value}</p>
      <p className="text-xs text-gray-400 mt-1 font-medium">{subtitle}</p>
    </div>
  );
}

function BankRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="text-black font-semibold">{value}</span>
    </div>
  );
}
