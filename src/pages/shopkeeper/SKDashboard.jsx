import { useMemo } from 'react'
import StatCard from '../../components/shared/StatCard'
import CustomerRow from '../../components/shopkeeper/CustomerRow'
import { taka } from '../../utils/helpers'

export default function SKDashboard({ shop, customers, transactions, onCalc }) {
  const today = useMemo(
    () => transactions.filter(t => t.shopId === shop.id && t.date.includes('আজ')).length,
    [transactions, shop.id]
  )
  const totalBaki   = customers.reduce((s, c) => s + c.baki, 0)
  const pendingCount = customers.filter(c => c.baki > 0).length

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="মোট বাকি"     value={taka(totalBaki)}  sub={`${pendingCount} জনের কাছে`} color="red"    />
        <StatCard label="Customers"     value={customers.length} sub="মোট"                          color="brand"  />
        <StatCard label="বাকি আছে"     value={pendingCount}     sub="জন customer"                   color="amber"  />
        <StatCard label="আজকের Entry"  value={today}            sub="টি লেনদেন"                     color="violet" />
      </div>

      {/* List */}
      <div>
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">
          👥 Customer তালিকা
        </div>
        <div className="space-y-2">
          {customers.map(c => (
            <CustomerRow key={c.id} customer={c} onCalc={onCalc} />
          ))}
        </div>
      </div>
    </div>
  )
}
