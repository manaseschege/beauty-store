import { useEffect } from 'react'
import { STORE_NAME } from '../lib/shopify'

export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${STORE_NAME}` : STORE_NAME
  }, [title])
}
