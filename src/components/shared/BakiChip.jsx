import { taka } from '../../utils/helpers'

export default function BakiChip({ amount, showAmount = false }) {
  const hasBalance = amount > 0
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${hasBalance ? 'bg-red-950/60 text-red-400' : 'bg-teal-950/60 text-teal-400'}`}>
      {showAmount ? taka(amount) : (hasBalance ? 'বাকি' : 'পরিশোধ ✓')}
    </span>
  )
}
