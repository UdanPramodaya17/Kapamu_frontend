import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Package, TrendingUp, DollarSign, ShoppingCart, Check, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { orderAPI, productAPI } from '../../api';
import { formatPrice } from '../../utils/format';
import { Link } from 'react-router-dom';

export default function SellerDashboard() {
  const user = useSelector(selectCurrentUser);
  const [orders, setOrders] = useState([]);
  const [productsCount, setProductsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersRes, productsRes] = await Promise.all([
          orderAPI.getVendorOrders(),
          productAPI.getMine({ limit: 100 })
        ]);
        setOrders(ordersRes.data.data.orders || []);
        setProductsCount(productsRes.data.data.products?.length || 0);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = (() => {
    let revenue = 0;
    let pending = 0;
    orders.forEach(o => {
      if (o.paymentStatus === 'paid') {
        revenue += o.vendorTotalAmount || 0;
      }
      if (o.status === 'pending' || o.status === 'processing') {
        pending += 1;
      }
    });
    return { revenue, pending };
  })();

  const isSaloonAdmin = user?.role === 'saloon_admin';
  const ordersLink = isSaloonAdmin ? '/saloon-admin/orders' : '/seller/orders';

  return (
    <DashboardLayout>
      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold text-black mb-2 tracking-tight">
          Welcome back, <span>{user?.name}</span>
        </h1>
        <p className="text-gray-500 text-lg font-medium">Here's what's happening in your store today.</p>
      </header>

      {/* Highlight Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard title="Total Revenue" value={`LKR ${formatPrice(stats.revenue)}`} icon={<DollarSign size={18} />} trend="Sales" color="primary" />
        <StatCard title="Orders Pending" value={stats.pending.toString()} icon={<ShoppingCart size={18} />} trend="Fulfill" color="rose" />
        <StatCard title="Active Listings" value={productsCount.toString()} icon={<Package size={18} />} trend="Items" color="blue" />
        <StatCard title="Total Received" value={orders.length.toString()} icon={<TrendingUp size={18} />} trend="Orders" color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-black font-display">Recent Orders</h2>
            <Link to={ordersLink} className="text-sm font-bold text-black hover:underline">View All →</Link>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-black" size={24} />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl border border-black/10 border-dashed">
              <ShoppingCart className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="font-semibold text-gray-700">No orders yet!</p>
              <p className="text-sm text-gray-500 font-medium">List some products to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {orders.slice(0, 3).map(order => (
                <div key={order._id} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-bold text-sm text-black">Order #{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-400 font-medium">By {order.customer?.name} · {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-black">LKR {formatPrice(order.vendorTotalAmount)}</span>
                    <p className="text-xs font-semibold uppercase tracking-wider mt-1 text-gray-500">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Setup Guide */}
        <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-black mb-6 font-display">Setup Guide</h2>
          <div className="space-y-4">
            <SetupTask label="Complete Store Profile" done={true} />
            <SetupTask label="Add First Product" done={productsCount > 0} />
            <SetupTask label="Link Bank Account" done={false} />
          </div>
          <Link to={isSaloonAdmin ? "/saloon-admin/settings" : "/seller/settings"} className="w-full mt-6 btn-primary block text-center py-3 text-sm font-bold rounded-xl">Go to Settings</Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, trend, color }) {
  const colorMap = {
    primary: 'text-black bg-black/5 border border-black/10',
    rose: 'text-red-700 bg-red-50 border border-red-200',
    blue: 'text-blue-700 bg-blue-50 border border-blue-200',
    green: 'text-green-700 bg-green-50 border border-green-200',
  };

  return (
    <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm hover:border-black/35 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-500 font-semibold mb-1 text-sm">{title}</p>
          <h3 className="text-2xl font-display font-bold text-black tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold font-condensed tracking-wider uppercase text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
          {trend}
        </span>
        <span className="text-xs text-gray-500 font-medium">real-time sync</span>
      </div>
    </div>
  );
}

function SetupTask({ label, done }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-black/10">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${done ? 'bg-black border-black text-white' : 'border-gray-400 bg-white'}`}>
        {done && <Check size={12} />}
      </div>
      <span className={done ? 'text-gray-400 line-through' : 'text-gray-700 font-semibold text-sm'}>{label}</span>
    </div>
  );
}
