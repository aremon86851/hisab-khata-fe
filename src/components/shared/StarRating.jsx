import { stars } from '../../utils/helpers'

export default function StarRating({ rating, max = 5, interactive = false, onChange }) {
  return (
    <div className="flex gap-0.5">
      {stars(rating, max).map((filled, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(i + 1)}
          className={`
            text-lg leading-none transition-transform
            ${interactive ? 'cursor-pointer hover:scale-125' : 'cursor-default'}
            ${filled ? 'text-amber-400' : 'text-slate-700'}
          `}
        >
          ★
        </button>
      ))}
    </div>
  )
}
