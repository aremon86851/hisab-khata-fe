import { useState } from 'react'
import CustomerRow from '../../components/shopkeeper/CustomerRow'
import AddCustomerForm from '../../components/shopkeeper/AddCustomerForm'

export default function SKCustomers({ customers, onAdd, onRate, showToast }) {
  const [showForm, setShowForm] = useState(false)

  const handleAdd = (name, mobile) => {
    const exists = customers.find(c => c.mobile === mobile)
    if (exists) { showToast('এই নম্বরে ইতিমধ্যে customer আছে', 'info'); return }
    onAdd(name, mobile)
    setShowForm(false)
  }

  return (
    <div className="p-4 space-y-3 animate-fade-in">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl text-sm transition-colors"
        >
          + নতুন Customer যোগ করুন
        </button>
      ) : (
        <AddCustomerForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      <div className="space-y-2">
        {customers.map(c => (
          <CustomerRow key={c.id} customer={c} onRate={onRate} />
        ))}
      </div>
    </div>
  )
}
