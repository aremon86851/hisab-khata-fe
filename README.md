# 📒 HisabKhata — হিসাবখাতা

Smart Baki (Credit) Management Platform for Shops & Customers in Bangladesh/Asia.

---

## 🚀 Setup (VS Code তে চালানো)

```bash
# 1. Dependencies install করুন
npm install

# 2. Dev server চালু করুন
npm run dev

# 3. Browser এ খুলুন
# http://localhost:5173
```

---

## 📱 PWA Install (Mobile App)

Chrome mobile এ open করলে address bar এ "Install" আসবে।  
অথবা: **Share → Add to Home Screen** (iOS Safari)

---

## 🔑 Demo Credentials

| Role        | Mobile          | PIN    |
|-------------|-----------------|--------|
| 🏪 Shopkeeper (রহিম স্টোর)   | `01711111111`   | `0000` |
| 🏪 Shopkeeper (করিম মেডিকেল) | `01822222222`   | `1111` |
| 👤 Customer (সাবিনা আক্তার)   | `01912345678`   | `1234` |
| 👤 Customer (করিম মিয়া)       | `01511111111`   | `5678` |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── shared/           # Reusable: Toast, StatCard, StarRating, TransactionItem, BakiChip, ProductCard
│   ├── layout/           # DesktopSidebar, MobileHeader, MobileBottomNav
│   ├── shopkeeper/       # CustomerRow, CalcKeypad, AddCustomerForm, AddProductForm
│   └── customer/         # ShopBakiCard, ReputationBadge
│
├── pages/
│   ├── shopkeeper/       # SKDashboard, SKCalculator, SKCustomers, SKProducts
│   ├── customer/         # CustHome, CustShops, CustProfile
│   └── LoginPage.jsx
│
├── context/
│   └── AppContext.jsx    # Global state (useReducer)
│
├── hooks/
│   ├── useCalculator.js  # Calculator logic
│   └── useToast.js       # Toast notifications
│
├── utils/
│   └── helpers.js        # taka(), reputationScore(), repLabel(), stars()
│
├── data/
│   └── seed.js           # Demo data
│
├── ShopkeeperShell.jsx   # Shopkeeper layout orchestrator
├── CustomerShell.jsx     # Customer layout orchestrator
└── App.jsx               # Root router
```

---

## 📐 Responsive Design

| Screen         | Layout                                   |
|----------------|------------------------------------------|
| Mobile (`<md`) | Bottom nav + top header                  |
| Desktop (`md+`) | Left sidebar (260px) + top bar with stats |

---

## ✨ Features

**দোকানদার:**
- Dashboard with stats
- Calculator view — customer select → বাকি যোগ / পরিশোধ
- Customer management with star rating
- Product catalogue

**Customer:**
- Total baki overview
- Per-shop transaction history
- Product browsing
- Reputation score (auto-calculated)
