import { useMemo } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Button, Checkbox, Empty, Select, Tag } from 'antd'
import clsx from 'clsx'
import { SORT_OPTIONS, fetchProducts } from '../lib/catalog'
import { useCollections } from '../hooks/useCollections'
import { useTitle } from '../hooks/useTitle'
import ProductGrid, { ProductGridSkeleton } from '../components/ProductGrid'
import ErrorState from '../components/ErrorState'

export default function Shop() {
  const { handle } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const search = params.get('q') ?? ''
  const sort = params.get('sort') ?? 'featured'
  const inStock = params.get('stock') === '1'
  const { data: collections = [] } = useCollections()

  const query = useInfiniteQuery({
    queryKey: ['products', { handle, search, sort }],
    queryFn: ({ pageParam }) => fetchProducts({ collection: handle, search, sort, after: pageParam }),
    initialPageParam: null,
    getNextPageParam: (last) => (last.pageInfo.hasNextPage ? last.pageInfo.endCursor : undefined),
  })

  const collection = query.data?.pages[0]?.collection ?? collections.find((c) => c.handle === handle)
  const products = useMemo(() => {
    const all = query.data?.pages.flatMap((p) => p.products) ?? []
    return inStock ? all.filter((p) => p.availableForSale) : all
  }, [query.data, inStock])

  const title = search ? `Results for “${search}”` : collection?.title ?? (handle ? 'Collection' : 'Shop all')
  useTitle(title)

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  // Switching category clears the text search (Shopify can't search inside a collection).
  const browseParams = new URLSearchParams(params)
  browseParams.delete('q')
  const browseSearch = browseParams.toString()

  const pill = (active) =>
    clsx(
      'whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition',
      active ? 'border-ink bg-ink text-white' : 'border-blush-200 bg-white text-ink hover:border-rosewood hover:text-rosewood',
    )

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="mb-8 text-center">
        <p className="eyebrow mb-2">{search ? 'Search' : 'Collection'}</p>
        <h1 className="text-5xl font-semibold sm:text-6xl">{title}</h1>
        {!search && collection?.description && <p className="mx-auto mt-3 max-w-xl text-muted">{collection.description}</p>}
        {search && (
          <Tag closable onClose={() => navigate(handle ? `/collections/${handle}` : '/shop')} className="mt-4 !px-3 !py-1 !text-sm">
            {search}
          </Tag>
        )}
      </header>

      <div className="mb-8 flex flex-col gap-4 border-y border-blush-200 py-4 md:flex-row md:items-center md:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0 md:pb-0">
          <Link to={{ pathname: '/shop', search: browseSearch }} className={pill(!handle && !search)}>All</Link>
          {collections.map((c) => (
            <Link key={c.id} to={{ pathname: `/collections/${c.handle}`, search: browseSearch }} className={pill(handle === c.handle && !search)}>
              {c.title}
            </Link>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4">
          <Checkbox checked={inStock} onChange={(e) => setParam('stock', e.target.checked ? '1' : null)}>In stock only</Checkbox>
          <Select
            value={sort}
            onChange={(v) => setParam('sort', v === 'featured' ? null : v)}
            options={SORT_OPTIONS}
            className="w-48"
            aria-label="Sort products"
          />
        </div>
      </div>

      {query.isPending ? (
        <ProductGridSkeleton />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={query.refetch} />
      ) : products.length === 0 ? (
        <Empty className="py-16" description={search ? `No products match “${search}”.` : 'Our collection is launching soon — check back shortly.'}>
          <Link to="/shop"><Button shape="round">View all products</Button></Link>
        </Empty>
      ) : (
        <>
          <ProductGrid products={products} />
          {query.hasNextPage && (
            <div className="mt-12 text-center">
              <Button size="large" shape="round" loading={query.isFetchingNextPage} onClick={() => query.fetchNextPage()} className="!px-10">
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
