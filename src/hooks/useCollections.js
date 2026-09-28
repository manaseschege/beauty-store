import { useQuery } from '@tanstack/react-query'
import { fetchCollections } from '../lib/catalog'

export function useCollections() {
  return useQuery({ queryKey: ['collections'], queryFn: fetchCollections })
}
