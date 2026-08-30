import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
  googleAuth: (data) => api.post('/auth/google', data),
  sendVerification: (data) => api.post('/auth/send-verification', data),
  verifyCode: (data) => api.post('/auth/verify-code', data),
  sendSetupPassword: (data) => api.post('/auth/send-setup-password', data),
  setNewPassword: (data) => api.post('/auth/set-new-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
};

export const saloonAPI = {
  getAll: (params) => api.get('/saloons', { params }),
  getById: (id) => api.get(`/saloons/${id}`),
  getMy: () => api.get('/saloons/my'),
  getPending: () => api.get('/saloons/pending'),
  create: (data) => api.post('/saloons', data),
  update: (id, data) => api.put(`/saloons/${id}`, data),
  verify: (id) => api.put(`/saloons/${id}/verify`),
  getBarbers: (id, params) => api.get(`/saloons/${id}/barbers`, { params }),
  getServices: (saloonId) => api.get(`/saloons/${saloonId}/services`),
  addHoliday: (id, data) => api.post(`/saloons/${id}/holidays`, data),
  removeHoliday: (id, holidayId) => api.delete(`/saloons/${id}/holidays/${holidayId}`),
  delete: (id) => api.delete(`/saloons/${id}`),
  toggleStatus: (id) => api.patch(`/saloons/${id}/status`),
  toggleRecommended: (id) => api.patch(`/saloons/${id}/recommended`),
  toggleTrending: (id) => api.patch(`/saloons/${id}/trending`),
  getReviews: (id) => api.get(`/saloons/${id}/reviews`),
};

export const barberAPI = {
  getById: (id) => api.get(`/barbers/${id}`),
  getMe: () => api.get('/barbers/me'),
  add: (data) => api.post('/barbers', data),
  updateMe: (data) => api.put('/barbers/me', data),
  markLeave: (id, data) => api.put(`/barbers/${id}/leave`, data),
  updateLeaveStatus: (id, leaveId, data) => api.put(`/barbers/${id}/leave/${leaveId}/status`, data),
  cancelLeave: (leaveId) => api.delete(`/barbers/leave/${leaveId}`),
  delete: (id) => api.delete(`/barbers/${id}`),
  toggleStatus: (id) => api.patch(`/barbers/${id}/status`),
  updateByAdmin: (id, data) => api.put(`/barbers/${id}/admin-update`, data),
};

export const appointmentAPI = {
  getSlots: (params) => api.get('/appointments/slots', { params }),
  create: (data) => api.post('/appointments', data),
  getMy: (params) => api.get('/appointments/my', { params }),
  getBarberSchedule: (params) => api.get('/appointments/barber', { params }),
  getSaloonAppointments: (params) => api.get('/appointments/saloon', { params }),
  updateStatus: (id, data) => api.put(`/appointments/${id}/status`, data),
  cancel: (id, data) => api.delete(`/appointments/${id}`, { data }),
  createReview: (id, data) => api.post(`/appointments/${id}/reviews`, data),
};

export const serviceAPI = {
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getMine: (params) => api.get('/products/mine', { params }),            // vendor's own products
  getPendingAdmin: (params) => api.get('/products/admin/all', { params }), // superadmin review panel
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  approve: (id) => api.patch(`/products/${id}/approve`),
  reject: (id, data) => api.patch(`/products/${id}/reject`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getReviews: (productId) => api.get(`/products/${productId}/reviews`),
  createReview: (productId, data) => api.post(`/products/${productId}/reviews`, data),
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMy: (params) => api.get('/orders/my', { params }),
  getVendorOrders: (params) => api.get('/orders/vendor', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  cancel: (id, data) => api.delete(`/orders/${id}`, { data }),
};

export const sellerAPI = {
  getAll: () => api.get('/sellers/all'),
  create: (data) => api.post('/sellers', data),
  toggleStatus: (id) => api.put(`/sellers/${id}/status`),
  getMyProfile: () => api.get('/sellers/my'),
  updateMyProfile: (data) => api.put('/sellers/my', data),
};

export const analyticsAPI = {
  getSaloon: (saloonId, params) => api.get(`/analytics/saloon/${saloonId}`, { params }),
  getGlobal: () => api.get('/analytics/global'),
  getBarber: (params) => api.get('/analytics/barber', { params }),
  getSaloonBarbersPerformance: (saloonId, params) => api.get(`/analytics/saloon/${saloonId}/barbers-performance`, { params }),
};

export const earningsAPI = {
  getCommissionRate: () => api.get('/earnings/commission'),
  updateCommissionRate: (data) => api.put('/earnings/commission', data),
  getMine: (params) => api.get('/earnings/mine', { params }),
  getAllVendors: (params) => api.get('/earnings/admin/all', { params }),
  markAsPaid: (data) => api.post('/earnings/admin/pay', data),
  getPayoutHistory: (params) => api.get('/earnings/admin/history', { params }),
};

export const paymentAPI = {
  initiate: (data) => api.post('/payment/initiate', data),
  verify: (payhereOrderId) => api.get(`/payment/verify/${payhereOrderId}`),
};

export const reviewAPI = {
  getAllAdmin: (params) => api.get('/reviews', { params }),
  deleteAdmin: (reviewId) => api.delete(`/reviews/${reviewId}`),
  getFeatured: () => api.get('/reviews/featured'),
  toggleFeaturedAdmin: (reviewId) => api.patch(`/reviews/${reviewId}/featured`),
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};
