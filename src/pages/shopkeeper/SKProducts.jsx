import ProductCard from '../../components/shared/ProductCard'
import AddProductForm from '../../components/shopkeeper/AddProductForm'

export default function SKProducts({ products, onAdd }) {
  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <AddProductForm onAdd={onAdd} />
      <div>
        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">
          📦 পণ্য তালিকা ({products.length}টি)
        </div>
        <div className="grid grid-cols-3 gap-3">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  )
}
