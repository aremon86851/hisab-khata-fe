import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { customerApi, transactionApi } from "../../api";
import {
  StatCard,
  BakiChip,
  EmptyState,
  PageLoader,
} from "../../components/shared";
import { taka } from "../../utils/helpers";

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data: cr, isLoading } = useQuery({
    queryKey: ["shopCustomers"],
    queryFn: () => customerApi.getCustomers({ limit: 100 }),
  });
  const { data: sr }: any = useQuery({
    queryKey: ["monthlySummary"],
    queryFn: transactionApi.getMonthlySummary as any,
  });

  const customers = (cr?.data as any)?.data || [];
  const s = (sr?.data as any)?.data;
  const totalBaki = customers.reduce(
    (acc: number, c: any) => acc + c.balance,
    0,
  );
  const pending = customers.filter((c: any) => c.balance > 0).length;

  if (isLoading) return <PageLoader />;

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="মোট বাকি"
          value={taka(totalBaki)}
          sub={`${pending} জনের কাছে`}
          color="red"
        />
        <StatCard
          label="Customers"
          value={customers.length}
          sub="মোট"
          color="teal"
        />
        <StatCard label="বাকি আছে" value={pending} sub="জন" color="amber" />
        <StatCard
          label="এই মাস আদায়"
          value={taka(s?.totalPayment || 0)}
          sub="payment"
          color="green"
        />
      </div>

      {s && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 flex gap-4 text-sm">
          {[
            { label: "বাকি দিয়েছি", value: s.totalBaki, c: "text-red-400" },
            { label: "আদায়", value: s.totalPayment, c: "text-teal-400" },
            { label: "বকেয়া", value: s.outstanding, c: "text-amber-400" },
          ].map((x) => (
            <div key={x.label} className="flex-1 text-center">
              <div className={`${x.c} font-mono font-bold`}>
                {taka(x.value)}
              </div>
              <div className="text-slate-500 text-xs">{x.label}</div>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">
          👥 Customer তালিকা ({customers.length})
        </div>
        {customers.length === 0 ? (
          <EmptyState
            icon="📋"
            title="কোনো Customer নেই"
            action={
              <button
                onClick={() => navigate("/shopkeeper/customers")}
                className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
              >
                + Customer যোগ করুন
              </button>
            }
          />
        ) : (
          <div className="space-y-2">
            {customers.map((c: any) => (
              <div
                key={c.id}
                className={`bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3 border-l-4
                  ${c.balance > 2000 ? "border-l-red-500" : c.balance > 0 ? "border-l-amber-500" : "border-l-teal-500"}`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/shopkeeper/customer/${c.id}`}>
                    <div className="text-white font-semibold text-sm truncate">
                      {c.name}
                    </div>
                  </Link>
                  <div className="text-slate-400 text-xs font-mono">
                    {c.mobile}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div
                    className={`font-mono font-bold text-base ${c.balance > 0 ? "text-red-400" : "text-teal-400"}`}
                  >
                    {taka(c.balance)}
                  </div>
                  <BakiChip amount={c.balance} />
                  {/* navigate to calculator with custId in state */}
                  <button
                    onClick={() =>
                      navigate("/shopkeeper/calculator", {
                        state: { custId: c.id },
                      })
                    }
                    className="text-[11px] bg-teal-700 hover:bg-teal-600 text-white px-2.5 py-1 rounded-lg font-semibold transition-colors"
                  >
                    🧮 হিসাব
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
