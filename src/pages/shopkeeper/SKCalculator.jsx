import { useState } from 'react'
import CalcKeypad from '../../components/shopkeeper/CalcKeypad'
import TransactionItem from '../../components/shared/TransactionItem'
import { useCalculator } from '../../hooks/useCalculator'
import { taka } from '../../utils/helpers'

export default function SKCalculator({ shop, customers, transactions, onSave, showToast }) {
  const [selectedId, setSelectedId] = useState('')
  const [note, setNote]             = useState('')
  const calc = useCalculator()

  const customer = customers.find(c => c.id === selectedId)
  const custTxns = transactions
    .filter(t => t.shopId === shop.id && t.customerId === selectedId)
    .slice(0, 6)

  const handleSave = (type) => {
    if (!customer)              { showToast('Customer সিলেক্ট করুন!', 'error');  return }
    const amt = parseFloat(calc.display)
    if (!amt || amt <= 0)       { showToast('সঠিক পরিমাণ দিন!', 'error');        return }
    onSave(customer.id, type, amt, note)
    showToast(
      type === 'baki' ? `+${taka(amt)} বাকি — ${customer.name}` : `−${taka(amt)} পরিশোধ — ${customer.name}`,
      type === 'baki' ? 'error' : 'success'
    )
    calc.pressAC()
    setNote('')
  }

  return (
    <div className="p-4 space-y-3 animate-fade-in">
      {/* Customer selector + balance */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-3 space-y-2">
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="w-full bg-slate-700/60 border border-slate-600 focus:border-brand-500 rounded-xl px-3 py-2.5 text-white text-sm outline-none transition-colors"
          >
            <option value="">— Customer সিলেক্ট করুন —</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} — {taka(c.baki)}</option>
            ))}
          </select>

          {customer && (
            <div className="flex items-center justify-between bg-slate-950/50 rounded-xl px-3 py-2">
              <span className="text-xs text-slate-400">বর্তমান বাকি</span>
              <span className={`font-mono text-xl font-bold ${customer.baki > 0 ? 'text-red-400' : 'text-teal-400'}`}>
                {taka(customer.baki)}
              </span>
            </div>
          )}
        </div>

        {/* Display */}
        <div className="bg-slate-950 mx-3 mb-3 rounded-xl px-4 py-3 min-h-[68px] flex flex-col items-end justify-center">
          <div className="text-slate-500 text-xs font-mono h-4">{calc.opLabel}</div>
          <div className="text-white text-3xl font-mono font-bold">
            {parseFloat(calc.display).toLocaleString('en') !== calc.display
              ? calc.display
              : parseFloat(calc.display).toLocaleString('en')}
          </div>
        </div>

        {/* Note */}
        <div className="px-3 pb-3">
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="📝 নোট (চাল ২ কেজি, ডাল...)"
            className="w-full bg-slate-700/60 border border-slate-600 focus:border-brand-500 rounded-xl px-3 py-2 text-white text-sm outline-none placeholder-slate-500 transition-colors"
          />
        </div>
      </div>

      {/* Keypad */}
      <CalcKeypad
        onNum={calc.pressNum} onOp={calc.pressOp}
        onEquals={calc.pressEquals} onAC={calc.pressAC} onBS={calc.pressBS}
      />

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleSave('baki')}
          className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-lg">📤</span>
          <div className="text-left">
            <div>বাকি যোগ</div>
            <div className="text-xs opacity-70 font-normal">Credit নেওয়া</div>
          </div>
        </button>
        <button
          onClick={() => handleSave('payment')}
          className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-lg">📥</span>
          <div className="text-left">
            <div>পরিশোধ নিন</div>
            <div className="text-xs opacity-70 font-normal">Payment নেওয়া</div>
          </div>
        </button>
      </div>

      {/* Recent history */}
      {custTxns.length > 0 && (
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">
            {customer?.name} — সাম্প্রতিক
          </div>
          <div className="space-y-2">
            {custTxns.map(t => <TransactionItem key={t.id} txn={t} />)}
          </div>
        </div>
      )}
    </div>
  )
}
