import { useState } from 'react'

export default function AddCustomerForm({ onAdd, onCancel }) {
  const [name,   setName]   = useState('')
  const [mobile, setMobile] = useState('')

  const submit = () => {
    if (!name.trim() || !mobile.trim()) return
    onAdd(name.trim(), mobile.trim())
    setName(''); setMobile('')
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 animate-slide-up space-y-3">
      <div className="text-sm font-bold text-slate-300">নতুন Customer</div>
      <input
        value={name} onChange={e => setName(e.target.value)}
        placeholder="নাম"
        className="w-full bg-slate-900 border border-slate-600 focus:border-brand-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors"
      />
      <input
        value={mobile} onChange={e => setMobile(e.target.value)}
        placeholder="01XXXXXXXXX"
        type="tel"
        className="w-full bg-slate-900 border border-slate-600 focus:border-brand-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none font-mono transition-colors"
      />
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-semibold hover:border-slate-600 transition-colors"
        >
          বাতিল
        </button>
        <button
          onClick={submit}
          className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-colors"
        >
          যোগ করুন →
        </button>
      </div>
    </div>
  )
}
