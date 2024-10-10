import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../core'
import { useApi } from '../useApi'

const mapState = (state: RootState) => state.auth.user?.id

export const useWishlistById = (wishlistId: string) => {
  const api = useApi()
  const [currentUserCanEdit, setCurrentUserCanEdit] = useState(true)
  const currentUserId = useSelector(mapState)

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist', { id: wishlistId }],
    queryFn: async () => {
      const wishlist = await api.wishlist.getById(wishlistId)
      setCurrentUserCanEdit(wishlist.owner.id === currentUserId)
      return wishlist
    },
  })

  return { wishlist: data, loading: isLoading, currentUserCanEdit }
}
