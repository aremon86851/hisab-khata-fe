import { useState, useMemo, useCallback } from "react";
import { useApp } from "./context/AppContext";
import { useToast } from "./hooks/useToast";
import DesktopSidebar from "./components/layout/DesktopSidebar";
import MobileHeader from "./components/layout/MobileHeader";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import Toast from "./components/shared/Toast";
import SKDashboard from "./pages/shopkeeper/SKDashboard";
import SKCalculator from "./pages/shopkeeper/SKCalculator";
import SKCustomers from "./pages/shopkeeper/SKCustomers";
import SKProducts from "./pages/shopkeeper/SKProducts";

const TABS = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "calculator", icon: "🧮", label: "Calculator" },
  { id: "customers", icon: "👥", label: "Customers" },
  { id: "products", icon: "📦", label: "Products" },
];

export default function ShopkeeperShell() {
  const { state, dispatch } = useApp();
  const { toast, show } = useToast();
  const [tab, setTab] = useState("dashboard");

  const shop = state.session.shop;

  const customers = useMemo(
    () =>
      state.customers.map((c) => ({
        ...c,
        baki: c.shopBalances[shop.id] ?? 0,
        rating: c.ratings[shop.id] ?? 3,
      })),
    [state.customers, shop.id],
  );

  const currentShop = useMemo(
    () => state.shops.find((s) => s.id === shop.id),
    [state.shops, shop.id],
  );

  const handleSave = useCallback(
    (customerId, type, amount, note) => {
      dispatch({
        type: "ADD_TRANSACTION",
        payload: { shopId: shop.id, customerId, type, amount, note },
      });
    },
    [dispatch, shop.id],
  );

  const handleAddCustomer = useCallback(
    (name, mobile) => {
      dispatch({
        type: "ADD_CUSTOMER",
        payload: { shopId: shop.id, name, mobile },
      });
    },
    [dispatch, shop.id],
  );

  const handleRate = useCallback(
    (customerId, rating) => {
      dispatch({
        type: "RATE_CUSTOMER",
        payload: { shopId: shop.id, customerId, rating },
      });
    },
    [dispatch, shop.id],
  );

  const handleAddProduct = useCallback(
    (product) => {
      dispatch({ type: "ADD_PRODUCT", payload: { shopId: shop.id, product } });
    },
    [dispatch, shop.id],
  );

  const handleOpenCalc = useCallback(() => setTab("calculator"), []);
  const logout = () => dispatch({ type: "LOGOUT" });

  const pageProps = { shop, customers, transactions: state.transactions };

  return (
    <div className="flex h-screen bg-slate-950 max-w-screen-xl mx-auto">
      {/* Desktop sidebar */}
      <DesktopSidebar
        tabs={TABS}
        activeTab={tab}
        onTabChange={setTab}
        title={shop.name}
        subtitle={shop.location}
        emoji={shop.emoji}
        onLogout={logout}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <MobileHeader
          title={shop.name}
          subtitle={shop.location}
          onLogout={logout}
        />

        {/* Desktop top bar */}
        <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
          <div>
            <div className="text-white font-bold text-lg">
              {TABS.find((t) => t.id === tab)?.icon}{" "}
              {TABS.find((t) => t.id === tab)?.label}
            </div>
            <div className="text-slate-400 text-xs">
              {shop.name} — {shop.location}
            </div>
          </div>
        </div>

        {/* Scrollable page area */}
        <div className="flex-1 overflow-y-auto">
          {tab === "dashboard" && (
            <SKDashboard {...pageProps} onCalc={handleOpenCalc} />
          )}
          {tab === "calculator" && (
            <SKCalculator {...pageProps} onSave={handleSave} showToast={show} />
          )}
          {tab === "customers" && (
            <SKCustomers
              customers={customers}
              onAdd={handleAddCustomer}
              onRate={handleRate}
              showToast={show}
            />
          )}
          {tab === "products" && (
            <SKProducts
              products={currentShop?.products ?? []}
              onAdd={handleAddProduct}
            />
          )}
        </div>

        {/* Mobile bottom nav */}
        <MobileBottomNav tabs={TABS} activeTab={tab} onTabChange={setTab} />
      </div>

      <Toast {...toast} />
    </div>
  );
}
