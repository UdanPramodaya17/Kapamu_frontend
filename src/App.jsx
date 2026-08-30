import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole } from './features/auth/authSlice';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Public Pages
import HomePage from './pages/customer/HomePage';
import SaloonsPage from './pages/customer/SaloonsPage';
import SaloonDetailPage from './pages/customer/SaloonDetailPage';
import ShopPage from './pages/customer/ShopPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import AiStyleSuggestionPage from './pages/customer/AiStyleSuggestionPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import SetupPasswordPage from './pages/auth/SetupPasswordPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import MyBookingsPage from './pages/customer/MyBookingsPage';
import MyOrdersPage from './pages/customer/MyOrdersPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';
import PaymentReturnPage from './pages/customer/PaymentReturnPage';
import PaymentCancelPage from './pages/customer/PaymentCancelPage';

// Saloon Admin Pages
import SaloonAdminDashboard from './pages/saloon-admin/SaloonAdminDashboard';
import SaloonBookingsPage from './pages/saloon-admin/SaloonBookingsPage';
import SaloonServicesPage from './pages/saloon-admin/SaloonServicesPage';
import SaloonBarbersPage from './pages/saloon-admin/SaloonBarbersPage';
import SaloonHolidaysPage from './pages/saloon-admin/SaloonHolidaysPage';
import SaloonLeaveApprovals from './pages/saloon-admin/SaloonLeaveApprovals';
import SaloonAdminSettingsPage from './pages/saloon-admin/SaloonAdminSettingsPage';
import SaloonAnalyticsPage from './pages/saloon-admin/SaloonAnalyticsPage';

// Barber Pages
import BarberDashboard from './pages/barber/BarberDashboard';
import BarberSchedulePage from './pages/barber/BarberSchedulePage';
import BarberAppointmentsPage from './pages/barber/BarberAppointmentsPage';
import BarberSettingsPage from './pages/barber/BarberSettingsPage';

// Super Admin Pages
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import SaloonsManagementPage from './pages/super-admin/SaloonsManagementPage';
import SuperAdminProfilePage from './pages/super-admin/SuperAdminProfilePage';
import SuperAdminSellersPage from './pages/super-admin/SuperAdminSellersPage';
import SuperAdminProductsPage from './pages/super-admin/SuperAdminProductsPage';
import SuperAdminPayoutsPage from './pages/super-admin/SuperAdminPayoutsPage';
import SuperAdminReviewsPage from './pages/super-admin/SuperAdminReviewsPage';
import SuperAdminAnalyticsPage from './pages/super-admin/SuperAdminAnalyticsPage';

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProductsPage from './pages/seller/SellerProductsPage';
import SellerEarningsPage from './pages/seller/SellerEarningsPage';
import SellerOrdersPage from './pages/seller/SellerOrdersPage';

// ─── Route Guards ───────────────────────────────────────────────
function PrivateRoute({ children, allowedRoles }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);
  if (isAuthenticated) {
    const roleRoutes = {
      super_admin: '/admin',
      saloon_admin: '/saloon-admin',
      barber: '/barber',
      seller: '/seller',
      customer: '/customer',
    };
    return <Navigate to={roleRoutes[role] || '/'} replace />;
  }
  return children;
}

