import { useState } from 'react'

export default function AddProductForm({ onAdd }) {
  const [name,  setName]  = useState('')
  const [price, setPrice] = useState('')
  const [unit,  setUnit]  = useState('কেজি')
  const [emoji, setEmoji] = useState('📦')

  const submit = () => {
    if (!name.trim() || !price) return
    onAdd({ name: name.trim(), price: parseFloat(price), unit, emoji })
    setName(''); setPrice(''); setEmoji('📦')
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3">
      <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">নতুন পণ্য</div>
      <input
        value={name} onChange={e => setName(e.target.value)}
        placeholder="পণ্যের নাম"
        className="w-full bg-slate-900 border border-slate-600 focus:border-brand-500 rounded-xl px-3 py-2.5 text-white text-sm outline-none transition-colors"
      />
      <div className="grid grid-cols-3 gap-2">
        <input
          value={price} onChange={e => setPrice(e.target.value)}
          placeholder="দাম ৳" type="number"
          className="bg-slate-900 border border-slate-600 focus:border-brand-500 rounded-xl px-3 py-2.5 text-white text-sm outline-none font-mono transition-colors"
        />
        <input
          value={unit} onChange={e => setUnit(e.target.value)}
          placeholder="একক"
          className="bg-slate-900 border border-slate-600 focus:border-brand-500 rounded-xl px-3 py-2.5 text-white text-sm outline-none transition-colors"
        />
        <input
          value={emoji} onChange={e => setEmoji(e.target.value)}
          placeholder="🛍️" maxLength={2}
          className="bg-slate-900 border border-slate-600 focus:border-brand-500 rounded-xl px-3 py-2.5 text-white text-sm outline-none text-center text-lg transition-colors"
        />
      </div>
      <button
        onClick={submit}
        className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
      >
        + যোগ করুন
      </button>
    </div>
  )
}
