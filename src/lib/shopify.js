// Thin client for the Shopify Storefront API (GraphQL).
// Products, inventory, cart and checkout all live in Shopify — this site only reads
// catalog data and builds a cart; payment happens on Shopify's hosted checkout.

const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN?.trim()
const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN?.trim()
const apiVersion = import.meta.env.VITE_SHOPIFY_API_VERSION?.trim() || '2026-07'

export const STORE_NAME = import.meta.env.VITE_STORE_NAME?.trim() || 'Lumière Beauty'

/** True when no Storefront token is configured — the site then runs on demo data. */
export const isDemoMode = !domain || !token

const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`

export class ShopifyError extends Error {}

export async function storefront(query, variables = {}) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) {
    throw new ShopifyError(`Shopify request failed (${res.status}). Check your store domain and Storefront token.`)
  }
  const json = await res.json()
  if (json.errors?.length) throw new ShopifyError(json.errors.map((e) => e.message).join('; '))
  return json.data
}

/** Throws if a cart mutation returned userErrors (e.g. item out of stock). */
export function assertNoUserErrors(payload) {
  const errs = payload?.userErrors ?? []
  if (errs.length) throw new ShopifyError(errs.map((e) => e.message).join('; '))
  return payload
}

// ---------- GraphQL fragments & queries ----------

const MONEY = `amount currencyCode`

const PRODUCT_CARD = `
  fragment ProductCard on Product {
    id handle title vendor productType tags availableForSale
    featuredImage { url altText width height }
    images(first: 2) { nodes { url altText } }
    priceRange { minVariantPrice { ${MONEY} } maxVariantPrice { ${MONEY} } }
    compareAtPriceRange { minVariantPrice { ${MONEY} } }
    variants(first: 2) { nodes { id availableForSale } }
  }
`

const PRODUCT_FULL = `
  fragment ProductFull on Product {
    id handle title vendor productType tags availableForSale
    featuredImage { url altText width height }
    priceRange { minVariantPrice { ${MONEY} } maxVariantPrice { ${MONEY} } }
    compareAtPriceRange { minVariantPrice { ${MONEY} } }
    description descriptionHtml
    images(first: 12) { nodes { url altText width height } }
    options { name optionValues { name } }
    variants(first: 100) {
      nodes {
        id title availableForSale
        selectedOptions { name value }
        price { ${MONEY} }
        compareAtPrice { ${MONEY} }
        image { url altText }
      }
    }
    seo { title description }
  }
`

export const PRODUCTS_QUERY = `
  query Products($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
      nodes { ...ProductCard }
      pageInfo { hasNextPage endCursor }
    }
  }
  ${PRODUCT_CARD}
`

export const COLLECTION_PRODUCTS_QUERY = `
  query CollectionProducts($handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
    collection(handle: $handle) {
      id title description
      image { url altText }
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
        nodes { ...ProductCard }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
  ${PRODUCT_CARD}
`

export const COLLECTIONS_QUERY = `
  query Collections {
    collections(first: 20, sortKey: TITLE) {
      nodes { id handle title description image { url altText } }
    }
  }
`

export const PRODUCT_QUERY = `
  query Product($handle: String!) {
    product(handle: $handle) { ...ProductFull }
  }
  ${PRODUCT_FULL}
`

export const RECOMMENDATIONS_QUERY = `
  query Recs($productId: ID!) {
    productRecommendations(productId: $productId) { ...ProductCard }
  }
  ${PRODUCT_CARD}
`

const CART_FIELDS = `
  fragment CartFields on Cart {
    id checkoutUrl totalQuantity
    cost { subtotalAmount { ${MONEY} } totalAmount { ${MONEY} } }
    lines(first: 100) {
      nodes {
        id quantity
        cost { totalAmount { ${MONEY} } }
        merchandise {
          ... on ProductVariant {
            id title availableForSale
            price { ${MONEY} }
            image { url altText }
            product { handle title }
          }
        }
      }
    }
  }
`

export const CART_QUERY = `query Cart($id: ID!) { cart(id: $id) { ...CartFields } } ${CART_FIELDS}`

export const CART_CREATE = `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) { cart { ...CartFields } userErrors { message } }
  } ${CART_FIELDS}
`

export const CART_LINES_ADD = `
  mutation Add($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { message } }
  } ${CART_FIELDS}
`

export const CART_LINES_UPDATE = `
  mutation Update($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { message } }
  } ${CART_FIELDS}
`

export const CART_LINES_REMOVE = `
  mutation Remove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } userErrors { message } }
  } ${CART_FIELDS}
`

// ---------- helpers ----------

export function formatMoney(money) {
  if (!money) return ''
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: money.currencyCode }).format(
    Number(money.amount),
  )
}

/** Normalises a Shopify cart into the shape the UI uses (shared with demo mode). */
export function normalizeCart(cart) {
  if (!cart) return null
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    subtotal: cart.cost.subtotalAmount,
    lines: cart.lines.nodes.map((l) => ({
      id: l.id,
      quantity: l.quantity,
      total: l.cost.totalAmount,
      variantId: l.merchandise.id,
      variantTitle: l.merchandise.title,
      price: l.merchandise.price,
      image: l.merchandise.image,
      handle: l.merchandise.product.handle,
      productTitle: l.merchandise.product.title,
    })),
  }
}
