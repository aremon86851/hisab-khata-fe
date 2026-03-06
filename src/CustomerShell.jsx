import { useState, useMemo } from "react";
import { useToast } from "./hooks/useToast";
import DesktopSidebar from "./components/layout/DesktopSidebar";
import MobileHeader from "./components/layout/MobileHeader";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import Toast from "./components/shared/Toast";
import ReputationBadge from "./components/customer/ReputationBadge";
import CustHome from "./pages/customer/CustHome";
import CustShops from "./pages/customer/CustShops";
import CustProfile from "./pages/customer/CustProfile";
import { reputationScore } from "./utils/helpers";
import { useApp } from "./context/AppContext";

const TABS = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "shops", icon: "🏪", label: "আমার দোকান" },
  { id: "profile", icon: "👤", label: "Profile" },
];

export default function CustomerShell() {
  const { state, dispatch } = useApp();
  const { toast } = useToast();
  const [tab, setTab] = useState("home");
  const [selectedShopId, setSelectedShopId] = useState(null);

  const rawCustomer = state.session.customer;
  const customer = useMemo(
    () => state.customers.find((c) => c.id === rawCustomer.id) ?? rawCustomer,
    [state.customers, rawCustomer],
  );

  const myShops = useMemo(
    () =>
      Object.keys(customer.shopBalances)
        .map((shopId) => {
          const shop = state.shops.find((s) => s.id === shopId);
          if (!shop) return null;
          return {
            ...shop,
            baki: customer.shopBalances[shopId] ?? 0,
            txns: state.transactions.filter(
              (t) => t.shopId === shopId && t.customerId === customer.id,
            ),
          };
        })
        .filter(Boolean),
    [customer, state.shops, state.transactions],
  );

  const score = reputationScore(customer);
  const logout = () => dispatch({ type: "LOGOUT" });

  const handleViewShop = (id) => {
    setSelectedShopId(id);
    setTab("shops");
  };

  return (
    <div className="flex h-screen bg-slate-950 max-w-screen-xl mx-auto">
      {/* Desktop sidebar */}
      <DesktopSidebar
        tabs={TABS}
        activeTab={tab}
        onTabChange={setTab}
        title={customer.name}
        subtitle={customer.mobile}
        emoji="👤"
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <MobileHeader
          title={customer.name}
          subtitle={customer.mobile}
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
              {customer.name} — {customer.mobile}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400">Reputation</span>
            <ReputationBadge score={score} />
          </div>
        </div>

        {/* Scrollable page */}
        <div className="flex-1 overflow-y-auto">
          {tab === "home" && (
            <CustHome
              customer={customer}
              myShops={myShops}
              onViewShop={handleViewShop}
            />
          )}
          {tab === "shops" && (
            <CustShops
              myShops={myShops}
              selectedId={selectedShopId ?? myShops[0]?.id}
              onSelect={setSelectedShopId}
            />
          )}
          {tab === "profile" && (
            <CustProfile customer={customer} myShops={myShops} />
          )}
        </div>

        <MobileBottomNav tabs={TABS} activeTab={tab} onTabChange={setTab} />
      </div>

      <Toast {...toast} />
    </div>
  );
}
