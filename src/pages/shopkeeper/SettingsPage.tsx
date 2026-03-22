import { useState }                               from 'react';
import { useOutletContext }                        from 'react-router-dom';
import { useQuery, useMutation, useQueryClient }   from '@tanstack/react-query';
import { shopApi, reminderApi }                    from '../../api';
import { useAuth }                                 from '../../hooks/useAuth';
import { Input, Button, Toggle }                   from '../../components/shared';
import { getApiError }                             from '../../utils/helpers';

const EMOJIS = ['🏪','💊','👔','🥩','🥦','📱','🍞','✂️','🏬'];

export default function SettingsPage() {
  // shop data comes from ShopkeeperLayout via Outlet context
  const { shop }  = useOutletContext<{ shop: any }>();
  const qc        = useQueryClient();
  const { logout} = useAuth();

  const [shopName,  setShopName]  = useState(shop?.name  || '');
  const [shopEmoji, setShopEmoji] = useState(shop?.emoji || '🏪');
  const [saved,     setSaved]     = useState(false);
  const [err,       setErr]       = useState('');

  const { data: sr } = useQuery({ queryKey: ['reminderSettings'], queryFn: reminderApi.getSettings });
  const settings = (sr?.data as any)?.data;

  const [autoRemind, setAutoRemind] = useState(settings?.autoRemindEnabled ?? false);
  const [daysAfter,  setDaysAfter]  = useState(String(settings?.daysAfterBaki ?? 7));
  const [channel,    setChannel]    = useState<'WHATSAPP' | 'SMS' | 'BOTH'>(settings?.channel ?? 'WHATSAPP');
  const [template,   setTemplate]   = useState(settings?.messageTemplate ?? '');

  const shopMut = useMutation({
    mutationFn: () => shopApi.updateShop({ name: shopName, emoji: shopEmoji }),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['myShop'] }); setSaved(true); setTimeout(() => setSaved(false), 2000); },
    onError:    (e) => setErr(getApiError(e)),
  });
  const settMut = useMutation({
    mutationFn: () => reminderApi.updateSettings({
      autoRemindEnabled: autoRemind, daysAfterBaki: Number(daysAfter), channel, messageTemplate: template,
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminderSettings'] }),
  });

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {err && <div className="bg-red-950/50 text-red-400 text-sm px-4 py-3 rounded-xl">{err}</div>}

      {/* Shop info */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3">
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">🏪 দোকানের তথ্য</div>
        <Input label="দোকানের নাম" value={shopName} onChange={e => setShopName(e.target.value)} />
        <div>
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-2">Emoji</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setShopEmoji(e)}
                className={`text-2xl p-2 rounded-xl border transition-all
                  ${shopEmoji === e ? 'border-teal-500 bg-teal-900/30' : 'border-transparent hover:border-slate-600'}`}>
                {e}
              </button>
            ))}
          </div>
        </div>
        {/* Verification status */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex items-center justify-between">
          <span className="text-slate-300 text-sm">Verification Status</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold
            ${shop?.verification?.status === 'VERIFIED'  ? 'bg-teal-950 text-teal-400'
            : shop?.verification?.status === 'PENDING'   ? 'bg-amber-950 text-amber-400'
            : shop?.verification?.status === 'REJECTED'  ? 'bg-red-950 text-red-400'
            : 'bg-slate-700 text-slate-400'}`}>
            {shop?.verification?.status || 'UNSUBMITTED'}
          </span>
        </div>
        <Button onClick={() => shopMut.mutate()} loading={shopMut.isPending} className="w-full">
          {saved ? '✅ সংরক্ষিত!' : 'সংরক্ষণ করুন'}
        </Button>
      </div>

      {/* Reminder settings */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-4">
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">💬 Reminder Settings</div>
        <Toggle value={autoRemind} onChange={setAutoRemind} label="Auto Reminder চালু" />
        {autoRemind && (
          <Input label={`বাকির পরে কত দিনে (${daysAfter} দিন)`} value={daysAfter}
            onChange={e => setDaysAfter(e.target.value)} type="number" min={1} max={30} />
        )}
        <div className="flex gap-2">
          {(['WHATSAPP', 'SMS', 'BOTH'] as const).map(ch => (
            <button key={ch} onClick={() => setChannel(ch)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all
                ${channel === ch ? 'bg-teal-600 text-white border-teal-500' : 'border-slate-700 text-slate-400'}`}>
              {ch === 'WHATSAPP' ? 'WhatsApp' : ch === 'SMS' ? 'SMS' : 'দুটোই'}
            </button>
          ))}
        </div>
        <div>
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-2">Message Template</label>
          <textarea value={template} onChange={e => setTemplate(e.target.value)} rows={4}
            className="w-full bg-slate-900 border border-slate-600 focus:border-teal-500 rounded-xl px-3 py-2.5 text-white text-sm outline-none resize-none" />
        </div>
        <Button onClick={() => settMut.mutate()} loading={settMut.isPending} className="w-full">Settings সংরক্ষণ করুন</Button>
      </div>

      <button onClick={logout}
        className="w-full py-3 rounded-xl border border-red-800 text-red-400 font-bold text-sm hover:bg-red-950/30 transition-colors">
        লগআউট
      </button>
    </div>
  );
}
