import axios from "axios";
import { axiosPrivate, axiosPublic } from "./axios";

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  shopkeeperSignup: (d: {
    shopName: string;
    mobile: string;
    password: string;
  }) => axiosPublic.post("/auth/shopkeeper/signup", d),
  customerSignup: (d: { name: string; mobile: string }) =>
    axiosPublic.post("/auth/customer/signup", d),
  verifyOtp: (d: { mobile: string; otp: string; purpose: string }) =>
    axiosPublic.post("/auth/verify-otp", d),
  setPin: (d: { mobile: string; pin: string; token: string }) =>
    axiosPublic.post("/auth/set-pin", d),
  loginWithPassword: (d: { mobile: string; password: string }) =>
    axiosPublic.post("/auth/login/password", d),
  loginWithPin: (d: { mobile: string; pin: string; role: string }) =>
    axiosPublic.post("/auth/login/pin", d),
  adminLogin: (d: { email: string; password: string }) =>
    axiosPublic.post("/auth/admin/login", d),
  refreshToken: () => axiosPublic.post("/auth/refresh-token"),
  forgotPin: (mobile: string) =>
    axiosPublic.post("/auth/forgot-pin", { mobile }),
  getMyProfile: () => axiosPrivate.get("/auth/me"),
   changePin: (d: { currentPin: string; newPin: string }) =>
    axiosPrivate.post("/auth/change-pin", d),
  deleteAccount: (d: { password: string }) =>
    axiosPrivate.delete("/auth/account", { data: d }),
};

// ── Shop ──────────────────────────────────────────────────────────────────────
export const shopApi = {
  getMyShop: () => axiosPrivate.get("/shop"),
  updateShop: (d: object) => axiosPrivate.patch("/shop", d),
  uploadImage: (formData: FormData) => axiosPrivate.patch("/shop/image", formData),
  submitVerification: (formData: FormData) => axiosPrivate.post("/shop/verify", formData),
  getVerificationStatus: () => axiosPrivate.get("/shop/verify/status"),
};

// ── Customer ──────────────────────────────────────────────────────────────────
export const customerApi = {
  addCustomer: (d: { name: string; mobile: string; openingBalance?: number }) =>
    axiosPrivate.post("/customers", d),
  getCustomers: (params?: object) => axiosPrivate.get("/customers", { params }),
  getSingleCustomer: (id: string) => axiosPrivate.get(`/customers/${id}`),
  getCustomerTxn: (sid: string, cid: string) =>
    axios.get(`${import.meta.env.VITE_API_URL}/customers/txn/${sid}/${cid}`),
  rateCustomer: (id: string, rating: number) =>
    axiosPrivate.patch(`/customers/${id}/rate`, { rating }),
  toggleBlock: (id: string) => axiosPrivate.patch(`/customers/${id}/block`),
  getMyProfile: () => axiosPrivate.get("/customers/me"),
  // 1a: Customer uploads own photo
  uploadMyImage: (formData: FormData) => axiosPrivate.patch("/customers/me/image", formData),
  // 1b: Shopkeeper uploads customer photo
  uploadCustomerImage: (customerId: string, formData: FormData) =>
    axiosPrivate.patch(`/customers/${customerId}/image`, formData),
  // 2: Fraud pre-check by mobile
  checkMobile: (mobile: string) =>
    axiosPrivate.get("/customers/check", { params: { mobile } }),
  // 3: Unlink customer from shop
  unlinkCustomer: (customerId: string) => axiosPrivate.delete(`/customers/${customerId}`),
  // 4: Settle customer
  settleCustomer: (customerId: string) => axiosPrivate.patch(`/customers/${customerId}/settle`),
  // 5: Toggle transaction request access
  toggleRequestAccess: (customerId: string) =>
    axiosPrivate.patch(`/customers/${customerId}/request-access`),
};

