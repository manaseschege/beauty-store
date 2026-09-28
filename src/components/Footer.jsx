import { Link } from 'react-router-dom'
import { InstagramOutlined, TikTokOutlined, FacebookOutlined } from '@ant-design/icons'
import { useCollections } from '../hooks/useCollections'
import { STORE_NAME } from '../lib/shopify'

export default function Footer() {
  const { data: collections = [] } = useCollections()
  return (
    <footer className="mt-24 bg-ink text-white/80">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-3xl text-white">{STORE_NAME}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
            Clean, cruelty-free beauty essentials, delivered to your door.
          </p>
          <div className="mt-5 flex gap-4 text-xl">
            <a href="#" aria-label="Instagram" className="hover:text-white"><InstagramOutlined /></a>
            <a href="#" aria-label="TikTok" className="hover:text-white"><TikTokOutlined /></a>
            <a href="#" aria-label="Facebook" className="hover:text-white"><FacebookOutlined /></a>
          </div>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">Shop</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shop" className="hover:text-white">Shop all</Link></li>
            {collections.map((c) => (
              <li key={c.id}><Link to={`/collections/${c.handle}`} className="hover:text-white">{c.title}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">Help</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/help#shipping" className="hover:text-white">Shipping</Link></li>
            <li><Link to="/help#returns" className="hover:text-white">Returns & refunds</Link></li>
            <li><Link to="/help#orders" className="hover:text-white">Track my order</Link></li>
            <li><Link to="/help" className="hover:text-white">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">We accept</p>
          <p className="text-sm text-white/60">
            All major cards, Shop Pay, Apple Pay and Google Pay — processed securely by Shopify.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col justify-between gap-2 py-5 text-xs text-white/50 sm:flex-row">
          <span>© {new Date().getFullYear()} {STORE_NAME}. All rights reserved.</span>
          <span>Secure checkout powered by Shopify</span>
        </div>
      </div>
    </footer>
  )
}
