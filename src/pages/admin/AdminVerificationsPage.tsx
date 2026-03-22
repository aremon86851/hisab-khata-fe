import { useState }                               from 'react';
import { useQuery, useMutation, useQueryClient }   from '@tanstack/react-query';
import { adminApi }                                from '../../api';
import { EmptyState, PageLoader, Input, Button, Modal } from '../../components/shared';
import { relativeTime }                            from '../../utils/helpers';

export default function AdminVerificationsPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [note,     setNote]     = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['pendingVerifications'],
    queryFn:  adminApi.getPendingVerifications,
  });

  const reviewMut = useMutation({
    mutationFn: ({ shopId, decision, note }: { shopId: string; decision: string; note?: string }) =>
      adminApi.reviewVerification(shopId, decision, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pendingVerifications'] });
      setSelected(null); setNote('');
    },
  });

  const verifications = (data?.data as any)?.data || [];
  if (isLoading) return <PageLoader />;

  return (
    <div className="p-4 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
          🪪 Pending Verifications ({verifications.length})
        </div>
      </div>

      {verifications.length === 0 ? (
        <EmptyState icon="✅" title="সব Verification শেষ!" sub="কোনো pending নেই" />
      ) : (
        <div className="space-y-3">
          {verifications.map((v: any) => (
            <div key={v.id} className="bg-slate-800/60 border border-amber-800/40 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-white font-bold">{v.shop?.name}</div>
                  <div className="text-slate-400 text-xs">{v.ownerName} · {v.mobile}</div>
                  <div className="text-slate-500 text-xs">{v.district}, {v.thana}</div>
                  {v.nidNumber && <div className="text-slate-500 text-xs">NID: {v.nidNumber}</div>}
                  {v.submittedAt && <div className="text-slate-600 text-xs mt-0.5">{relativeTime(v.submittedAt)}</div>}
                </div>
                <span className="bg-amber-950 text-amber-400 text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0">Pending</span>
              </div>
              <button onClick={() => { setSelected(v); setNote(''); }}
                className="w-full py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold transition-colors">
                ✓ Verify / ✗ Reject
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Review: ${selected?.shop?.name}`}>
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-xl p-3 text-sm space-y-1.5">
            {[
              ['Owner',    selected?.ownerName],
              ['Mobile',   selected?.mobile],
              ['NID',      selected?.nidNumber || '—'],
              ['Location', `${selected?.district}, ${selected?.thana}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-slate-400">{k}:</span>
                <span className="text-white font-mono text-xs">{v}</span>
              </div>
            ))}
          </div>
          <Input label="Review Note (প্রত্যাখ্যানের কারণ)" value={note} onChange={e => setNote(e.target.value)} placeholder="ঐচ্ছিক..." />
          <div className="flex gap-2">
            <Button variant="danger"
              onClick={() => reviewMut.mutate({ shopId: selected.shopId, decision: 'REJECTED', note })}
              loading={reviewMut.isPending} className="flex-1">
              ✗ Reject
            </Button>
            <Button variant="green"
              onClick={() => reviewMut.mutate({ shopId: selected.shopId, decision: 'VERIFIED' })}
              loading={reviewMut.isPending} className="flex-1">
              ✓ Verify
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
