import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Scissors, LayoutDashboard, Calendar, ShoppingBag, Users,
  Building2, Star, BarChart2, Settings, LogOut, Clock, Package, Wallet, CreditCard, User, X,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { selectCurrentUser, logout } from '../../features/auth/authSlice';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

const menus = {
  customer: [
    { to: '/customer', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/customer/bookings', icon: Calendar, label: 'My Bookings' },
    { to: '/customer/orders', icon: ShoppingBag, label: 'My Orders' },
    { to: '/customer/profile', icon: User, label: 'My Profile' },
    { to: '/saloons', icon: Scissors, label: 'Find Salons' },
    { to: '/shop', icon: ShoppingBag, label: 'Shop' },
  ],
  saloon_admin: [
    { to: '/saloon-admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/saloon-admin/bookings', icon: Calendar, label: 'Bookings' },
    { to: '/saloon-admin/services', icon: Scissors, label: 'Services' },
    { to: '/saloon-admin/products', icon: ShoppingBag, label: 'E-Shop Products' },
    { to: '/saloon-admin/orders', icon: Package, label: 'Incoming Orders' },
    { to: '/saloon-admin/earnings', icon: Wallet, label: 'Earnings' },
    { to: '/saloon-admin/barbers', icon: Users, label: 'Barbers' },
    { to: '/saloon-admin/leaves', icon: Star, label: 'Leave Requests' },
    { to: '/saloon-admin/holidays', icon: Calendar, label: 'Holidays' },
    { to: '/saloon-admin/analytics', icon: BarChart2, label: 'Analytics' },
    { to: '/saloon-admin/settings', icon: Settings, label: 'Settings' },
  ],
  barber: [
    { to: '/barber', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/barber/schedule', icon: Calendar, label: 'My Schedule' },
    { to: '/barber/appointments', icon: Clock, label: 'Appointments' },
    { to: '/barber/settings', icon: Settings, label: 'Settings' },
  ],
  super_admin: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/saloons', icon: Building2, label: 'Saloons' },
    { to: '/admin/sellers', icon: ShoppingBag, label: 'Sellers' },
    { to: '/admin/products', icon: Package, label: 'Product Approvals' },
    { to: '/admin/payouts', icon: CreditCard, label: 'Vendor Payouts' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
    { to: '/admin/reviews', icon: Star, label: 'Manage Reviews' },
    { to: '/admin/profile', icon: Settings, label: 'Settings' },
  ],
  seller: [
    { to: '/seller', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/seller/products', icon: ShoppingBag, label: 'My Products' },
    { to: '/seller/earnings', icon: Wallet, label: 'Earnings' },
    { to: '/seller/orders', icon: Calendar, label: 'Orders' },
    { to: '/seller/settings', icon: Settings, label: 'Settings' },
  ]
};

export default function Sidebar({ onClose, isCollapsed, onToggleCollapse, isHovered, setIsHovered }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const role = user?.role || 'customer';
  const links = menus[role] || menus.customer;

  const handleLogout = async () => {
    if (onClose) onClose();
    try { await authAPI.logout(); } catch { }
    dispatch(logout());
    toast.success('Logged out');
    navigate('/');
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  // On desktop, whether expanded view is active
  const isDesktopExpanded = !isCollapsed || isHovered;

  return (
    <aside
      onMouseEnter={() => { if (isCollapsed && setIsHovered) setIsHovered(true); }}
      onMouseLeave={() => { if (isCollapsed && setIsHovered) setIsHovered(false); }}
      className={`h-full bg-white border-r border-black/10 flex flex-col shrink-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] w-[280px] ${
        isDesktopExpanded ? 'md:w-[240px] md:shadow-none' : 'md:w-[72px] md:shadow-none'
      }`}
    >
      {/* Logo Header */}
      <div className="p-3 border-b border-black/5 flex items-center justify-between min-h-[64px]">
        {/* On mobile: full logo + X button */}
        <div className="flex md:hidden items-center justify-between w-full">
          <Link to="/" onClick={handleLinkClick} className="flex items-center no-underline">
            <img src="/kapamu-dark.svg" alt="Kapamu" className="h-7 w-auto object-contain" />
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-black border-none cursor-pointer"
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* On desktop: if expanded show clean logo; if mini show centered scissors icon */}
        <div className="hidden md:flex items-center w-full">
          {isDesktopExpanded ? (
            <Link to="/" onClick={handleLinkClick} className="flex items-center no-underline" title="Kapamu Home">
              <img src="/kapamu-dark.svg" alt="Kapamu" className="h-7 w-auto object-contain" />
            </Link>
          ) : (
            <div className="w-full flex items-center justify-center p-0">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
                <Scissors size={18} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Info Card */}
      <div className="p-3">
        {/* On mobile, always full user info. On desktop, toggle */}
        <div className={`p-2.5 rounded-xl bg-gray-50/80 border border-black/5 flex items-center gap-3 transition-all ${
          isDesktopExpanded ? 'justify-start' : 'md:justify-center md:p-2'
        }`}>
          <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-extrabold text-sm shrink-0 overflow-hidden border border-black/10 shadow-sm">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          <div className={`min-w-0 flex-1 overflow-hidden transition-all duration-300 ${
            isDesktopExpanded ? 'block opacity-100 translate-x-0' : 'block md:hidden md:opacity-0 md:-translate-x-2'
          }`}>
            <p className="text-black font-bold text-xs leading-tight truncate m-0">{user?.name}</p>
            <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-black/5 text-gray-600 text-[10px] font-extrabold tracking-wider uppercase rounded">
              {role?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu Links */}
      <nav className="flex-1 px-2.5 py-2 flex flex-col gap-1 overflow-y-auto no-scrollbar">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === `/${role}` || to === '/admin' || to === '/barber' || to === '/saloon-admin'}
            onClick={handleLinkClick}
            title={!isDesktopExpanded ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100/70'
              } ${!isDesktopExpanded ? 'md:justify-center md:px-0' : ''}`
            }
          >
            <Icon size={18} className="shrink-0" />
            <span className={`truncate transition-all duration-300 ${
              isDesktopExpanded ? 'block opacity-100 translate-x-0' : 'block md:hidden md:opacity-0 md:-translate-x-2'
            }`}>
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Footer */}
      <div className="p-3 border-t border-black/5">
        <button
          onClick={handleLogout}
          title={!isDesktopExpanded ? 'Logout' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-red-600 hover:bg-red-50/80 transition-all border-none bg-transparent cursor-pointer ${
            !isDesktopExpanded ? 'md:justify-center md:px-0' : ''
          }`}
        >
          <LogOut size={17} className="shrink-0" />
          <span className={`transition-all duration-300 ${
            isDesktopExpanded ? 'block opacity-100 translate-x-0' : 'block md:hidden md:opacity-0 md:-translate-x-2'
          }`}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}


