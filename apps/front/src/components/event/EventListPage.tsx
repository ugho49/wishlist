import AddIcon from '@mui/icons-material/Add'
import { Alert, Box, Grid } from '@mui/material'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { isRejection, rejectionMessage, useEventListPageGetEventsQuery } from '../../gql'
import { FabAutoGrow } from '../common/FabAutoGrow'
import { Pagination } from '../common/Pagination'
import { Title } from '../common/Title'
import { EmptyEventsState } from './EmptyEventsState'
import { EventCard } from './EventCard'
import { EventCardSkeleton } from './EventCardSkeleton'

const SKELETON_KEYS = ['s1', 's2', 's3', 's4'] as const

export const EventListPage = () => {
  const { page: currentPage } = useSearch({ from: '/_authenticated/_with-layout/events/' })
  const navigate = useNavigate()
  const { data, isLoading: loading } = useEventListPageGetEventsQuery(
    { filters: { page: currentPage } },
    { select: d => d.events },
  )
  const pagedEvents = data?.__typename === 'GetEventsPagedResponse' ? data : undefined
  const queryRejection = data && isRejection(data) ? data : undefined

  const events = pagedEvents?.data ?? []
  const totalElements = pagedEvents?.pagination.totalElements ?? 0
  const totalPages = pagedEvents?.pagination.totalPages

  const handleAddEventClick = () => navigate({ to: '/events/new' })

  return (
    <Box>
      {(loading || totalElements > 0) && <Title>Évènements</Title>}

      {queryRejection && <Alert severity="error">{rejectionMessage(queryRejection)}</Alert>}

      {loading && (
        <Grid container spacing={3} aria-busy>
          {SKELETON_KEYS.map(key => (
            <Grid key={key} size={{ xs: 12, lg: 6 }}>
              <EventCardSkeleton />
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && (
        <Grid container spacing={3}>
          {events.map(event => (
            <Grid key={event.id} size={{ xs: 12, lg: 6 }}>
              <EventCard event={event} />
            </Grid>
          ))}
        </Grid>
      )}

      {totalElements > 0 && (
        <>
          <Pagination
            totalPage={totalPages}
            currentPage={currentPage}
            disabled={loading}
            hide={totalPages === 1}
            onChange={value => navigate({ from: '/events', search: prev => ({ ...prev, page: value }) })}
          />

          <FabAutoGrow
            label="Créer un évènement"
            icon={<AddIcon />}
            color="primary"
            onClick={() => handleAddEventClick()}
          />
        </>
      )}

      {totalElements === 0 && !loading && !queryRejection && (
        <EmptyEventsState sx={{ marginTop: '100px' }} onAddEventClick={() => handleAddEventClick()} />
      )}
    </Box>
  )
}
