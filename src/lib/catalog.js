// Catalog reads. Each function talks to Shopify, or to the demo catalogue when no token is set.
import { demoCatalog } from '../data/demoCatalog'
import {
  COLLECTION_PRODUCTS_QUERY,
  COLLECTIONS_QUERY,
  PRODUCT_QUERY,
  PRODUCTS_QUERY,
  RECOMMENDATIONS_QUERY,
  isDemoMode,
  storefront,
} from './shopify'

export const PAGE_SIZE = 12

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'best', label: 'Best selling' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
]

// Shopify uses different sort enums for the top-level product list and for collections.
const PRODUCT_SORT = {
  featured: { sortKey: 'BEST_SELLING', reverse: false },
  best: { sortKey: 'BEST_SELLING', reverse: false },
  newest: { sortKey: 'CREATED_AT', reverse: true },
  'price-asc': { sortKey: 'PRICE', reverse: false },
  'price-desc': { sortKey: 'PRICE', reverse: true },
}
const COLLECTION_SORT = {
  ...PRODUCT_SORT,
  featured: { sortKey: 'COLLECTION_DEFAULT', reverse: false },
  newest: { sortKey: 'CREATED', reverse: true },
}

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))
const minPrice = (p) => Number(p.priceRange.minVariantPrice.amount)

/** Returns one page: { products, pageInfo, collection } */
export async function fetchProducts({ collection, search, sort = 'featured', after, first = PAGE_SIZE }) {
  if (isDemoMode) return demoProducts({ collection, search, sort, after, first })

  // Text search runs across the whole store; Shopify can't text-search inside a collection.
  if (collection && !search) {
    const data = await storefront(COLLECTION_PRODUCTS_QUERY, {
      handle: collection,
      first,
      after,
      ...COLLECTION_SORT[sort],
    })
    if (!data.collection) return { products: [], pageInfo: { hasNextPage: false }, collection: null }
    const { products, ...info } = data.collection
    return { products: products.nodes, pageInfo: products.pageInfo, collection: info }
  }

  const { sortKey, reverse } = search && sort === 'featured' ? { sortKey: 'RELEVANCE', reverse: false } : PRODUCT_SORT[sort]
  const data = await storefront(PRODUCTS_QUERY, { first, after, query: search || null, sortKey, reverse })
  return { products: data.products.nodes, pageInfo: data.products.pageInfo, collection: null }
}

export async function fetchCollections() {
  if (isDemoMode) return demoCatalog.collections
  const data = await storefront(COLLECTIONS_QUERY)
  // Hide Shopify's automatic "frontpage"/"all" collections from navigation.
  return data.collections.nodes.filter((c) => !['frontpage', 'all'].includes(c.handle))
}

export async function fetchProduct(handle) {
  if (isDemoMode) {
    await delay()
    return demoCatalog.products.find((p) => p.handle === handle) ?? null
  }
  const data = await storefront(PRODUCT_QUERY, { handle })
  return data.product
}

export async function fetchRecommendations(product) {
  if (isDemoMode) {
    await delay()
    const others = demoCatalog.products.filter((p) => p.id !== product.id)
    const same = others.filter((p) => p.collection === product.collection)
    return [...same, ...others.filter((p) => !same.includes(p))].slice(0, 4)
  }
  const data = await storefront(RECOMMENDATIONS_QUERY, { productId: product.id })
  return (data.productRecommendations ?? []).slice(0, 4)
}

async function demoProducts({ collection, search, sort, after, first }) {
  await delay()
  let list = [...demoCatalog.products]
  const coll = collection ? demoCatalog.collections.find((c) => c.handle === collection) ?? null : null
  if (collection && !search) list = list.filter((p) => p.collection === collection)
  if (search) {
    const q = search.toLowerCase()
    list = list.filter((p) => [p.title, p.productType, p.description, ...p.tags].join(' ').toLowerCase().includes(q))
  }
  const sorters = {
    featured: (a, b) => a.bestSellerRank - b.bestSellerRank,
    best: (a, b) => a.bestSellerRank - b.bestSellerRank,
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    'price-asc': (a, b) => minPrice(a) - minPrice(b),
    'price-desc': (a, b) => minPrice(b) - minPrice(a),
  }
  list.sort(sorters[sort])
  const start = after ? Number(after) : 0
  const page = list.slice(start, start + first)
  const end = start + page.length
  return {
    products: page,
    pageInfo: { hasNextPage: end < list.length, endCursor: String(end) },
    collection: search ? null : coll,
  }
}
