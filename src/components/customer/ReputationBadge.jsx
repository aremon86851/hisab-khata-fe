import { repLabel } from '../../utils/helpers'
import StarRating from '../shared/StarRating'

export default function ReputationBadge({ score, size = 'md' }) {
  const { label, color } = repLabel(score)
  const isLarge = size === 'lg'

  return (
    <div className={`inline-flex flex-col items-center ${isLarge ? 'gap-1.5' : 'gap-0.5'}`}>
      <StarRating rating={Math.round(parseFloat(score))} />
      <div className={`font-mono font-extrabold ${color} ${isLarge ? 'text-4xl' : 'text-xl'}`}>
        {score}
      </div>
      <div className={`font-semibold ${color} ${isLarge ? 'text-sm' : 'text-xs'}`}>{label}</div>
    </div>
  )
}
