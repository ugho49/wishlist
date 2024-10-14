import { useQuery } from '@tanstack/react-query'

import { useApi } from '../useApi'

export const useMySecretSantaDraw = (eventId: string) => {
  const api = useApi()

  const { data, isLoading } = useQuery({
    queryKey: ['secret-santa.draw', { eventId }],
    queryFn: ({ signal }) => api.secretSanta.getMyDraw(eventId, { signal }),
  })

  return { mySecretSantaDraw: data, loading: isLoading }
}
