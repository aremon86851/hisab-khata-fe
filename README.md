# HisabKhata Frontend

React + Vite + TypeScript + TailwindCSS + React Query

---

## 🚀 Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
# Edit .env — set VITE_API_URL to your backend URL

# 3. Run dev server
npm run dev
# → http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role | Mobile / Email | PIN / Password |
|------|----------------|----------------|
| 🏪 Shopkeeper | 01711111111 | PIN: 0000 |
| 🏪 Shopkeeper | 01822222222 | PIN: 1111 |
| 👤 Customer   | 01912345678 | PIN: 1234 |
| 👤 Customer   | 01511111111 | PIN: 5678 |
| 🛡️ Admin      | admin@hisabkhata.com | admin123 |

---

## 📁 Project Structure

```
src/
├── api/
│   ├── axios.ts          # Axios instances + interceptors + auto token refresh
│   └── index.ts          # All API functions (auth, shop, customer, transaction...)
│
├── hooks/
│   └── useAuth.tsx       # Auth context — login, logout, role, token
│
├── components/
│   ├── shared/index.tsx  # Spinner, Toast, StatCard, BakiChip, StarRating,
│   │                     # TransactionItem, ProductCard, EmptyState,
│   │                     # Input, Button, Modal, PinInput, Toggle
│   └── layout/
│       └── AppShell.tsx  # Desktop sidebar + mobile bottom nav + header
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx  # Role selection + PIN/password + admin login
│   │   └── SignupPage.tsx # 4-step signup: role → form → OTP → PIN
│   ├── shopkeeper/
│   │   └── index.tsx     # ALL shopkeeper pages:
│   │                     #   Dashboard, Calculator, Customers, Products,
│   │                     #   Reminders, Income/Expense, Staff, Notifications, Settings
│   ├── customer/
│   │   └── index.tsx     # ALL customer pages: Home, Shops, Profile
│   └── admin/
│       └── index.tsx     # ALL admin pages:
│                         #   Dashboard, Shops, Verifications, Customers, Transactions
│
├── types/index.ts        # All TypeScript types
├── utils/helpers.ts      # taka(), relativeTime(), getApiError(), repLabel()
├── App.tsx               # Routes + ProtectedRoute
└── main.tsx              # Entry — QueryClient + AuthProvider + BrowserRouter
```

---

## 🌐 API Integration

All APIs are in `src/api/index.ts`:
- `authApi`       — signup, OTP, PIN, login, profile
- `shopApi`       — shop info, verification
- `customerApi`   — add customer, list, rate, block
- `transactionApi`— add baki/payment, list, monthly summary
- `productApi`    — CRUD products
- `reminderApi`   — send WhatsApp/SMS, history, settings
- `ieApi`         — income/expense entries, monthly summary
- `staffApi`      — add/manage staff + permissions
- `notifApi`      — notifications, mark read
- `adminApi`      — full platform control

Token is stored in `localStorage` and auto-attached via Axios interceptor.
On 401 error, auto-refresh token is attempted.

---

## 📱 Responsive

| Screen | Layout |
|--------|--------|
| Mobile (`< md`) | Bottom navigation + top header |
| Desktop (`≥ md`) | Left sidebar (256px) + top bar |
