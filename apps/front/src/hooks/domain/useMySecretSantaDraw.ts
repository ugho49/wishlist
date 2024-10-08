import { useQuery } from '@tanstack/react-query'

import { useApi } from '../useApi'

export const useMySecretSantaDraw = (eventId?: string) => {
  const api = useApi()

  const { data, isLoading } = useQuery({
    queryKey: ['event.secret-santa.draw', { id: eventId ?? 'undefined' }],
    queryFn: () => {
      if (!eventId) throw new Error('eventId is required')
      return api.secretSanta.getMyDraw(eventId)
    },
  })

  return { mySecretSantaDraw: data, loading: isLoading }
}
