import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../api";
import {
  EmptyState,
  PageLoader,
  Input,
  Button,
  Modal,
} from "../../components/shared";
import { taka } from "../../utils/helpers";

export default function AdminCustomersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [resetFor, setResetFor] = useState<any>(null);
  const [newPin, setNewPin] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["adminCustomers", search],
    queryFn: () => adminApi.getCustomers({ search: search || undefined }),
  });

  const pinMut = useMutation({
    mutationFn: ({ id, pin }: { id: string; pin: string }) =>
      adminApi.resetCustomerPin(id, pin),
    onSuccess: () => {
      setResetFor(null);
      setNewPin("");
    },
  });

  const customers = (data?.data as any)?.data || [];
  if (isLoading) return <PageLoader />;

  return (
    <div className="p-4 space-y-3 animate-fade-in">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Customer খুঁজুন..."
        className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 focus:border-teal-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm outline-none"
      />

      {customers.length === 0 ? (
        <EmptyState icon="👥" title="কোনো Customer নেই" />
      ) : (
        <div className="space-y-2">
          {customers.map((c: any) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 rounded-xl p-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center text-white font-bold flex-shrink-0">
                {c.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-slate-900 dark:text-white font-semibold text-sm">
                  {c.name}
                </div>
                <div className="text-slate-400 text-xs font-mono">
                  {c.mobile}
                </div>
                <div className="text-slate-500 text-xs">
                  বাকি: {taka(c.totalBaki || 0)} · ★{c.avgRating || "—"}
                </div>
              </div>
              <button
                onClick={() => setResetFor(c)}
                className="flex-shrink-0 text-xs text-amber-400 border border-amber-800/50 px-2 py-1 rounded-lg hover:border-amber-600"
              >
                🔑 PIN
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!resetFor}
        onClose={() => setResetFor(null)}
        title={`${resetFor?.name} — PIN Reset`}
      >
        <div className="space-y-3">
          <Input
            label="নতুন PIN*"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            type="password"
            maxLength={4}
            placeholder="••••"
          />
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setResetFor(null)}
              className="flex-1"
            >
              বাতিল
            </Button>
            <Button
              onClick={() =>
                resetFor && pinMut.mutate({ id: resetFor.id, pin: newPin })
              }
              loading={pinMut.isPending}
              disabled={newPin.length < 4}
              className="flex-1"
            >
              Reset করুন
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
