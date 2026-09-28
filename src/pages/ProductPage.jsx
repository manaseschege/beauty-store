import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { App, Breadcrumb, Button, Collapse, Skeleton } from 'antd'
import { CarOutlined, CheckCircleFilled, SafetyOutlined, UndoOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import { fetchProduct, fetchRecommendations } from '../lib/catalog'
import { useCart } from '../context/CartContext'
import { useTitle } from '../hooks/useTitle'
import ProductImage from '../components/ProductImage'
import ProductGrid from '../components/ProductGrid'
import Price from '../components/Price'
import QuantityStepper from '../components/QuantityStepper'
import ErrorState from '../components/ErrorState'
import NotFound from './NotFound'

function Gallery({ product, activeImage }) {
  const images = product.images.nodes
  const [picked, setPicked] = useState(0)
  // A variant with its own photo (e.g. a lipstick shade) takes over the main image until a thumbnail is clicked.
  const variantIndex = activeImage ? images.findIndex((i) => i.url === activeImage.url) : -1
  const [lastVariantIndex, setLastVariantIndex] = useState(variantIndex)
  if (variantIndex !== lastVariantIndex) {
    setLastVariantIndex(variantIndex)
    if (variantIndex >= 0) setPicked(variantIndex)
  }
  const main = images[picked] ?? product.featuredImage

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto md:w-20 md:flex-col">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setPicked(i)}
              className={clsx('shrink-0 overflow-hidden rounded-xl border-2 transition', i === picked ? 'border-rosewood' : 'border-transparent opacity-70 hover:opacity-100')}
              aria-label={`Show image ${i + 1}`}
            >
              <ProductImage image={img} alt={product.title} width={160} className="h-20 w-16 md:h-24 md:w-20" />
            </button>
          ))}
        </div>
      )}
      <ProductImage image={main} alt={product.title} seed={product.handle} width={1200} className="aspect-[4/5] flex-1 rounded-3xl" />
    </div>
  )
}

