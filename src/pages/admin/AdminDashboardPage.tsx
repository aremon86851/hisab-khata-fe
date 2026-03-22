import { useQuery }       from '@tanstack/react-query';
import { adminApi }       from '../../api';
import { StatCard, PageLoader } from '../../components/shared';
import { taka, relativeTime }  from '../../utils/helpers';

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['adminStats'], queryFn: adminApi.getStats });
  const s = (data?.data as any)?.data;
  if (isLoading) return <PageLoader />;

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Shops"     value={s?.totalShops || 0}                sub={`${s?.verifiedShops || 0} verified`} color="teal"   />
        <StatCard label="Total Customers" value={s?.totalCustomers || 0}            sub="registered"                          color="violet" />
        <StatCard label="Transactions"    value={s?.totalTransactions || 0}         sub="all time"                            color="amber"  />
        <StatCard label="মোট বকেয়া"      value={taka(s?.totalOutstandingBaki || 0)} sub="outstanding"                        color="red"    />
      </div>

      <div>
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">সাম্প্রতিক লেনদেন</div>
        <div className="space-y-2">
          {(s?.recentTransactions || []).map((t: any) => (
            <div key={t.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0
                ${t.type === 'BAKI' ? 'bg-red-950 text-red-400' : 'bg-teal-950 text-teal-400'}`}>
                {t.type === 'BAKI' ? '📤' : '📥'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-semibold truncate">{t.customer?.name} → {t.shop?.name}</div>
                <div className="text-slate-500 text-[11px]">{relativeTime(t.createdAt)}</div>
              </div>
              <div className={`font-mono text-sm font-bold flex-shrink-0 ${t.type === 'BAKI' ? 'text-red-400' : 'text-teal-400'}`}>
                {t.type === 'BAKI' ? '+' : '−'}{taka(t.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
