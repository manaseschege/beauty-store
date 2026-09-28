import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Badge, Button, Drawer, Input } from 'antd'
import { MenuOutlined, SearchOutlined, ShoppingOutlined, CloseOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import { useCart } from '../context/CartContext'
import { useCollections } from '../hooks/useCollections'
import { STORE_NAME } from '../lib/shopify'

export default function Header() {
  const { count, openCart } = useCart()
  const { data: collections = [] } = useCollections()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close overlays on navigation.
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname, location.search])

  const nav = [{ to: '/shop', label: 'Shop all' }, ...collections.slice(0, 4).map((c) => ({ to: `/collections/${c.handle}`, label: c.title }))]

  const search = (value) => {
    const q = value.trim()
    if (q) navigate(`/shop?q=${encodeURIComponent(q)}`)
  }

  const linkClass = ({ isActive }) =>
    clsx('text-sm tracking-wide transition hover:text-rosewood', isActive ? 'text-rosewood' : 'text-ink')

  return (
    <>
      <div className="bg-ink py-2 text-center text-xs tracking-wider text-white/90">
        Free shipping on orders over $50 · 30-day happiness guarantee
      </div>
      <header
        className={clsx(
          'sticky top-0 z-40 border-b transition',
          scrolled ? 'border-blush-200 bg-cream/90 backdrop-blur-md' : 'border-transparent bg-cream',
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2 lg:hidden">
            <Button type="text" icon={<MenuOutlined />} onClick={() => setMenuOpen(true)} aria-label="Open menu" />
          </div>

          <Link to="/" className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {STORE_NAME}
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} className={linkClass}>
                {n.label}
              </NavLink>
            ))}
            <NavLink to="/help" className={linkClass}>
              Help
            </NavLink>
          </nav>

          <div className="flex items-center gap-1">
            <Button type="text" icon={<SearchOutlined />} onClick={() => setSearchOpen((s) => !s)} aria-label="Search" />
            <Badge count={count} size="small" color="#b4536a" offset={[-4, 4]}>
              <Button type="text" icon={<ShoppingOutlined className="text-lg" />} onClick={openCart} aria-label="Open bag" />
            </Badge>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-blush-200 bg-cream">
            <div className="container-page py-3">
              <Input.Search
                autoFocus
                size="large"
                placeholder="Search serums, lipstick, body butter…"
                enterButton
                allowClear
                onSearch={search}
              />
            </div>
          </div>
        )}
      </header>

      <Drawer
        placement="left"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        width={300}
        closeIcon={<CloseOutlined />}
        title={<span className="font-display text-2xl">{STORE_NAME}</span>}
      >
        <nav className="flex flex-col gap-1">
          {[...nav, { to: '/help', label: 'Help & shipping' }].map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                clsx('rounded-lg px-3 py-3 text-base', isActive ? 'bg-blush-100 text-rosewood' : 'text-ink hover:bg-blush-50')
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
      </Drawer>
    </>
  )
}
