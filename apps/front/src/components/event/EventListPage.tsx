import AddIcon from '@mui/icons-material/Add'
import { Box, Grid } from '@mui/material'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { useEventListPageGetEventsQuery } from '../../gql'
import { unwrapResult } from '../../gql/result'
import { FabAutoGrow } from '../common/FabAutoGrow'
import { Loader } from '../common/Loader'
import { Pagination } from '../common/Pagination'
import { Title } from '../common/Title'
import { EmptyEventsState } from './EmptyEventsState'
import { EventCard } from './EventCard'

export const EventListPage = () => {
  const { page: currentPage } = useSearch({ from: '/_authenticated/_with-layout/events/' })
  const navigate = useNavigate()
  const { data, isLoading: loading } = useEventListPageGetEventsQuery(
    { filters: { page: currentPage } },
    { select: d => unwrapResult(d.events, 'GetEventsPagedResponse') },
  )

  const events = data?.data ?? []
  const totalElements = data?.pagination.totalElements ?? 0
  const totalPages = data?.pagination.totalPages

  const handleAddEventClick = () => navigate({ to: '/events/new' })

  return (
    <Box>
      {totalElements > 0 && <Title>Évènements</Title>}

      <Loader loading={loading}>
        <Grid container spacing={3}>
          {events.map(event => (
            <Grid key={event.id} size={{ xs: 12, lg: 6 }}>
              <EventCard event={event} />
            </Grid>
          ))}
        </Grid>
      </Loader>

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

      {totalElements === 0 && !loading && (
        <EmptyEventsState sx={{ marginTop: '100px' }} onAddEventClick={() => handleAddEventClick()} />
      )}
    </Box>
  )
}
