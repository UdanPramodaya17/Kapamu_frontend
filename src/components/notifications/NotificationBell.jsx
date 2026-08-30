import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCheck, Trash2, Scissors, ShoppingBag, CreditCard, Star,
  Info, ExternalLink, CheckCircle2, Clock
} from 'lucide-react';
import { notificationAPI } from '../../api';
import toast from 'react-hot-toast';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch unread count for badge
  const fetchUnreadCount = async () => {
    try {
      const res = await notificationAPI.getUnreadCount();
      if (res?.data?.success) {
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch {
      // Silent fail on background polling
    }
  };

  // Fetch list of notifications
  const fetchNotifications = async (unreadOnly = false) => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll({
        page: 1,
        limit: 30,
        unreadOnly: unreadOnly ? 'true' : undefined,
      });
      if (res?.data?.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch {
      // Silent error
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch & Polling
  useEffect(() => {
    fetchUnreadCount();

    // Poll every 25 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 25000);

    // Refresh when user returns to tab
    const onFocus = () => fetchUnreadCount();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // When dropdown opens or tab changes, fetch notifications
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(activeTab === 'unread');
    }
  }, [isOpen, activeTab]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Mark single notification as read
  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await notificationAPI.markAsRead(id);
      if (res?.data?.success) {
        setNotifications(prev =>
          prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch {
      toast.error('Failed to update notification');
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const res = await notificationAPI.markAllAsRead();
      if (res?.data?.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success('All marked as read');
      }
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  // Delete notification
  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationAPI.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      fetchUnreadCount();
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  // Click on a notification item
  const handleItemClick = async (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
    setIsOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  // Time formatter helper (Relative time)
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Type icon mapper
  const getTypeIcon = (type) => {
    switch (type) {
      case 'booking':
        return <Scissors size={15} className="text-black" />;
      case 'order':
        return <ShoppingBag size={15} className="text-black" />;
      case 'payout':
        return <CreditCard size={15} className="text-black" />;
      case 'review':
        return <Star size={15} className="text-amber-500 fill-amber-500" />;
      default:
        return <Info size={15} className="text-black" />;
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* ── Bell Trigger Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-xl bg-gray-100/90 hover:bg-black hover:text-white flex items-center justify-center text-gray-700 transition-all duration-200 cursor-pointer border border-black/5 shadow-xs"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ── */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-black/10 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="p-4 border-b border-black/5 flex items-center justify-between bg-zinc-900 text-white">
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-sm tracking-wide">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold tracking-wider">
                  {unreadCount} NEW
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-xs text-zinc-300 hover:text-white flex items-center gap-1 font-bold transition-colors cursor-pointer bg-transparent border-none p-0"
                title="Mark all as read"
              >
                <CheckCheck size={14} />
                <span className="text-[11px]">Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-black/5 bg-gray-50/70 p-1 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all border-none cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-black shadow-xs'
                  : 'bg-transparent text-gray-500 hover:text-black'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unread')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all border-none cursor-pointer ${
                activeTab === 'unread'
                  ? 'bg-white text-black shadow-xs'
                  : 'bg-transparent text-gray-500 hover:text-black'
              }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-black/5">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs font-medium">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center gap-2 text-gray-400">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <CheckCircle2 size={24} />
                </div>
                <p className="font-bold text-xs text-gray-700 m-0">All caught up!</p>
                <p className="text-[11px] text-gray-400 m-0">
                  {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-gray-50/80 transition-colors cursor-pointer group ${
                    !n.isRead ? 'bg-blue-50/30' : ''
                  }`}
                >
                  {/* Category Icon */}
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-black/5 mt-0.5">
                    {getTypeIcon(n.type)}
                  </div>

                  {/* Body */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs leading-tight truncate m-0 ${
                        !n.isRead ? 'font-black text-black' : 'font-semibold text-gray-700'
                      }`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap flex items-center gap-1 shrink-0">
                        <Clock size={10} />
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>

                    <p className="text-[12px] text-gray-600 line-clamp-2 mt-1 mb-0 leading-snug">
                      {n.message}
                    </p>

                    {/* Action Footer */}
                    <div className="flex items-center justify-between mt-2 pt-1">
                      {n.link ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-black flex items-center gap-0.5 group-hover:underline">
                          View details <ExternalLink size={10} />
                        </span>
                      ) : <span />}

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.isRead && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(n._id, e)}
                            className="p-1 text-gray-400 hover:text-black rounded bg-transparent border-none cursor-pointer"
                            title="Mark as read"
                          >
                            <CheckCheck size={13} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDelete(n._id, e)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded bg-transparent border-none cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  );
}
