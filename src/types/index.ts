export type TRole = 'SHOPKEEPER' | 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN';

export type TVerificationStatus = 'UNSUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type TTransactionType    = 'BAKI' | 'PAYMENT';
export type TReminderChannel    = 'WHATSAPP' | 'SMS' | 'BOTH';
export type TReminderStatus     = 'SCHEDULED' | 'SENT' | 'FAILED';
export type TStaffRole          = 'OWNER' | 'MANAGER' | 'STAFF';
export type TEntryType          = 'INCOME' | 'EXPENSE';
export type TNotificationType   = 'NEW_BAKI' | 'PAYMENT_RECEIVED' | 'REMINDER_SENT' | 'SHOP_VERIFIED' | 'REFERRAL_REWARD' | 'SYSTEM' | 'NEW_CAMPAIGN_SUBSCRIPTION' | 'CAMPAIGN_CONFIRMED' | 'CAMPAIGN_REJECTED';

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

export type TFraudRiskLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';

export type TTransactionRequest = {
  id: string; shopId: string; customerId: string; linkId: string;
  type: 'PAYMENT'; amount: number; note: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNote: string | null; reviewedAt: string | null; reviewedById: string | null;
  createdAt: string;
  customer?: { id: string; name: string; mobile: string; image?: string };
};

export type TCustomerShopLink = {
  id: string; name: string; emoji: string; shopType: string | null;
  balance: number; shopRating: number;
  canRequestTxn?: boolean; isSettled?: boolean; settledAt?: string | null;
  verification: { status: TVerificationStatus; logoUrl: string | null; district: string | null } | null;
  products: TProduct[];
};

export type TCustomerProfile = {
  id: string; name: string; mobile: string; image?: string; createdAt: string;
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
  transactionId?: string | null;
  isAutoLinked?: boolean;
  customer?: { id: string; name: string; mobile: string } | null;
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

// ── Campaign ──────────────────────────────────────────────────────────────────
export type TCampaignType = 'MONTHLY_PACKAGE' | 'DISCOUNT' | 'CUSTOM' | 'CATALOG';
export type TDiscountType = 'PERCENTAGE' | 'FLAT';
export type TCampaignTarget = 'ALL' | 'SPECIFIC';
export type TCampaignStatus = 'active' | 'upcoming' | 'expired';
export type TCampaignSubStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

export type TCampaignItem = {
  id: string;
  campaignId: string;
  productId: string | null;
  name: string;
  quantity: number;
  unit: string;
  price: number;
};

export type TCampaign = {
  id: string;
  shopId: string;
  type: TCampaignType;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  discountType: TDiscountType | null;
  discountValue: number | null;
  targetCustomers: TCampaignTarget;
  createdAt: string;
  updatedAt: string;
  items: TCampaignItem[];
  shop?: { id: string; name: string; emoji: string };
  status?: TCampaignStatus;
  subscriberCount?: number;
  pendingCount?: number;
};

export type TCampaignSubscription = {
  id: string;
  campaignId: string;
  customerId: string;
  status: TCampaignSubStatus;
  note: string | null;
  reviewNote: string | null;
  joinedAt: string;
  reviewedAt: string | null;
  customer?: { id: string; name: string; mobile: string; image?: string | null };
  campaign?: TCampaign;
};
