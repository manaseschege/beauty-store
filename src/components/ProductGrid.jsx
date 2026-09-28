import { Skeleton } from 'antd'
import ProductCard from './ProductCard'

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <Skeleton.Node active className="!aspect-[4/5] !h-auto !w-full !rounded-2xl [&_.ant-skeleton-node]:!h-full [&_.ant-skeleton-node]:!w-full" />
          <Skeleton active title={false} paragraph={{ rows: 2 }} className="mt-3" />
        </div>
      ))}
    </div>
  )
}

export default function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  )
}
