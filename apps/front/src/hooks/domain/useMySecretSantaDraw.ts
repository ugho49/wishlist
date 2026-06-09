import type { EventId } from '@wishlist/common'

import { useEffect } from 'react'

import { isRejection, rejectionMessage, useGetMySecretSantaDrawQuery } from '../../gql'
import { useToast } from '../useToast'

export const useMySecretSantaDraw = (eventId: EventId) => {
  const { addToast } = useToast()
  const { data, isLoading } = useGetMySecretSantaDrawQuery(
    { eventId },
    {
      // The `mySecretSantaDraw` field is nullable: it resolves to null when the
      // current user has no draw (e.g. draw not started), a normal state
      // exposed as `undefined`.
      select: d => d.mySecretSantaDraw ?? undefined,
    },
  )

  const rejection = data && isRejection(data) ? data : undefined
  const mySecretSantaDraw = data && !isRejection(data) ? data : undefined

  useEffect(() => {
    if (rejection) {
      addToast({ message: rejectionMessage(rejection), variant: 'error' })
    }
  }, [rejection, addToast])

  return { mySecretSantaDraw, rejection, loading: isLoading }
}
