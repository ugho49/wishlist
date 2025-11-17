import type { EventId } from '@wishlist/common'

import { useQuery } from '@tanstack/react-query'

import { useApi } from '../useApi'

export const useMySecretSantaDraw = (eventId: EventId) => {
  const api = useApi()

  const { data, isLoading } = useQuery({
    queryKey: ['secret-santa.draw', { eventId }],
    queryFn: ({ signal }) => api.secretSanta.getMyDraw(eventId, { signal }),
  })

  return { mySecretSantaDraw: data, loading: isLoading }
}
