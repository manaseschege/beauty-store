import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StyleProvider } from '@ant-design/cssinjs'
import { App as AntApp, ConfigProvider } from 'antd'
import { CartProvider } from './context/CartContext'
import { theme } from './theme'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false, retry: 1 } },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StyleProvider layer>
      <ConfigProvider theme={theme}>
        <AntApp>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <CartProvider>
                <App />
              </CartProvider>
            </BrowserRouter>
          </QueryClientProvider>
        </AntApp>
      </ConfigProvider>
    </StyleProvider>
  </StrictMode>,
)
