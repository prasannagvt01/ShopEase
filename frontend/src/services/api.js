import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyOtp: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getByCategory: (categoryId, params) => api.get(`/products/category/${categoryId}`, { params }),
  getFeatured: (params) => api.get('/products/featured', { params }),
  getNewArrivals: (params) => api.get('/products/new-arrivals', { params }),
  getBestSellers: (params) => api.get('/products/best-sellers', { params }),
  search: (query, params) => api.get('/products/search', { params: { q: query, ...params } }),
  getRelated: (productId, params) => api.get(`/products/${productId}/related`, { params }),
  // Admin product operations
  create: (data) => api.post('/admin/products', data),
  update: (id, data) => api.put(`/admin/products/${id}`, data),
  delete: (id) => api.delete(`/admin/products/${id}`),
  toggleFeatured: (id) => api.put(`/admin/products/${id}/toggle-featured`),
  toggleActive: (id) => api.put(`/admin/products/${id}/toggle-active`),
  bulkDelete: (ids) => api.delete('/admin/products/bulk', { data: { ids } }),
  bulkUpdateStock: (updates) => api.put('/admin/products/bulk-stock', { updates }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getRoot: () => api.get('/categories/root'),
  getById: (id) => api.get(`/categories/${id}`),
  getSubcategories: (id) => api.get(`/categories/${id}/subcategories`),
  // Admin category operations
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/add', data),
  updateItem: (productId, quantity) => api.put(`/cart/update/${productId}?quantity=${quantity}`),
  removeItem: (productId) => api.delete(`/cart/remove/${productId}`),
  clear: () => api.delete('/cart/clear'),
  applyCoupon: (code) => api.post('/cart/apply-coupon', { code }),
  removeCoupon: () => api.delete('/cart/remove-coupon'),
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getMyOrders: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
  reorder: (id) => api.post(`/orders/${id}/reorder`),
  downloadInvoice: (id) => api.get(`/orders/${id}/invoice`, { responseType: 'blob' }),
};

// Reviews API
export const reviewsAPI = {
  getByProduct: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  markHelpful: (id) => api.post(`/reviews/${id}/helpful`),
  reportReview: (id, reason) => api.post(`/reviews/${id}/report`, { reason }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  initiateChangePassword: (data) => api.post('/users/change-password-init', data),
  changePassword: (data) => api.put('/users/change-password', data),
  updateAvatar: (formData) => api.put('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  setDefaultAddress: (id) => api.put(`/users/addresses/${id}/default`),
};

// Wishlist API
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist/add', { productId }),
  remove: (productId) => api.delete(`/wishlist/remove/${productId}`),
  clear: () => api.delete('/wishlist/clear'),
  moveToCart: (productId) => api.post(`/wishlist/${productId}/move-to-cart`),
};

// Coupons API
export const couponsAPI = {
  getAvailable: () => api.get('/coupons/available'),
};

// Admin API
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),

  // Products
  getProducts: (params) => api.get('/admin/products', { params }),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  uploadBulk: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/products/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Categories
  getCategories: (params) => api.get('/admin/categories', { params }),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  // Orders
  getOrders: (params) => api.get('/admin/orders', { params }),
  getOrderById: (id) => api.get(`/admin/orders/${id}`),
  getOrdersByStatus: (status, params) => api.get(`/admin/orders/status/${status}`, { params }),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status?status=${status}`),
  updateTrackingNumber: (id, trackingNumber) =>
    api.put(`/admin/orders/${id}/tracking?trackingNumber=${trackingNumber}`),
  addOrderNote: (id, note) => api.post(`/admin/orders/${id}/notes`, { note }),
  downloadInvoice: (id) => api.get(`/orders/${id}/invoice`, { responseType: 'blob' }),

  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role?role=${role}`),
  adminDeactivateUser: (itemId) => api.put(`/admin/users/${itemId}/deactivate`), // This was lines 185-186? No, let's look at view_file output.
  getUserOrders: (id) => api.get(`/admin/users/${id}/orders`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),

  // Payments
  getPayments: (params) => api.get('/admin/payments', { params }),

  // Complaints
  getComplaints: (params) => api.get('/admin/complaints', { params }),
  updateComplaintStatus: (id, status, notes) =>
    api.put(`/admin/complaints/${id}/status?status=${status}${notes ? `&notes=${encodeURIComponent(notes)}` : ''}`),

  // Warehouses
  getWarehouses: () => api.get('/admin/warehouses'),
  createWarehouse: (data) => api.post('/admin/warehouses', data),
  updateWarehouse: (id, data) => api.put(`/admin/warehouses/${id}`, data),
  deleteWarehouse: (id) => api.delete(`/admin/warehouses/${id}`),

  // Inventory
  getLowStockAlerts: () => api.get('/admin/inventory/low-stock'),
  updateStock: (productId, change, type, notes) =>
    api.post('/admin/inventory/update-stock', null, {
      params: { productId, change, type, notes }
    }),

  // Coupons
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),

  // Reports
  getReports: (startDate, endDate) => api.get('/admin/reports', { params: { startDate, endDate } }),

  // Admin Role Management
  getAdminUsers: () => api.get('/admin/admin-users'),
  updateAdminPermissions: (id, permissions) => api.put(`/admin/admin-users/${id}/permissions`, permissions),
  getActivityLogs: () => api.get('/admin/activity-logs'),
};

// Payment API
export const paymentAPI = {
  createRazorpayOrder: (orderId) => api.post(`/payments/razorpay/order/${orderId}`),
  verifyRazorpayPayment: (data) => api.post('/payments/razorpay/verify', data),
};
