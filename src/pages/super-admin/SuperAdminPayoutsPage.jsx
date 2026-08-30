import React, { useEffect, useState } from 'react';
import {
  DollarSign, Clock, CheckCircle, TrendingUp, Wallet, Store,
  RefreshCw, Settings, Save, CreditCard, Building2, Percent
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { earningsAPI } from '../../api';

export default function SuperAdminPayoutsPage() {
  const [vendors, setVendors] = useState([]);
  const [globalStats, setGlobalStats] = useState({});
  const [commissionRate, setCommissionRate] = useState(10);
  const [newRate, setNewRate] = useState(10);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [payingVendor, setPayingVendor] = useState(null); // { vendorId, vendorName }
  const [payReference, setPayReference] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [rateLoading, setRateLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await earningsAPI.getAllVendors({ status: statusFilter });
      const data = res.data.data;
      setVendors(data.vendors || []);
      setGlobalStats(data.globalStats || {});
      setCommissionRate(data.commissionRate || 10);
      setNewRate(data.commissionRate || 10);
    } catch (err) {
      toast.error('Failed to load payout data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleUpdateRate = async () => {
    if (newRate === commissionRate) return;
    setRateLoading(true);
    try {
      await earningsAPI.updateCommissionRate({ commissionRate: Number(newRate) });
      toast.success(`Commission rate updated to ${newRate}%`);
      setCommissionRate(Number(newRate));
    } catch (err) {
      toast.error('Failed to update rate');
    } finally {
      setRateLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!payingVendor) return;
    setActionLoading(prev => ({ ...prev, [payingVendor.vendorId]: true }));
    try {
      const res = await earningsAPI.markAsPaid({
        vendorId: payingVendor.vendorId,
        reference: payReference,
      });
      const count = res.data.data.modifiedCount;
      toast.success(`✅ ${count} earning records marked as paid for ${payingVendor.vendorName}`);
      setPayingVendor(null);
      setPayReference('');
      fetchData();
    } catch (err) {
      toast.error('Failed to mark as paid');
    } finally {
      setActionLoading(prev => ({ ...prev, [payingVendor?.vendorId]: false }));
    }
  };

  const formatLKR = (n) => `LKR ${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-black">Vendor Payouts</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage commission earnings and vendor settlements</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-xl text-gray-600 hover:text-black text-sm font-semibold transition-colors">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total Platform Sales"
            value={formatLKR(globalStats.totalPlatformSales)}
            icon={<TrendingUp size={20} />}
            iconBg="#eff6ff" iconColor="#3b82f6"
          />
          <StatCard
            title="Commission Earned"
            value={formatLKR(globalStats.totalCommissionEarned)}
            icon={<DollarSign size={20} />}
            iconBg="#fdf4ff" iconColor="#a855f7"
            highlight
          />
          <StatCard
            title="Pending Payouts"
            value={formatLKR(globalStats.pendingPayoutAmount)}
            subtitle={`${globalStats.pendingPayoutCount || 0} items`}
            icon={<Clock size={20} />}
            iconBg="#fef3c7" iconColor="#f59e0b"
          />
          <StatCard
            title="Total Paid Out"
            value={formatLKR(globalStats.paidOutAmount)}
            subtitle={`${globalStats.paidOutCount || 0} items`}
            icon={<Wallet size={20} />}
            iconBg="#f0fdf4" iconColor="#10b981"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vendor Payouts Table — 2 cols */}
          <div className="lg:col-span-2">
            {/* Filter */}
            <div className="flex gap-2 mb-4">
              {[
                { key: 'pending', label: 'Pending Payouts' },
                { key: 'paid', label: 'Settled' },
                { key: 'all', label: 'All' },
              ].map(f => (
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
                      <th className="p-4">Vendor</th>
                      <th className="p-4">Total Sales</th>
                      <th className="p-4">Commission</th>
                      <th className="p-4">Vendor Share</th>
                      <th className="p-4">Items</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-black/10">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="p-12 text-center">
                          <div className="spinner mx-auto" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000' }} />
                        </td>
                      </tr>
                    ) : vendors.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-12 text-center text-gray-500">
                          <Wallet className="mx-auto mb-3 text-gray-300" size={36} />
                          <p className="font-semibold">No {statusFilter} payouts</p>
                        </td>
                      </tr>
                    ) : vendors.map(v => (
                      <tr key={v.vendorId} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                              {v.vendorName?.[0]}
                            </div>
                            <div>
                              <p className="font-bold text-black">{v.vendorName}</p>
                              <p className="text-xs text-gray-500">{v.ownerEmail}</p>
                              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 rounded font-bold uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.06em' }}>
                                {v.vendorModel}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-black">{formatLKR(v.totalSales)}</td>
                        <td className="p-4 text-purple-700 font-semibold">{formatLKR(v.totalCommission)}</td>
                        <td className="p-4 text-green-700 font-bold text-base">{formatLKR(v.totalAmount)}</td>
                        <td className="p-4 text-gray-600 font-medium">{v.count}</td>
                        <td className="p-4 text-right">
                          {statusFilter === 'pending' && (
                            <button
                              onClick={() => { setPayingVendor({ vendorId: v.vendorId, vendorName: v.vendorName }); setPayReference(''); }}
                              disabled={!!actionLoading[v.vendorId]}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-colors ml-auto disabled:opacity-60"
                              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.05em' }}
                            >
                              <CreditCard size={14} /> MARK PAID
                            </button>
                          )}
                          {statusFilter === 'paid' && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                              <CheckCircle size={12} /> SETTLED
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right sidebar — Commission Settings + Info */}
          <div className="space-y-6">
            {/* Commission Rate Settings */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-black mb-4 font-display flex items-center gap-2">
                <Percent size={16} className="text-gray-400" /> Commission Settings
              </h3>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Platform Commission Rate (%)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={newRate}
                      onChange={e => setNewRate(e.target.value)}
                      className="w-full bg-gray-50 border border-black/10 rounded-lg px-3 py-2.5 text-sm text-black font-bold focus:outline-none focus:border-black"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                  </div>
                  <button
                    onClick={handleUpdateRate}
                    disabled={rateLoading || Number(newRate) === commissionRate}
                    className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold transition-colors hover:bg-gray-800 disabled:opacity-40 flex items-center gap-1.5"
                  >
                    {rateLoading ? <div className="spinner w-4 h-4" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> : <Save size={14} />}
                    Save
                  </button>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-black/5">
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  <strong className="text-black">Current: {commissionRate}%</strong><br />
                  Platform keeps {commissionRate}% of each sale. Vendors receive {100 - commissionRate}%. Changes apply to <strong>new orders only</strong>.
                </p>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-black mb-3 font-display flex items-center gap-2">
                <Settings size={16} className="text-gray-400" /> How Payouts Work
              </h3>
              <div className="space-y-3 text-xs text-gray-600 font-medium leading-relaxed">
                <Step num="1" text="Customer places order → Commission auto-calculated per item" />
                <Step num="2" text="Vendor earnings appear as 'Pending' in their dashboard" />
                <Step num="3" text="You transfer money to vendor's bank account manually" />
                <Step num="4" text="Click 'Mark Paid' with bank reference number" />
                <Step num="5" text="Vendor sees 'Paid' status with your reference" />
              </div>
            </div>
          </div>
        </div>

      {/* Pay Confirmation Modal */}
      {payingVendor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-black/10 shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center">
                <CreditCard size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-black font-display">Mark as Paid</h3>
                <p className="text-sm text-gray-500">{payingVendor.vendorName}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 font-medium">
              This will mark <strong>all pending earnings</strong> for this vendor as "Paid". Make sure you've already transferred the money to their bank account.
            </p>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Transfer Reference (optional)</label>
              <input
                value={payReference}
                onChange={e => setPayReference(e.target.value)}
                placeholder="e.g. TXN-2026-07-13-001"
                className="w-full bg-gray-50 border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setPayingVendor(null); setPayReference(''); }}
                className="px-4 py-2 text-gray-500 hover:text-black text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkPaid}
                disabled={!!actionLoading[payingVendor.vendorId]}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {actionLoading[payingVendor.vendorId] ? (
                  <div className="spinner w-4 h-4" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                ) : <CheckCircle size={16} />}
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatCard({ title, value, subtitle, icon, iconBg, iconColor, highlight }) {
  return (
    <div className={`bg-white border rounded-2xl p-5 shadow-sm hover:border-black/30 transition-all ${highlight ? 'border-purple-200 bg-purple-50/30' : 'border-black/10'}`}>
      <div className="flex justify-between items-start mb-3">
        <p className="text-gray-500 text-sm font-semibold">{title}</p>
        <div className="p-2 rounded-lg" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold font-display tracking-tight ${highlight ? 'text-purple-700' : 'text-black'}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1 font-medium">{subtitle}</p>}
    </div>
  );
}

function Step({ num, text }) {
  return (
    <div className="flex gap-2.5">
      <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
        {num}
      </div>
      <p>{text}</p>
    </div>
  );
}
