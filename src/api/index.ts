import { axiosPrivate, axiosPublic } from './axios';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  shopkeeperSignup: (d: { shopName: string; mobile: string; password: string }) =>
    axiosPublic.post('/auth/shopkeeper/signup', d),
  customerSignup: (d: { name: string; mobile: string }) =>
    axiosPublic.post('/auth/customer/signup', d),
  verifyOtp: (d: { mobile: string; otp: string; purpose: string }) =>
    axiosPublic.post('/auth/verify-otp', d),
  setPin: (d: { mobile: string; pin: string; token: string }) =>
    axiosPublic.post('/auth/set-pin', d),
  loginWithPassword: (d: { mobile: string; password: string }) =>
    axiosPublic.post('/auth/login/password', d),
  loginWithPin: (d: { mobile: string; pin: string; role: string }) =>
    axiosPublic.post('/auth/login/pin', d),
  adminLogin: (d: { email: string; password: string }) =>
    axiosPublic.post('/auth/admin/login', d),
  refreshToken: () => axiosPublic.post('/auth/refresh-token'),
  forgotPin: (mobile: string) => axiosPublic.post('/auth/forgot-pin', { mobile }),
  getMyProfile: () => axiosPrivate.get('/auth/me'),
};

// ── Shop ──────────────────────────────────────────────────────────────────────
export const shopApi = {
  getMyShop: () => axiosPrivate.get('/shop'),
  updateShop: (d: object) => axiosPrivate.patch('/shop', d),
  submitVerification: (d: object) => axiosPrivate.post('/shop/verify', d),
  getVerificationStatus: () => axiosPrivate.get('/shop/verify/status'),
};

// ── Customer ──────────────────────────────────────────────────────────────────
export const customerApi = {
  addCustomer: (d: { name: string; mobile: string; openingBalance?: number }) =>
    axiosPrivate.post('/customers', d),
  getCustomers: (params?: object) => axiosPrivate.get('/customers', { params }),
  rateCustomer: (id: string, rating: number) =>
    axiosPrivate.patch(`/customers/${id}/rate`, { rating }),
  toggleBlock: (id: string) => axiosPrivate.patch(`/customers/${id}/block`),
  getMyProfile: () => axiosPrivate.get('/customers/me'),
};

// ── Transaction ───────────────────────────────────────────────────────────────
export const transactionApi = {
  addTransaction: (d: { customerId: string; type: string; amount: number; note?: string }) =>
    axiosPrivate.post('/transactions', d),
  getShopTransactions: (params?: object) => axiosPrivate.get('/transactions', { params }),
  getMyTransactions: (params?: object) => axiosPrivate.get('/transactions/my', { params }),
  getMonthlySummary: (year?: number, month?: number) =>
    axiosPrivate.get('/transactions/summary', { params: { year, month } }),
};

// ── Product ───────────────────────────────────────────────────────────────────
export const productApi = {
  getProducts: (category?: string) =>
    axiosPrivate.get('/products', { params: { category } }),
  addProduct: (d: object) => axiosPrivate.post('/products', d),
  updateProduct: (id: string, d: object) => axiosPrivate.patch(`/products/${id}`, d),
  deleteProduct: (id: string) => axiosPrivate.delete(`/products/${id}`),
};

// ── Reminder ──────────────────────────────────────────────────────────────────
export const reminderApi = {
  sendReminder: (d: object) => axiosPrivate.post('/reminders', d),
  getHistory: (customerId?: string) =>
    axiosPrivate.get('/reminders', { params: { customerId } }),
  getSettings: () => axiosPrivate.get('/reminders/settings'),
  updateSettings: (d: object) => axiosPrivate.patch('/reminders/settings', d),
};

// ── Income/Expense ────────────────────────────────────────────────────────────
export const ieApi = {
  getEntries: (params?: object) => axiosPrivate.get('/income-expense', { params }),
  addEntry: (d: object) => axiosPrivate.post('/income-expense', d),
  getMonthlySummary: (year?: number, month?: number) =>
    axiosPrivate.get('/income-expense/summary', { params: { year, month } }),
  updateEntry: (id: string, d: object) => axiosPrivate.patch(`/income-expense/${id}`, d),
  deleteEntry: (id: string) => axiosPrivate.delete(`/income-expense/${id}`),
};

// ── Staff ─────────────────────────────────────────────────────────────────────
export const staffApi = {
  getStaff: () => axiosPrivate.get('/staff'),
  addStaff: (d: object) => axiosPrivate.post('/staff', d),
  updateStaff: (id: string, d: object) => axiosPrivate.patch(`/staff/${id}`, d),
  removeStaff: (id: string) => axiosPrivate.delete(`/staff/${id}`),
  resetPin: (id: string, pin: string) => axiosPrivate.post(`/staff/${id}/reset-pin`, { pin }),
};

// ── Notification ──────────────────────────────────────────────────────────────
export const notifApi = {
  getAll: (params?: object) => axiosPrivate.get('/notifications', { params }),
  markRead: (id: string) => axiosPrivate.patch(`/notifications/${id}/read`),
  markAllRead: () => axiosPrivate.patch('/notifications/read-all'),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: () => axiosPrivate.get('/admin/stats'),
  getAnalytics: (from?: string, to?: string) =>
    axiosPrivate.get('/admin/analytics', { params: { from, to } }),
  getShops: (params?: object) => axiosPrivate.get('/admin/shops', { params }),
  createShop: (d: object) => axiosPrivate.post('/admin/shops', d),
  updateShop: (id: string, d: object) => axiosPrivate.patch(`/admin/shops/${id}`, d),
  deactivateShop: (id: string) => axiosPrivate.delete(`/admin/shops/${id}`),
  getPendingVerifications: (params?: object) =>
    axiosPrivate.get('/admin/verifications', { params }),
  reviewVerification: (shopId: string, decision: string, reviewNote?: string) =>
    axiosPrivate.patch(`/admin/verifications/${shopId}`, { decision, reviewNote }),
  getCustomers: (params?: object) => axiosPrivate.get('/admin/customers', { params }),
  updateCustomer: (id: string, d: object) => axiosPrivate.patch(`/admin/customers/${id}`, d),
  resetCustomerPin: (id: string, pin: string) =>
    axiosPrivate.post(`/admin/customers/${id}/reset-pin`, { pin }),
  getTransactions: (params?: object) => axiosPrivate.get('/admin/transactions', { params }),
  deleteTransaction: (id: string) => axiosPrivate.delete(`/admin/transactions/${id}`),
};
