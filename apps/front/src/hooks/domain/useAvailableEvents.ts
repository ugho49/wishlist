import { useQuery } from '@tanstack/react-query'

import { useApi } from '../useApi'

export const useAvailableEvents = () => {
  const api = useApi()

  const { data, isLoading } = useQuery({
    queryKey: ['events', { limit: 100, only_future: true }],
    queryFn: () => api.event.getAll({ limit: 100, only_future: true }),
  })

  return { events: data?.resources || [], loading: isLoading }
}
