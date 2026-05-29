import type { EventId } from '@wishlist/common'

import { useGetSecretSantaForEventQuery } from '../../gql'
import { unwrapResult } from '../../gql/result'

type Options = {
  enabled: boolean
}

export const useSecretSanta = (eventId: EventId | undefined, options: Options = { enabled: true }) => {
  const { data, isLoading } = useGetSecretSantaForEventQuery(
    { eventId: eventId as EventId },
    {
      enabled: options.enabled && !!eventId,
      // The `secretSanta` field is nullable: it resolves to null when no secret
      // santa exists for the event, in which case we expose `undefined`.
      select: d => (d.secretSanta ? unwrapResult(d.secretSanta, 'SecretSanta') : undefined),
    },
  )

  return { secretSanta: data, loading: isLoading }
}
