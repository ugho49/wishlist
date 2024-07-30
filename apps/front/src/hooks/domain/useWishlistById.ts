import { useQuery } from '@tanstack/react-query'

import { useApi } from '../useApi'

export const useWishlistById = (wishlistId: string) => {
  const api = useApi()

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist', { id: wishlistId }],
    queryFn: () => api.wishlist.getById(wishlistId),
  })

  return { wishlist: data, loading: isLoading }
}
