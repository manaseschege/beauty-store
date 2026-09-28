import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  CART_CREATE,
  CART_LINES_ADD,
  CART_LINES_REMOVE,
  CART_LINES_UPDATE,
  CART_QUERY,
  assertNoUserErrors,
  isDemoMode,
  normalizeCart,
  storefront,
} from '../lib/shopify'

// The cart lives in Shopify (Cart API); we only remember its id in the browser.
// Checkout sends the shopper to cart.checkoutUrl, where Shopify takes payment,
// creates the order and decrements inventory.

const CART_KEY = isDemoMode ? 'demo-cart' : 'shopify-cart-id'
const CartContext = createContext(null)

const read = (key) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
const write = (key, value) => {
  try {
    if (value == null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* storage unavailable — cart just won't persist across reloads */
  }
}

// ---------- demo-mode cart (local only) ----------

function demoCartFrom(lines) {
  const currencyCode = lines[0]?.price.currencyCode ?? 'USD'
  const subtotal = lines.reduce((s, l) => s + Number(l.price.amount) * l.quantity, 0)
  return {
    id: 'demo',
    checkoutUrl: null,
    totalQuantity: lines.reduce((s, l) => s + l.quantity, 0),
    subtotal: { amount: String(subtotal), currencyCode },
    lines: lines.map((l) => ({
      ...l,
      total: { amount: String(Number(l.price.amount) * l.quantity), currencyCode: l.price.currencyCode },
    })),
  }
}

function loadDemoCart() {
  try {
    return demoCartFrom(JSON.parse(read(CART_KEY)) ?? [])
  } catch {
    return demoCartFrom([])
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => (isDemoMode ? loadDemoCart() : null))
  const [loading, setLoading] = useState(!isDemoMode)
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)

  // Restore an existing Shopify cart. Carts expire or become completed after checkout — start fresh then.
  useEffect(() => {
    if (isDemoMode) return
    const id = read(CART_KEY)
    if (!id) {
      setLoading(false)
      return
    }
    storefront(CART_QUERY, { id })
      .then((data) => {
        if (data.cart) setCart(normalizeCart(data.cart))
        else write(CART_KEY, null)
      })
      .catch(() => write(CART_KEY, null))
      .finally(() => setLoading(false))
  }, [])

  const saveDemo = useCallback((lines) => {
    write(CART_KEY, JSON.stringify(lines.map(({ total: _total, ...l }) => l)))
    setCart(demoCartFrom(lines))
  }, [])

  const run = useCallback(async (fn) => {
    setBusy(true)
    try {
      return await fn()
    } finally {
      setBusy(false)
    }
  }, [])

  /** meta = { price, variantTitle, productTitle, handle, image } — only needed in demo mode. */
  const addItem = useCallback(
    (variantId, quantity = 1, meta = {}) =>
      run(async () => {
        if (isDemoMode) {
          const exists = cart.lines.some((l) => l.variantId === variantId)
          saveDemo(
            exists
              ? cart.lines.map((l) => (l.variantId === variantId ? { ...l, quantity: l.quantity + quantity } : l))
              : [...cart.lines, { id: `line-${variantId}`, variantId, quantity, ...meta }],
          )
          return
        }
        const lines = [{ merchandiseId: variantId, quantity }]
        let payload
        if (cart?.id) {
          payload = (await storefront(CART_LINES_ADD, { cartId: cart.id, lines })).cartLinesAdd
        } else {
          payload = (await storefront(CART_CREATE, { lines })).cartCreate
        }
        assertNoUserErrors(payload)
        write(CART_KEY, payload.cart.id)
        setCart(normalizeCart(payload.cart))
      }),
    [cart, run, saveDemo],
  )

  const removeLineInner = useCallback(
    async (lineId) => {
      if (isDemoMode) {
        saveDemo(cart.lines.filter((l) => l.id !== lineId))
        return
      }
      const payload = (await storefront(CART_LINES_REMOVE, { cartId: cart.id, lineIds: [lineId] })).cartLinesRemove
      assertNoUserErrors(payload)
      setCart(normalizeCart(payload.cart))
    },
    [cart, saveDemo],
  )

  const updateLine = useCallback(
    (lineId, quantity) =>
      run(async () => {
        if (quantity < 1) return removeLineInner(lineId)
        if (isDemoMode) {
          saveDemo(cart.lines.map((l) => (l.id === lineId ? { ...l, quantity } : l)))
          return
        }
        const payload = (await storefront(CART_LINES_UPDATE, { cartId: cart.id, lines: [{ id: lineId, quantity }] }))
          .cartLinesUpdate
        assertNoUserErrors(payload)
        setCart(normalizeCart(payload.cart))
      }),
    [cart, run, saveDemo, removeLineInner],
  )

  const removeLine = useCallback((lineId) => run(() => removeLineInner(lineId)), [run, removeLineInner])

  /** Sends the shopper to Shopify's secure checkout. Returns false in demo mode. */
  const checkout = useCallback(() => {
    if (!cart?.checkoutUrl) return false
    window.location.href = cart.checkoutUrl
    return true
  }, [cart])

  /** "Buy it now": a one-off Shopify cart for a single item, straight to checkout. Returns false in demo mode. */
  const buyNow = useCallback(
    (variantId, quantity = 1) =>
      run(async () => {
        if (isDemoMode) return false
        const payload = assertNoUserErrors(
          (await storefront(CART_CREATE, { lines: [{ merchandiseId: variantId, quantity }] })).cartCreate,
        )
        window.location.href = payload.cart.checkoutUrl
        return true
      }),
    [run],
  )

  const value = useMemo(
    () => ({
      cart,
      count: cart?.totalQuantity ?? 0,
      loading,
      busy,
      open,
      openCart: () => setOpen(true),
      closeCart: () => setOpen(false),
      addItem,
      updateLine,
      removeLine,
      checkout,
      buyNow,
    }),
    [cart, loading, busy, open, addItem, updateLine, removeLine, checkout, buyNow],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
