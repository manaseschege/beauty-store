import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { App, Button, Input } from 'antd'
import {
  ArrowRightOutlined,
  CarOutlined,
  CheckCircleFilled,
  HeartOutlined,
  SafetyOutlined,
  StarFilled,
  UndoOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { fetchProducts } from '../lib/catalog'
import { useCollections } from '../hooks/useCollections'
import { useTitle } from '../hooks/useTitle'
import ProductGrid, { ProductGridSkeleton } from '../components/ProductGrid'
import ErrorState from '../components/ErrorState'

// Landing-page photography lives in /public/images (CC0 photos from stocksnap.io),
// so the page looks finished even before the Shopify catalogue has products.

const PERKS = [
  { icon: <CarOutlined />, title: 'Free shipping', text: 'On every order over $50' },
  { icon: <UndoOutlined />, title: '30-day returns', text: 'Not in love? Send it back' },
  { icon: <HeartOutlined />, title: 'Cruelty free', text: 'Never tested on animals' },
  { icon: <SafetyOutlined />, title: 'Secure checkout', text: 'Payments handled by Shopify' },
]

// Category tiles. If a Shopify collection with the same handle exists, the tile links to it
// (and uses the collection image when one is set); otherwise it links to the full shop.
const CATEGORIES = [
  { handle: 'skincare', title: 'Skincare', blurb: 'Serums, creams & cleansers', image: '/images/cat-skincare.webp', position: '70% 40%' },
  { handle: 'makeup', title: 'Makeup', blurb: 'Lips, eyes & complexion', image: '/images/cat-makeup.webp', position: '40% 50%' },
  { handle: 'haircare', title: 'Haircare', blurb: 'Oils, masks & treatments', image: '/images/cat-haircare.webp', position: '50% 30%' },
  { handle: 'body-care', title: 'Body Care', blurb: 'Butters, scrubs & mists', image: '/images/cat-bodycare.webp', position: '50% 30%' },
]

const EDIT = [
  { image: '/images/edit-blush.webp', title: 'The soft-focus blush', text: 'A sheer wash of colour for a natural flush.' },
  { image: '/images/edit-serum.webp', title: 'The glow serum', text: 'Vitamin-rich drops for bright, dewy skin.', position: '20% 50%' },
  { image: '/images/edit-brushes.webp', title: 'Pro-grade tools', text: 'Ultra-soft brushes for a flawless finish.' },
]

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
}

function SectionHeader({ eyebrow, title, to, cta, center }) {
  return (
    <div className={`mb-10 flex items-end gap-4 ${center ? 'justify-center text-center' : 'justify-between'}`}>
      <div>
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h2 className="text-4xl font-semibold sm:text-5xl">{title}</h2>
      </div>
      {to && (
        <Link to={to} className="hidden shrink-0 items-center gap-2 text-sm font-medium text-ink hover:text-rosewood sm:flex">
          {cta} <ArrowRightOutlined />
        </Link>
      )}
    </div>
  )
}

function Photo({ src, alt, className = '', position = 'center', eager }) {
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      style={{ objectPosition: position }}
      className={`h-full w-full object-cover ${className}`}
    />
  )
}

