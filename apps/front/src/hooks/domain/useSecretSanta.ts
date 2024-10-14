import { useQuery } from '@tanstack/react-query'

import { useApi } from '../useApi'

export const useSecretSanta = (eventId: string) => {
  const api = useApi()

  const { data, isLoading } = useQuery({
    queryKey: ['secret-santa', { eventId }],
    queryFn: ({ signal }) => api.secretSanta.get(eventId, { signal }),
  })

  return { secretSanta: data, loading: isLoading }
}
