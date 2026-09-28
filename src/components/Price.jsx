import { formatMoney } from '../lib/shopify'

export default function Price({ price, compareAt, from = false, className = '' }) {
  const onSale = compareAt && Number(compareAt.amount) > Number(price?.amount)
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className={onSale ? 'font-semibold text-rosewood' : 'font-semibold'}>
        {from && <span className="mr-1 text-xs font-normal text-muted">From</span>}
        {formatMoney(price)}
      </span>
      {onSale && <s className="text-sm text-muted">{formatMoney(compareAt)}</s>}
    </span>
  )
}
