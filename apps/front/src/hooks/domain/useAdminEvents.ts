import type { UserId } from '@wishlist/common'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { useApi } from '../useApi'

interface UseAdminEventsProps {
  userId?: UserId
  page?: number
}

export const useAdminEvents = ({ userId, page = 1 }: UseAdminEventsProps) => {
  const { admin: api } = useApi()
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(0)

  const { data: value, isLoading } = useQuery({
    queryKey: ['admin', 'events', { page, userId }],
    queryFn: ({ signal }) => api.event.getAll({ user_id: userId, p: page }, { signal }),
  })

  useEffect(() => {
    if (value) {
      setTotalElements(value.pagination.total_elements)
      setPageSize(value.pagination.pages_size)
    }
  }, [value])

  return {
    events: value?.resources || [],
    totalElements,
    pageSize,
    loading: isLoading,
  }
}