// ── Transaction ───────────────────────────────────────────────────────────────
export const transactionApi = {
  addTransaction: (d: {
    customerId: string;
    type: string;
    amount: number;
    note?: string;
    ieAutoLink?: boolean;
  }) => axiosPrivate.post("/transactions", d),
  getShopTransactions: (params?: object) =>
    axiosPrivate.get("/transactions", { params }),
  getCustomerShopTxn: (ssc: string, csc: string, params?: object) =>
    axios.get(
      `${import.meta.env.VITE_API_URL}/transactions/txn/${ssc}/${csc}`,
      { params },
    ),
  getMyTransactions: (params?: object) =>
    axiosPrivate.get("/transactions/my", { params }),
  getMonthlySummary: (year?: number, month?: number) =>
    axiosPrivate.get("/transactions/summary", { params: { year, month } }),
  // 6a: Customer submits payment request
  submitRequest: (d: { shopId: string; type: "BAKI" | "PAYMENT"; amount: number; note?: string }) =>
    axiosPrivate.post("/transactions/requests", d),
  // 6b: Customer views own requests
  getMyRequests: (params?: object) =>
    axiosPrivate.get("/transactions/requests/my", { params }),
  // 6c: Shopkeeper views incoming requests
  getShopRequests: (params?: object) =>
    axiosPrivate.get("/transactions/requests", { params }),
  // 6d: Shopkeeper approves request
  approveRequest: (requestId: string) =>
    axiosPrivate.patch(`/transactions/requests/${requestId}/approve`),
  // 6e: Shopkeeper rejects request
  rejectRequest: (requestId: string, reviewNote?: string) =>
    axiosPrivate.patch(`/transactions/requests/${requestId}/reject`, { reviewNote }),
};

// ── Product ───────────────────────────────────────────────────────────────────
export const productApi = {
  getProducts: (category?: string) =>
    axiosPrivate.get("/products", { params: { category } }),
  addProduct: (d: object) => axiosPrivate.post("/products", d),
  updateProduct: (id: string, d: object) =>
    axiosPrivate.patch(`/products/${id}`, d),
  deleteProduct: (id: string) => axiosPrivate.delete(`/products/${id}`),
};

// ── Reminder ──────────────────────────────────────────────────────────────────
export const reminderApi = {
  sendReminder: (d: object) => axiosPrivate.post("/reminders", d),
  getHistory: (customerId?: string) =>
    axiosPrivate.get("/reminders", { params: { customerId } }),
  getSettings: () => axiosPrivate.get("/reminders/settings"),
  updateSettings: (d: object) => axiosPrivate.patch("/reminders/settings", d),
};

// ── Income/Expense ────────────────────────────────────────────────────────────
export const ieApi = {
  getEntries: (params?: object) =>
    axiosPrivate.get("/income-expense", { params }),
  addEntry: (d: object) => axiosPrivate.post("/income-expense", d),
  getMonthlySummary: (year?: number, month?: number) =>
    axiosPrivate.get("/income-expense/summary", { params: { year, month } }),
  updateEntry: (id: string, d: object) =>
    axiosPrivate.patch(`/income-expense/${id}`, d),
  deleteEntry: (id: string) => axiosPrivate.delete(`/income-expense/${id}`),
};

// ── Staff ─────────────────────────────────────────────────────────────────────
export const staffApi = {
  getStaff: () => axiosPrivate.get("/staff"),
  getMe: () => axiosPrivate.get("/auth/me"),
  addStaff: (d: object) => axiosPrivate.post("/staff", d),
  updateStaff: (id: string, d: object) => axiosPrivate.patch(`/staff/${id}`, d),
  removeStaff: (id: string) => axiosPrivate.delete(`/staff/${id}`),
  resetPin: (id: string, newPin: string) =>
    axiosPrivate.post(`/staff/${id}/reset-pin`, { newPin }),
};

