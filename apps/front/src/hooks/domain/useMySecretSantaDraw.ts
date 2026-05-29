import type { EventId } from '@wishlist/common'

import { useGetMySecretSantaDrawQuery } from '../../gql'
import { unwrapResult } from '../../gql/result'

export const useMySecretSantaDraw = (eventId: EventId) => {
  const { data, isLoading } = useGetMySecretSantaDrawQuery(
    { eventId },
    {
      // The `mySecretSantaDraw` field is nullable: it resolves to null when the
      // current user has no draw (e.g. draw not started), exposed as `undefined`.
      select: d => (d.mySecretSantaDraw ? unwrapResult(d.mySecretSantaDraw, 'EventAttendee') : undefined),
    },
  )

  return { mySecretSantaDraw: data, loading: isLoading }
}
