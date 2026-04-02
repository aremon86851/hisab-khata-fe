export type TRole = 'SHOPKEEPER' | 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN';

export type TVerificationStatus = 'UNSUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type TTransactionType    = 'BAKI' | 'PAYMENT';
export type TReminderChannel    = 'WHATSAPP' | 'SMS' | 'BOTH';
export type TReminderStatus     = 'SCHEDULED' | 'SENT' | 'FAILED';
export type TStaffRole          = 'OWNER' | 'MANAGER' | 'STAFF';
export type TEntryType          = 'INCOME' | 'EXPENSE';
export type TNotificationType   = 'NEW_BAKI' | 'PAYMENT_RECEIVED' | 'REMINDER_SENT' | 'SHOP_VERIFIED' | 'REFERRAL_REWARD' | 'SYSTEM';

export type TApiResponse<T> = {
  success: boolean; statusCode: number; message: string; data: T;
  meta?: { page: number; limit: number; total: number };
};

export type TAuthUser = { accessToken: string; role: TRole; shopId?: string };

export type TShopVerification = {
  ownerName: string; mobile: string; district: string | null; thana: string | null;
  fullAddress: string | null; nidNumber: string | null;
  nidFrontUrl: string | null; nidBackUrl: string | null;
  shopPhotoUrl: string | null; logoUrl: string | null;
  status: TVerificationStatus; submittedAt: string | null;
  reviewedAt: string | null; reviewNote: string | null;
};

export type TShop = {
  id: string; name: string; emoji: string; shopType: string | null; isActive: boolean; createdAt: string;
  image?: string;
  verification: TShopVerification | null;
  _count?: { customers: number; transactions: number; products: number };
};

export type TProduct = {
  id: string; shopId: string; name: string; price: number; unit: string;
  emoji: string; category: string | null; stock: number; isActive: boolean; createdAt: string;
};

export type TCustomer = {
  id: string; name: string; mobile: string; balance: number;
  shopRating: number; isBlocked: boolean; lastTransactAt: string | null; createdAt: string;
};

export type TCustomerShopLink = {
  id: string; name: string; emoji: string; shopType: string | null;
  balance: number; shopRating: number;
  verification: { status: TVerificationStatus; logoUrl: string | null; district: string | null } | null;
  products: TProduct[];
};

export type TCustomerProfile = {
  id: string; name: string; mobile: string; createdAt: string;
  shops: TCustomerShopLink[]; repScore: string;
};

export type TTransaction = {
  id: string; shopId: string; customerId: string; type: TTransactionType;
  amount: number; note: string | null; createdAt: string;
  customer?: { id: string; name: string; mobile: string };
  shop?: { id: string; name: string; emoji: string };
};

export type TMonthlySummary = {
  year: number; month: number; totalBaki: number; totalPayment: number; outstanding: number; txnCount: number;
};

export type TReminder = {
  id: string; shopId: string; customerId: string; channel: TReminderChannel;
  messageBody: string; balanceAtSend: number; status: TReminderStatus;
  scheduledAt: string | null; sentAt: string | null; createdAt: string; whatsappLink?: string;
};

export type TReminderSettings = {
  shopId: string; autoRemindEnabled: boolean; daysAfterBaki: number;
  channel: TReminderChannel; messageTemplate: string;
};

export type TIncomeExpenseEntry = {
  id: string; shopId: string; type: TEntryType; amount: number;
  category: string; note: string | null; entryDate: string; createdAt: string;
};

export type TIEMonthlySummary = {
  year: number; month: number; totalIncome: number; totalExpense: number; netProfit: number;
  breakdown: { type: TEntryType; category: string; _sum: { amount: number } }[];
};

export type TStaff = {
  id: string; name: string; mobile: string; role: TStaffRole; isActive: boolean;
  lastLoginAt: string | null; createdAt: string;
  canAddBaki: boolean; canAddPayment: boolean; canAddCustomer: boolean;
  canViewReport: boolean; canManageProduct: boolean; canSendReminder: boolean;
};

export type TNotification = {
  id: string; type: TNotificationType; title: string; body: string;
  isRead: boolean; metadata: Record<string, unknown> | null; createdAt: string;
};

export type TDashboardStats = {
  totalShops: number; verifiedShops: number; totalCustomers: number;
  totalTransactions: number; totalOutstandingBaki: number; recentTransactions: TTransaction[];
};
