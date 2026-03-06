/** Format taka amount */
export const taka = (n) => '৳' + Number(n).toLocaleString('en')

/** Compute reputation score for a customer */
export function reputationScore(customer) {
  const ratings = Object.values(customer.ratings || {})
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 3
  const shopsWithBaki = Object.values(customer.shopBalances || {}).filter(b => b > 0).length
  const score = Math.max(1, Math.min(5, avg - shopsWithBaki * 0.3))
  return score.toFixed(1)
}

/** Reputation label */
export function repLabel(score) {
  const s = parseFloat(score)
  if (s >= 4.5) return { label: 'অসাধারণ',         color: 'text-teal-400'  }
  if (s >= 3.5) return { label: 'ভালো পেয়ার',      color: 'text-green-400' }
  if (s >= 2.5) return { label: 'গড়পড়তা',         color: 'text-amber-400' }
  return         { label: 'উন্নতি প্রয়োজন',        color: 'text-red-400'   }
}

/** Stars array helper */
export const stars = (rating, max = 5) =>
  Array.from({ length: max }, (_, i) => i < Math.round(rating))