function OptionPicker({ option, value, onChange, isAvailable }) {
  return (
    <div>
      <p className="mb-2 text-sm">
        <span className="font-semibold">{option.name}:</span> <span className="text-muted">{value}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {option.optionValues.map(({ name }) => {
          const available = isAvailable(option.name, name)
          return (
            <button
              key={name}
              onClick={() => onChange(name)}
              className={clsx(
                'rounded-full border px-4 py-2 text-sm transition',
                value === name ? 'border-ink bg-ink text-white' : 'border-blush-200 bg-white hover:border-ink',
                !available && 'text-muted line-through decoration-1',
              )}
            >
              {name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ProductDetails({ product, onVariantImage }) {
  const { addItem, buyNow, openCart, busy } = useCart()
  const { message, modal } = App.useApp()
  const variants = product.variants.nodes
  const initial = variants.find((v) => v.availableForSale) ?? variants[0]
  const [selected, setSelected] = useState(() => Object.fromEntries(initial.selectedOptions.map((o) => [o.name, o.value])))
  const [qty, setQty] = useState(1)

  const variant = useMemo(
    () => variants.find((v) => v.selectedOptions.every((o) => selected[o.name] === o.value)),
    [variants, selected],
  )
  const available = !!variant?.availableForSale

  useEffect(() => onVariantImage(variant?.image ?? null), [variant, onVariantImage])
  const hasOptions = !(product.options.length === 1 && product.options[0].optionValues.length === 1)

  const isAvailable = (name, value) =>
    variants.some(
      (v) =>
        v.availableForSale &&
        v.selectedOptions.every((o) => (o.name === name ? o.value === value : selected[o.name] === o.value)),
    )

  const meta = () => ({
    price: variant.price,
    variantTitle: variant.title,
    productTitle: product.title,
    handle: product.handle,
    image: variant.image ?? product.featuredImage,
  })

  async function add() {
    try {
      await addItem(variant.id, qty, meta())
      message.success(`${product.title} added to your bag`)
      openCart()
    } catch (err) {
      message.error(err.message)
    }
  }

  async function buy() {
    try {
      const redirected = await buyNow(variant.id, qty)
      if (!redirected) {
        modal.info({ title: 'Demo mode', content: 'Connect your Shopify store (see README) to enable checkout.' })
      }
    } catch (err) {
      message.error(err.message)
    }
  }

  return (
    <div className="lg:sticky lg:top-24">
      {product.vendor && <p className="eyebrow mb-3">{product.vendor}</p>}
      <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">{product.title}</h1>
      <div className="mt-4 text-xl">
        {variant ? <Price price={variant.price} compareAt={variant.compareAtPrice} /> : <span className="text-muted">Unavailable</span>}
      </div>
      <p className="mt-1 text-xs text-muted">Taxes and shipping calculated at checkout.</p>

      {product.description && <p className="mt-6 leading-relaxed text-muted">{product.description.slice(0, 220)}{product.description.length > 220 && '…'}</p>}

      {hasOptions && (
        <div className="mt-8 space-y-6">
          {product.options.map((option) => (
            <OptionPicker
              key={option.name}
              option={option}
              value={selected[option.name]}
              isAvailable={isAvailable}
              onChange={(v) => setSelected((s) => ({ ...s, [option.name]: v }))}
            />
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center gap-2 text-sm">
        {available ? (
          <><CheckCircleFilled className="text-emerald-600" /> In stock, ready to ship</>
        ) : (
          <span className="text-muted">This option is currently sold out</span>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <QuantityStepper size="large" value={qty} onChange={setQty} disabled={!available} />
        <Button type="primary" size="large" shape="round" className="!h-12 flex-1" disabled={!available} loading={busy} onClick={add}>
          {available ? 'Add to bag' : 'Sold out'}
        </Button>
      </div>
      {available && (
        <Button size="large" shape="round" block className="mt-3 !h-12 !border-ink !bg-ink !text-white hover:!bg-ink/85" onClick={buy} disabled={busy}>
          Buy it now
        </Button>
      )}

      <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl bg-blush-50 p-4 text-center text-xs">
        <div><CarOutlined className="mb-1 text-lg text-rosewood" /><p>Free shipping over $50</p></div>
        <div><UndoOutlined className="mb-1 text-lg text-rosewood" /><p>30-day returns</p></div>
        <div><SafetyOutlined className="mb-1 text-lg text-rosewood" /><p>Secure Shopify checkout</p></div>
      </div>

      <Collapse
        ghost
        className="mt-6 border-t border-blush-200"
        defaultActiveKey={['details']}
        items={[
          {
            key: 'details',
            label: <span className="font-semibold">Details</span>,
            children: <div className="rich-text text-sm text-muted" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />,
          },
          {
            key: 'shipping',
            label: <span className="font-semibold">Shipping & returns</span>,
            children: (
              <p className="text-sm text-muted">
                Orders are processed within 1–3 business days and typically arrive in 7–14 business days. You’ll receive a
                tracking link by email as soon as your order ships. Not happy? Return within 30 days of delivery.{' '}
                <Link to="/help#shipping">Read more</Link>
              </p>
            ),
          },
        ]}
      />
    </div>
  )
}

export default function ProductPage() {
  const { handle } = useParams()
  const product = useQuery({ queryKey: ['product', handle], queryFn: () => fetchProduct(handle) })
  const recs = useQuery({
    queryKey: ['recs', product.data?.id],
    queryFn: () => fetchRecommendations(product.data),
    enabled: !!product.data,
  })
  const [variantImage, setVariantImage] = useState(null)
  useTitle(product.data?.seo?.title || product.data?.title)

  if (product.isPending) {
    return (
      <div className="container-page grid gap-12 py-10 lg:grid-cols-2">
        <Skeleton.Node active className="!aspect-[4/5] !h-auto !w-full !rounded-3xl [&_.ant-skeleton-node]:!h-full [&_.ant-skeleton-node]:!w-full" />
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    )
  }
  if (product.isError) return <ErrorState error={product.error} onRetry={product.refetch} />
  if (!product.data) return <NotFound />

  const p = product.data
  return (
    <div className="container-page py-8">
      <Breadcrumb
        className="mb-6"
        items={[
          { title: <Link to="/">Home</Link> },
          { title: <Link to="/shop">Shop</Link> },
          { title: p.title },
        ]}
      />
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Gallery key={p.id} product={p} activeImage={variantImage} />
        <ProductDetails key={p.id} product={p} onVariantImage={setVariantImage} />
      </div>

      {recs.data?.length > 0 && (
        <section className="mt-24">
          <p className="eyebrow mb-2">Complete the routine</p>
          <h2 className="mb-8 text-4xl font-semibold">You may also like</h2>
          <ProductGrid products={recs.data} />
        </section>
      )}
    </div>
  )
}
