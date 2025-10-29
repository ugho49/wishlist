import { useQuery } from '@tanstack/react-query'

import { useApi } from '../useApi'

type Options = {
  enabled: boolean
}

export const useSecretSanta = (eventId: string | undefined, options: Options = { enabled: true }) => {
  const api = useApi()

  const { data, isLoading } = useQuery({
    queryKey: ['secret-santa', { eventId }],
    queryFn: ({ signal }) => {
      if (!eventId) return undefined
      return api.secretSanta.get(eventId, { signal })
    },
    enabled: options.enabled,
  })

  return { secretSanta: data, loading: isLoading }
}