// ── Notification ──────────────────────────────────────────────────────────────
export const notifApi = {
  getAll: (params?: object) => axiosPrivate.get("/notifications", { params }),
  markRead: (id: string) => axiosPrivate.patch(`/notifications/${id}/read`),
  markAllRead: () => axiosPrivate.patch("/notifications/read-all"),
  getSettings: () => axiosPrivate.get("/notifications/settings"),
  updateSettings: (d: object) => axiosPrivate.patch("/notifications/settings", d),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: () => axiosPrivate.get("/admin/stats"),
  getAnalytics: (from?: string, to?: string) =>
    axiosPrivate.get("/admin/analytics", { params: { from, to } }),
  getShops: (params?: object) => axiosPrivate.get("/admin/shops", { params }),
  createShop: (d: object) => axiosPrivate.post("/admin/shops", d),
  updateShop: (id: string, d: object) =>
    axiosPrivate.patch(`/admin/shops/${id}`, d),
  deactivateShop: (id: string) => axiosPrivate.delete(`/admin/shops/${id}`),
  getPendingVerifications: (params?: object) =>
    axiosPrivate.get("/admin/verifications", { params }),
  reviewVerification: (shopId: string, decision: string, reviewNote?: string) =>
    axiosPrivate.patch(`/admin/verifications/${shopId}`, {
      decision,
      reviewNote,
    }),
  getCustomers: (params?: object) =>
    axiosPrivate.get("/admin/customers", { params }),
  updateCustomer: (id: string, d: object) =>
    axiosPrivate.patch(`/admin/customers/${id}`, d),
  resetCustomerPin: (id: string, pin: string) =>
    axiosPrivate.post(`/admin/customers/${id}/reset-pin`, { pin }),
  getTransactions: (params?: object) =>
    axiosPrivate.get("/admin/transactions", { params }),
  deleteTransaction: (id: string) =>
    axiosPrivate.delete(`/admin/transactions/${id}`),
};
export const fraudApi = {
  // Shopkeeper: check fraud before adding customer
  checkFraud: (params: { mobile?: string; shortCode?: string }) =>
    axiosPrivate.get("/fraud/check", { params }),

  // Shopkeeper: get community fraud feed
  getFeed: (params?: { page?: number; limit?: number }) =>
    axiosPrivate.get("/fraud/feed", { params }),

  // Shopkeeper: report a customer
  reportFraud: (data: {
    customerId: string;
    type: string;
    description?: string;
    amountOwed?: number;
    isAnonymous?: boolean;
  }) => axiosPrivate.post("/fraud/report", data),

  // Shopkeeper: vote on a report
  vote: (reportId: string, agree: boolean) =>
    axiosPrivate.post(`/fraud/${reportId}/vote`, { agree }),

  // Customer: dispute a report
  dispute: (reportId: string, reason: string) =>
    axiosPrivate.post(`/fraud/${reportId}/dispute`, { reason }),
};

// ── Reports ───────────────────────────────────────────────────────────────────
export const reportsApi = {
  // 7a: Outstanding baki report
  getOutstanding: (params?: object) =>
    axiosPrivate.get("/reports/outstanding", { params }),
  // 7b: Customer ledger
  getLedger: (customerId: string, params?: object) =>
    axiosPrivate.get(`/reports/ledger/${customerId}`, { params }),
  // 7c: Monthly P&L
  getMonthly: (year?: number, month?: number) =>
    axiosPrivate.get("/reports/monthly", { params: { year, month } }),
  // 7d: Top debtors
  getTopDebtors: (limit = 10) =>
    axiosPrivate.get("/reports/top-debtors", { params: { limit } }),
};

// ── Campaign ──────────────────────────────────────────────────────────────────
export const campaignApi = {
  // Shopkeeper: CRUD
  getAll: (params?: object) =>
    axiosPrivate.get("/campaigns", { params }),
  getById: (id: string) =>
    axiosPrivate.get(`/campaigns/${id}`),
  create: (d: object) =>
    axiosPrivate.post("/campaigns", d),
  update: (id: string, d: object) =>
    axiosPrivate.patch(`/campaigns/${id}`, d),
  remove: (id: string) =>
    axiosPrivate.delete(`/campaigns/${id}`),

  // Shopkeeper: manage subscriptions
  getSubscriptions: (campaignId: string, params?: object) =>
    axiosPrivate.get(`/campaigns/${campaignId}/subscriptions`, { params }),
  reviewSubscription: (campaignId: string, subId: string, d: { status: string; reviewNote?: string }) =>
    axiosPrivate.patch(`/campaigns/${campaignId}/subscriptions/${subId}`, d),
  notifySubscribers: (campaignId: string, d?: { channel?: string; customMessage?: string }) =>
    axiosPrivate.post(`/campaigns/${campaignId}/notify`, d),

  // Customer: browse by shop & subscribe
  browseShop: (shopId: string, params?: object) =>
    axiosPrivate.get(`/campaigns/shop/${shopId}`, { params }),
  getPublic: (id: string) =>
    axiosPrivate.get(`/campaigns/${id}/public`),
  subscribe: (campaignId: string, note?: string) =>
    axiosPrivate.post(`/campaigns/${campaignId}/subscribe`, note ? { note } : {}),
  cancelSubscription: (campaignId: string) =>
    axiosPrivate.delete(`/campaigns/${campaignId}/subscribe`),
  mySubscriptions: (params?: object) =>
    axiosPrivate.get("/campaigns/my", { params }),
};
