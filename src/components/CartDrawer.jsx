import { Link } from 'react-router-dom'
import { App, Button, Drawer, Empty, Progress, Spin } from 'antd'
import { DeleteOutlined, LockOutlined } from '@ant-design/icons'
import { useCart } from '../context/CartContext'
import { formatMoney, isDemoMode } from '../lib/shopify'
import ProductImage from './ProductImage'
import QuantityStepper from './QuantityStepper'

const FREE_SHIPPING = 50

export default function CartDrawer() {
  const { cart, open, closeCart, busy, loading, updateLine, removeLine, checkout, count } = useCart()
  const { message, modal } = App.useApp()
  const lines = cart?.lines ?? []
  const subtotal = Number(cart?.subtotal?.amount ?? 0)
  const toFree = Math.max(0, FREE_SHIPPING - subtotal)

  const safe = (fn) => async (...args) => {
    try {
      await fn(...args)
    } catch (err) {
      message.error(err.message)
    }
  }

  function goToCheckout() {
    if (checkout()) return
    modal.info({
      title: 'Demo mode',
      content:
        'Checkout is disabled until the site is connected to your Shopify store. Add your Storefront API token to .env (see README) and customers will be sent to Shopify’s secure checkout.',
    })
  }

  return (
    <Drawer
      open={open}
      onClose={closeCart}
      width={420}
      title={<span className="font-display text-2xl">Your bag {count > 0 && <span className="text-base text-muted">({count})</span>}</span>}
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' } }}
    >
      {loading ? (
        <div className="flex flex-1 items-center justify-center"><Spin /></div>
      ) : lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
          <Empty description="Your bag is empty" />
          <Link to="/shop" onClick={closeCart}>
            <Button type="primary" size="large" shape="round">Start shopping</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="border-b border-blush-100 px-5 py-4">
            <p className="mb-1 text-sm">
              {toFree > 0 ? (
                <>You’re <b>{formatMoney({ amount: toFree, currencyCode: cart.subtotal.currencyCode })}</b> away from free shipping</>
              ) : (
                <>🎉 You’ve unlocked <b>free shipping</b></>
              )}
            </p>
            <Progress percent={Math.min(100, (subtotal / FREE_SHIPPING) * 100)} showInfo={false} strokeColor="#b4536a" size="small" />
          </div>

          <Spin spinning={busy} wrapperClassName="flex-1 overflow-y-auto">
            <ul className="divide-y divide-blush-100 px-5">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-4 py-4">
                  <Link to={`/products/${line.handle}`} onClick={closeCart} className="shrink-0">
                    <ProductImage image={line.image} alt={line.productTitle} seed={line.handle} width={200} className="h-24 w-20 rounded-xl" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <Link to={`/products/${line.handle}`} onClick={closeCart} className="font-medium text-ink hover:text-rosewood">
                        {line.productTitle}
                      </Link>
                      <Button type="text" size="small" icon={<DeleteOutlined />} onClick={() => safe(removeLine)(line.id)} aria-label="Remove" />
                    </div>
                    {line.variantTitle && line.variantTitle !== 'Default Title' && (
                      <span className="text-xs text-muted">{line.variantTitle}</span>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QuantityStepper size="small" value={line.quantity} min={0} onChange={(q) => safe(updateLine)(line.id, q)} disabled={busy} />
                      <span className="font-medium">{formatMoney(line.total)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Spin>

          <div className="border-t border-blush-100 bg-white px-5 py-5">
            <div className="mb-1 flex justify-between text-base">
              <span>Subtotal</span>
              <span className="font-semibold">{formatMoney(cart.subtotal)}</span>
            </div>
            <p className="mb-4 text-xs text-muted">Shipping, taxes and discount codes are calculated at checkout.</p>
            <Button type="primary" size="large" block shape="round" icon={<LockOutlined />} onClick={goToCheckout} disabled={busy}>
              Secure checkout
            </Button>
            {isDemoMode && <p className="mt-2 text-center text-xs text-muted">Demo mode — connect Shopify to enable checkout</p>}
          </div>
        </>
      )}
    </Drawer>
  )
}
