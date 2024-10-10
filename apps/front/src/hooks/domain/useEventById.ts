import { useQuery } from '@tanstack/react-query'
import { canEditEvent } from '@wishlist/common-types'
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../core'
import { useApi } from '../useApi'

const mapState = (state: RootState) => state.auth.user?.id

export const useEventById = (eventId?: string) => {
  const api = useApi()
  const [currentUserCanEdit, setCurrentUserCanEdit] = useState(true)
  const currentUserId = useSelector(mapState)

  const { data, isLoading } = useQuery({
    queryKey: ['event', { id: eventId ?? 'undefined' }],
    queryFn: async () => {
      if (!eventId) throw new Error('eventId is required')
      const event = await api.event.getById(eventId)
      const canEdit = canEditEvent(event.attendees, currentUserId || '')
      setCurrentUserCanEdit(canEdit)
      return event
    },
  })

  return { event: data, loading: isLoading, currentUserCanEdit }
}
