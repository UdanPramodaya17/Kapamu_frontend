import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import NotificationBell from '../notifications/NotificationBell';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('kapamu_sidebar_collapsed') === 'true';
  });
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const nextState = !prev;
      localStorage.setItem('kapamu_sidebar_collapsed', String(nextState));
      return nextState;
    });
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close mobile drawer when resizing to desktop/tablet
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  // When either expanded (not collapsed) OR currently hovered in mini-mode:
  const isExpandedView = !isCollapsed || isHovered;

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#000000', display: 'flex', flexDirection: 'column' }}>

      {/* ── MOBILE BACKDROP (< 768px ONLY) ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 49,
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            transition: 'opacity 0.2s ease',
          }}
        />
      )}

      {/* ── SIDEBAR DRAWER ── */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 50,
          boxShadow: sidebarOpen ? '0 10px 40px rgba(0,0,0,0.2)' : 'none',
        }}
        className={[
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'md:translate-x-0 md:transition-none',
        ].join(' ')}
      >
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          isHovered={isHovered}
          setIsHovered={setIsHovered}
        />
      </div>

      {/* ── MAIN CONTENT AREA (Smoothly shifts details on hover/collapse) ── */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isExpandedView ? 'md:ml-[240px]' : 'md:ml-[72px]'
        }`}
        style={{ minHeight: '100vh', background: '#fcfcfc' }}
      >
        {/* Mobile ONLY Top Bar (< 768px, strictly hidden on desktop/tablet) */}
        <header
          className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-black/10 px-4 py-2.5 flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-black border border-black/10 cursor-pointer shadow-xs transition-colors"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <Link to="/" className="flex items-center no-underline">
              <img
                src="/kapamu-dark.svg"
                alt="Kapamu"
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>
          <NotificationBell />
        </header>

        {/* Desktop Top Header Actions */}
        <div className="hidden md:flex items-center justify-end px-6 pt-5 pb-0 max-w-[1600px] w-full mx-auto">
          <NotificationBell />
        </div>

        {/* Page Inner Content with Responsive Padding */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
          {children}
        </main>
      </div>

    </div>
  );
}


