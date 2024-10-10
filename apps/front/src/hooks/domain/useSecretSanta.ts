import { useQuery } from '@tanstack/react-query'

import { useApi } from '../useApi'

export const useSecretSanta = (eventId: string) => {
  const api = useApi()

  const { data, isLoading } = useQuery({
    queryKey: ['secret-santa', { eventId }],
    queryFn: () => api.secretSanta.get(eventId),
  })

  return { secretSanta: data, loading: isLoading }
}
