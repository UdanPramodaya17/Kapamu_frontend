import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  ShoppingBag, Calendar, User, MapPin, Phone, Mail, 
  Search, Filter, CheckCircle, Clock, Truck, XCircle, AlertCircle, 
  TrendingUp, DollarSign, Loader2, Sparkles, ChevronDown 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI } from '../../api';
import { format } from 'date-fns';
import { formatPrice } from '../../utils/format';

const STATUS_TABS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getVendorOrders();
      setOrders(res.data.data.orders || []);
    } catch (err) {
      console.error('Error fetching vendor orders:', err);
      toast.error('Failed to load incoming orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await orderAPI.updateStatus(orderId, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders based on active tab and search term
  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    
    const custName = order.customer?.name?.toLowerCase() || '';
    const custEmail = order.customer?.email?.toLowerCase() || '';
    const orderIdStr = order._id?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = custName.includes(searchLower) || 
                          custEmail.includes(searchLower) || 
                          orderIdStr.includes(searchLower);
                          
    return matchesTab && matchesSearch;
  });

  // Calculate statistics from vendor-specific items
  const stats = (() => {
    let revenue = 0;
    let pending = 0;
    let completed = 0;
    
    orders.forEach(o => {
      // Only include paid/confirmed orders in revenue calculations
      const itemTotal = o.vendorTotalAmount || 0;
      if (o.paymentStatus === 'paid') {
        revenue += itemTotal;
      }
      
      if (o.status === 'pending' || o.status === 'processing') {
        pending++;
      } else if (o.status === 'delivered') {
        completed++;
      }
    });

    return {
      revenue,
      pending,
      completed,
      total: orders.length
    };
  })();

  const getStatusStyle = (status) => {
    const configs = {
      pending:    { bg: '#fffbeb', text: '#d97706', label: 'Pending', icon: Clock },
      processing: { bg: '#eff6ff', text: '#2563eb', label: 'Processing', icon: Loader2 },
      shipped:    { bg: '#fdf4ff', text: '#9333ea', label: 'Shipped', icon: Truck },
      delivered:  { bg: '#f0fdf4', text: '#16a34a', label: 'Delivered', icon: CheckCircle },
      cancelled:  { bg: '#fef2f2', text: '#dc2626', label: 'Cancelled', icon: XCircle },
    };
    return configs[status] || configs.pending;
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-px bg-black/15" />
            <span className="font-sans font-bold text-xs uppercase tracking-widest text-black/45">
              Vendor Dashboard · Client Transactions
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold text-black tracking-tight mb-2">
            Incoming Orders
          </h1>
          <p className="text-gray-500 font-medium">Manage and fulfill physical product purchases from your customer base.</p>
        </header>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-500 font-semibold mb-1 text-sm">Product Sales Revenue</p>
                <h3 className="text-2xl font-display font-bold text-black tracking-tight">LKR {formatPrice(stats.revenue)}</h3>
              </div>
              <div className="p-3 rounded-xl text-green-700 bg-green-50 border border-green-200">
                <DollarSign size={18} />
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium">From successful paid transactions</p>
          </div>

          <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-500 font-semibold mb-1 text-sm">Unfulfilled Orders</p>
                <h3 className="text-2xl font-display font-bold text-black tracking-tight">{stats.pending}</h3>
              </div>
              <div className="p-3 rounded-xl text-blue-700 bg-blue-50 border border-blue-200">
                <Clock size={18} />
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium">Pending or processing orders</p>
          </div>

          <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-500 font-semibold mb-1 text-sm">Completed Shipments</p>
                <h3 className="text-2xl font-display font-bold text-black tracking-tight">{stats.completed}</h3>
              </div>
              <div className="p-3 rounded-xl text-green-700 bg-green-50 border border-green-200">
                <CheckCircle size={18} />
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium">Delivered to customers</p>
          </div>

          <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-500 font-semibold mb-1 text-sm">Total Orders Recieved</p>
                <h3 className="text-2xl font-display font-bold text-black tracking-tight">{stats.total}</h3>
              </div>
              <div className="p-3 rounded-xl text-purple-700 bg-purple-50 border border-purple-200">
                <ShoppingBag size={18} />
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium">Accumulated client logs</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
          {/* Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 w-full md:w-auto">
            {STATUS_TABS.map(tab => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 font-sans font-bold text-xs uppercase tracking-wider rounded-full border transition-all whitespace-nowrap ${
                    active 
                      ? 'bg-black border-black text-white' 
                      : 'bg-transparent border-black/10 text-gray-500 hover:border-black/30'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by customer, email or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-black/10 rounded-xl focus:border-black focus:outline-none bg-white text-sm transition-all"
            />
          </div>
        </div>

        {/* Table/Listing */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-black/10 rounded-2xl">
            <Loader2 className="animate-spin text-black mb-3" size={32} />
            <p className="text-gray-500 font-medium text-sm">Querying secure transactions logs...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-black/10 border-dashed rounded-2xl p-16 text-center shadow-sm">
            <ShoppingBag className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="font-display text-xl font-bold text-black mb-1">No Orders Found</h3>
            <p className="text-gray-500 font-medium text-sm mb-4">No purchases match your criteria or active status filter.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredOrders.map(order => {
              const statCfg = getStatusStyle(order.status);
              const StatusIcon = statCfg.icon;
              return (
                <div 
                  key={order._id}
                  className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-black/25 transition-all"
                >
                  {/* Header info */}
                  <div className="flex flex-wrap justify-between items-center border-b border-black/5 pb-4 mb-4 gap-3">
                    <div>
                      <h4 className="font-sans font-bold text-base text-black mb-1">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}</span>
                        <span className="uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">{order.paymentMethod}</span>
                        <span className={`uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${
                          order.paymentStatus === 'paid' 
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : 'bg-red-50 border-red-200 text-red-600'
                        }`}>{order.paymentStatus}</span>
                      </div>
                    </div>

                    {/* Status Changer / Badge */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border" style={{ background: statCfg.bg, borderColor: `${statCfg.text}33`, color: statCfg.text }}>
                        <StatusIcon size={12} className={order.status === 'processing' ? 'animate-spin' : ''} />
                        <span className="font-sans font-bold text-xs uppercase tracking-wider">{statCfg.label}</span>
                      </div>
                      
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <div className="relative">
                          <select
                            disabled={updatingId === order._id}
                            value={order.status}
                            onChange={e => handleStatusChange(order._id, e.target.value)}
                            className="appearance-none pl-3 pr-8 py-1.5 border border-black/10 hover:border-black/35 rounded-xl bg-white text-xs font-bold text-black focus:outline-none cursor-pointer transition-all disabled:opacity-50"
                          >
                            <option value="pending" disabled>Pending</option>
                            <option value="processing">Process</option>
                            <option value="shipped">Ship</option>
                            <option value="delivered">Deliver</option>
                            <option value="cancelled">Cancel</option>
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={12} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Items Section */}
                    <div className="lg:col-span-2 space-y-3">
                      <p className="font-sans font-bold text-xs text-gray-400 uppercase tracking-widest mb-1.5">Products Included</p>
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex gap-4 p-3 bg-gray-50/50 border border-black/5 rounded-xl">
                          <div className="w-14 h-14 bg-white border border-black/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {item.product?.images?.[0] ? (
                              <img src={item.product.images[0]} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingBag size={20} className="text-gray-300" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col justify-center">
                            <p className="text-sm text-black font-bold truncate">{item.name || item.product?.name}</p>
                            <p className="text-xs text-gray-500 font-semibold mt-0.5">LKR {formatPrice(item.price)} × {item.quantity}</p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-bold text-black">LKR {formatPrice(item.price * item.quantity)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Customer & Shipping Section */}
                    <div className="bg-gray-50/30 border border-black/5 rounded-2xl p-5 flex flex-col justify-between">
                      <div>
                        <p className="font-sans font-bold text-xs text-gray-400 uppercase tracking-widest mb-3">Delivery Information</p>
                        
                        <div className="space-y-2.5">
                          <div className="flex gap-2.5 items-start text-sm">
                            <User className="text-gray-400 mt-0.5 flex-shrink-0" size={14} />
                            <div>
                              <p className="text-black font-bold">{order.customer?.name}</p>
                              <p className="text-xs text-gray-400 font-semibold">{order.customer?.email}</p>
                            </div>
                          </div>

                          <div className="flex gap-2.5 items-start text-sm">
                            <Phone className="text-gray-400 mt-0.5 flex-shrink-0" size={14} />
                            <span className="text-gray-700 font-medium">{order.shippingAddress?.phone || 'No phone provided'}</span>
                          </div>

                          <div className="flex gap-2.5 items-start text-sm">
                            <MapPin className="text-gray-400 mt-0.5 flex-shrink-0" size={14} />
                            <div className="text-gray-700 font-medium">
                              <p>{order.shippingAddress?.street}</p>
                              <p>{order.shippingAddress?.city}, {order.shippingAddress?.zipCode}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-black/5 pt-3 mt-4 flex justify-between items-baseline">
                        <span className="font-sans font-bold text-xs text-gray-400 uppercase tracking-widest">Store Earning</span>
                        <span className="text-lg font-display font-bold text-black">LKR {formatPrice(order.vendorTotalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </DashboardLayout>
  );
}