// ─── Routes ─────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/saloons" element={<SaloonsPage />} />
      <Route path="/saloons/:id" element={<SaloonDetailPage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/shop/:id" element={<ProductDetailPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/ai-style" element={<AiStyleSuggestionPage />} />

      {/* Auth */}
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
      <Route path="/set-password" element={<PublicOnlyRoute><SetupPasswordPage /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
      <Route path="/reset-password" element={<PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute>} />

      {/* Customer */}
      <Route path="/customer" element={<PrivateRoute allowedRoles={['customer']}><CustomerDashboard /></PrivateRoute>} />
      <Route path="/customer/bookings" element={<PrivateRoute allowedRoles={['customer']}><MyBookingsPage /></PrivateRoute>} />
      <Route path="/customer/orders" element={<PrivateRoute allowedRoles={['customer']}><MyOrdersPage /></PrivateRoute>} />
      <Route path="/customer/profile" element={<PrivateRoute allowedRoles={['customer']}><CustomerProfilePage /></PrivateRoute>} />

      {/* PayHere payment return/cancel — public, no auth guard */}
      <Route path="/payment/return" element={<PaymentReturnPage />} />
      <Route path="/payment/cancel" element={<PaymentCancelPage />} />

      {/* Saloon Admin */}
      <Route path="/saloon-admin" element={<PrivateRoute allowedRoles={['saloon_admin']}><SaloonAdminDashboard /></PrivateRoute>} />
      <Route path="/saloon-admin/bookings" element={<PrivateRoute allowedRoles={['saloon_admin']}><SaloonBookingsPage /></PrivateRoute>} />
      <Route path="/saloon-admin/services" element={<PrivateRoute allowedRoles={['saloon_admin']}><SaloonServicesPage /></PrivateRoute>} />
      <Route path="/saloon-admin/products" element={<PrivateRoute allowedRoles={['saloon_admin']}><SellerProductsPage /></PrivateRoute>} />
      <Route path="/saloon-admin/orders" element={<PrivateRoute allowedRoles={['saloon_admin']}><SellerOrdersPage /></PrivateRoute>} />
      <Route path="/saloon-admin/earnings" element={<PrivateRoute allowedRoles={['saloon_admin']}><SellerEarningsPage /></PrivateRoute>} />
      <Route path="/saloon-admin/barbers" element={<PrivateRoute allowedRoles={['saloon_admin']}><SaloonBarbersPage /></PrivateRoute>} />
      <Route path="/saloon-admin/leaves" element={<PrivateRoute allowedRoles={['saloon_admin']}><SaloonLeaveApprovals /></PrivateRoute>} />
      <Route path="/saloon-admin/holidays" element={<PrivateRoute allowedRoles={['saloon_admin']}><SaloonHolidaysPage /></PrivateRoute>} />
      <Route path="/saloon-admin/settings" element={<PrivateRoute allowedRoles={['saloon_admin']}><SaloonAdminSettingsPage /></PrivateRoute>} />
      <Route path="/saloon-admin/analytics" element={<PrivateRoute allowedRoles={['saloon_admin']}><SaloonAnalyticsPage /></PrivateRoute>} />
      <Route path="/saloon-admin/*" element={<PrivateRoute allowedRoles={['saloon_admin']}><SaloonAdminDashboard /></PrivateRoute>} />

      {/* Barber */}
      <Route path="/barber" element={<PrivateRoute allowedRoles={['barber']}><BarberDashboard /></PrivateRoute>} />
      <Route path="/barber/schedule" element={<PrivateRoute allowedRoles={['barber']}><BarberSchedulePage /></PrivateRoute>} />
      <Route path="/barber/appointments" element={<PrivateRoute allowedRoles={['barber']}><BarberAppointmentsPage /></PrivateRoute>} />
      <Route path="/barber/settings" element={<PrivateRoute allowedRoles={['barber']}><BarberSettingsPage /></PrivateRoute>} />
      <Route path="/barber/*" element={<PrivateRoute allowedRoles={['barber']}><BarberDashboard /></PrivateRoute>} />

      {/* Seller */}
      <Route path="/seller" element={<PrivateRoute allowedRoles={['seller']}><SellerDashboard /></PrivateRoute>} />
      <Route path="/seller/products" element={<PrivateRoute allowedRoles={['seller']}><SellerProductsPage /></PrivateRoute>} />
      <Route path="/seller/earnings" element={<PrivateRoute allowedRoles={['seller']}><SellerEarningsPage /></PrivateRoute>} />
      <Route path="/seller/orders" element={<PrivateRoute allowedRoles={['seller']}><SellerOrdersPage /></PrivateRoute>} />
      <Route path="/seller/*" element={<PrivateRoute allowedRoles={['seller']}><SellerDashboard /></PrivateRoute>} />

      {/* Super Admin */}
      <Route path="/admin" element={<PrivateRoute allowedRoles={['super_admin']}><SuperAdminDashboard /></PrivateRoute>} />
      <Route path="/admin/saloons" element={<PrivateRoute allowedRoles={['super_admin']}><SaloonsManagementPage /></PrivateRoute>} />
      <Route path="/admin/sellers" element={<PrivateRoute allowedRoles={['super_admin']}><SuperAdminSellersPage /></PrivateRoute>} />
      <Route path="/admin/products" element={<PrivateRoute allowedRoles={['super_admin']}><SuperAdminProductsPage /></PrivateRoute>} />
      <Route path="/admin/payouts" element={<PrivateRoute allowedRoles={['super_admin']}><SuperAdminPayoutsPage /></PrivateRoute>} />
      <Route path="/admin/analytics" element={<PrivateRoute allowedRoles={['super_admin']}><SuperAdminAnalyticsPage /></PrivateRoute>} />
      <Route path="/admin/reviews" element={<PrivateRoute allowedRoles={['super_admin']}><SuperAdminReviewsPage /></PrivateRoute>} />
      <Route path="/admin/profile" element={<PrivateRoute allowedRoles={['super_admin']}><SuperAdminProfilePage /></PrivateRoute>} />
      <Route path="/admin/*" element={<PrivateRoute allowedRoles={['super_admin']}><SuperAdminDashboard /></PrivateRoute>} />

      {/* 404 */}
      <Route path="*" element={
        <div className="min-h-screen bg-dark-900 flex items-center justify-center text-center px-4">
          <div>
            <h1 className="font-display text-9xl font-bold gradient-text mb-4">404</h1>
            <p className="text-gray-400 text-xl mb-8">This page doesn't exist</p>
            <a href="/" className="btn-primary inline-block">Go Home</a>
          </div>
        </div>
      } />
    </Routes>
  );
}

// ─── App ─────────────────────────────────────────────────────────
export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            gutter={10}
            toastOptions={{
              duration: 3500,
              // ── Base style — clean white editorial ──
              style: {
                background: '#ffffff',
                color: '#111111',
                border: '1px solid rgba(0,0,0,0.10)',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontWeight: 500,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
                padding: '12px 16px',
                maxWidth: '360px',
              },
              // ── Success — black icon ──
              success: {
                style: {
                  background: '#ffffff',
                  color: '#111111',
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderLeft: '3px solid #16a34a',
                },
                iconTheme: { primary: '#16a34a', secondary: '#ffffff' },
              },
              // ── Error — red accent ──
              error: {
                style: {
                  background: '#ffffff',
                  color: '#111111',
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderLeft: '3px solid #dc2626',
                },
                iconTheme: { primary: '#dc2626', secondary: '#ffffff' },
              },
              // ── Loading — black spinner ──
              loading: {
                style: {
                  background: '#ffffff',
                  color: '#111111',
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderLeft: '3px solid #000000',
                },
                iconTheme: { primary: '#000000', secondary: '#f3f4f6' },
              },
            }}
          />
        </BrowserRouter>
      </Provider>
    </GoogleOAuthProvider>
  );
}
