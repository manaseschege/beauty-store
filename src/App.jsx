import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Alert } from 'antd'
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductPage from './pages/ProductPage'
import Help from './pages/Help'
import NotFound from './pages/NotFound'
import { isDemoMode } from './lib/shopify'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      {isDemoMode && (
        <Alert
          banner
          type="warning"
          message="Demo mode: showing sample products. Add your Shopify Storefront token to .env to load your real store."
        />
      )}
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/collections/:handle" element={<Shop />} />
          <Route path="/products/:handle" element={<ProductPage />} />
          <Route path="/help" element={<Help />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
