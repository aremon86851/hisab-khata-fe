export default function ProductCard({ product }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center hover:border-brand-700 transition-colors">
      <div className="text-3xl mb-1.5">{product.emoji}</div>
      <div className="text-white text-xs font-bold leading-tight">{product.name}</div>
      <div className="text-brand-400 font-mono text-[11px] mt-1">
        ৳{product.price}/{product.unit}
      </div>
    </div>
  )
}