export default function Home() {
  useTitle()
  const { message } = App.useApp()
  const { data: collections = [] } = useCollections()
  const best = useQuery({ queryKey: ['products', 'home-best'], queryFn: () => fetchProducts({ sort: 'best', first: 8 }) })
  const fresh = useQuery({ queryKey: ['products', 'home-new'], queryFn: () => fetchProducts({ sort: 'newest', first: 4 }) })
  const hasProducts = (best.data?.products.length ?? 0) > 0

  const categories = CATEGORIES.map((c) => {
    const match = collections.find((col) => col.handle === c.handle)
    return { ...c, to: match ? `/collections/${c.handle}` : '/shop', image: match?.image?.url ?? c.image }
  })

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blush-100 via-cream to-blush-200">
        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-rosewood/10 blur-3xl" />
        <div className="container-page grid items-center gap-12 py-14 md:grid-cols-2 md:py-20 lg:gap-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="eyebrow mb-4">New season · The glow edit</p>
            <h1 className="text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
              Skin that feels <em className="text-rosewood">as good</em> as it looks.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              Clean, cruelty-free skincare and makeup made with ingredients you can pronounce — delivered to your door.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop">
                <Button type="primary" size="large" shape="round" className="!h-12 !px-8">
                  Shop the collection
                </Button>
              </Link>
              <a href="#categories">
                <Button size="large" shape="round" className="!h-12 !bg-transparent !px-8">
                  Explore categories
                </Button>
              </a>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                {['/images/hero-glow.webp', '/images/cat-skincare.webp', '/images/cat-bodycare.webp'].map((src) => (
                  <img key={src} src={src} alt="" className="h-10 w-10 rounded-full border-2 border-cream object-cover" />
                ))}
              </div>
              <div className="text-sm">
                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }, (_, i) => <StarFilled key={i} />)}
                </div>
                <p className="text-muted">Made for every skin type</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative mx-auto w-full max-w-lg"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-2xl shadow-rosewood/20">
              <Photo src="/images/hero-serum.webp" alt="Woman applying a facial serum" position="68% 50%" eager />
            </div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="absolute -bottom-6 -left-4 w-40 overflow-hidden rounded-3xl border-4 border-cream shadow-xl sm:-left-10 sm:w-52"
            >
              <div className="aspect-square">
                <Photo src="/images/hero-glow.webp" alt="Glowing skin" position="30% 40%" eager />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="absolute -right-2 top-8 rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur sm:-right-6"
            >
              <p className="flex items-center gap-2 text-sm font-medium">
                <CheckCircleFilled className="text-emerald-600" /> Dermatologist tested
              </p>
              <p className="text-xs text-muted">Vegan · Paraben free</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Perks */}
      <section className="border-y border-blush-200 bg-white">
        <div className="container-page grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
          {PERKS.map((p) => (
            <div key={p.title} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blush-100 text-lg text-rosewood">{p.icon}</span>
              <div>
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="text-xs text-muted">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="container-page scroll-mt-24 pt-20">
        <SectionHeader eyebrow="Shop by category" title="Find your ritual" to="/shop" cta="Shop all" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {categories.map((c, i) => (
            <motion.div key={c.handle} {...fadeUp} transition={{ delay: i * 0.08, duration: 0.5 }}>
              <Link to={c.to} className="group relative block aspect-[3/4] overflow-hidden rounded-3xl">
                <Photo src={c.image} alt={c.title} position={c.position} className="transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="font-display text-2xl font-semibold sm:text-3xl">{c.title}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-white/80 sm:text-sm">
                    {c.blurb} <ArrowRightOutlined className="transition group-hover:translate-x-1" />
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bestsellers (real Shopify products) — or an editorial "coming soon" edit while the catalogue is empty */}
      <section className="container-page pt-24">
        {best.isPending ? (
          <>
            <SectionHeader eyebrow="Loved by thousands" title="Bestsellers" />
            <ProductGridSkeleton />
          </>
        ) : best.isError ? (
          <ErrorState error={best.error} onRetry={best.refetch} />
        ) : hasProducts ? (
          <>
            <SectionHeader eyebrow="Loved by thousands" title="Bestsellers" to="/shop?sort=best" cta="View all" />
            <ProductGrid products={best.data.products} />
          </>
        ) : (
          <>
            <SectionHeader eyebrow="Coming soon" title="The first edit" center />
            <div className="grid gap-6 md:grid-cols-3">
              {EDIT.map((e, i) => (
                <motion.article key={e.title} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.5 }} className="group">
                  <div className="aspect-[4/5] overflow-hidden rounded-3xl">
                    <Photo src={e.image} alt={e.title} position={e.position} className="transition duration-700 group-hover:scale-105" />
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold">{e.title}</h3>
                  <p className="mt-1 text-sm text-muted">{e.text}</p>
                </motion.article>
              ))}
            </div>
            <div className="mt-10 text-center">
              <a href="#newsletter">
                <Button size="large" shape="round" className="!h-12 !px-8">
                  Notify me at launch
                </Button>
              </a>
            </div>
          </>
        )}
      </section>

      {/* Story banner */}
      <section className="container-page pt-24">
        <motion.div {...fadeUp} transition={{ duration: 0.6 }} className="grid overflow-hidden rounded-[2rem] bg-ink text-white md:grid-cols-2">
          <div className="flex flex-col justify-center p-10 md:p-16">
            <p className="eyebrow mb-4 !text-blush-300">Our promise</p>
            <h2 className="text-4xl font-semibold sm:text-5xl">Beauty without compromise.</h2>
            <p className="mt-5 max-w-md leading-relaxed text-white/70">
              Every formula is dermatologist-tested, vegan-friendly and free from parabens, sulphates and synthetic dyes.
              Just results you can see and feel.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/80">
              {['Clean, skin-loving ingredients', 'Never tested on animals', 'Thoughtfully sourced & packaged'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircleFilled className="text-blush-300" /> {t}
                </li>
              ))}
            </ul>
            <Link to="/shop" className="mt-8">
              <Button size="large" shape="round" className="!h-12 !px-8">Discover the range</Button>
            </Link>
          </div>
          <div className="relative min-h-80">
            <Photo src="/images/story-ritual.webp" alt="Preparing natural skincare ingredients" position="60% 50%" className="absolute inset-0" />
          </div>
        </motion.div>
      </section>

      {/* New arrivals — only once there are products */}
      {hasProducts && fresh.data?.products.length > 0 && (
        <section className="container-page pt-24">
          <SectionHeader eyebrow="Just landed" title="New arrivals" to="/shop?sort=newest" cta="Shop new" />
          <ProductGrid products={fresh.data.products} />
        </section>
      )}

      {/* Newsletter */}
      <section id="newsletter" className="container-page scroll-mt-24 pt-24">
        <div className="relative overflow-hidden rounded-[2rem]">
          <Photo src="/images/newsletter.webp" alt="" className="absolute inset-0" position="50% 40%" />
          <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/90 to-cream/30" />
          <div className="relative max-w-xl px-6 py-16 sm:px-12 md:py-20">
            <p className="eyebrow mb-3">Join the club</p>
            <h2 className="text-4xl font-semibold sm:text-5xl">Get 10% off your first order</h2>
            <p className="mt-3 text-muted">New launches, skincare tips and members-only offers — straight to your inbox.</p>
            <form
              className="mt-6 flex max-w-md gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                e.currentTarget.reset()
                message.success('Thanks for subscribing!')
              }}
            >
              <Input type="email" required size="large" placeholder="Your email address" className="!rounded-full" />
              <Button type="primary" htmlType="submit" size="large" shape="round">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
