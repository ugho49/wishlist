import type { EventId } from '@wishlist/common'

import AccessTimeIcon from '@mui/icons-material/AccessTime'
import NumbersIcon from '@mui/icons-material/Numbers'
import ShortTextIcon from '@mui/icons-material/ShortText'
import TitleIcon from '@mui/icons-material/Title'
import { Box, List, ListItem, ListItemIcon, ListItemText, Stack } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useQuery } from '@tanstack/react-query'
import { DateTime } from 'luxon'
import { useParams } from 'react-router-dom'

import { useApi } from '../../../hooks'
import { BreaklineText } from '../../common/BreaklineText'
import { Card } from '../../common/Card'
import { Loader } from '../../common/Loader'
import { Subtitle } from '../../common/Subtitle'
import { Title } from '../../common/Title'
import { AdminListWishlistsForEvent } from '../../wishlist/admin/AdminListWishlistsForEvent'
import { AdminListAttendees } from './AdminListAttendees'

export const AdminEventPage = () => {
  const params = useParams<'eventId'>()
  const eventId = (params.eventId || '') as EventId
  const { admin: api } = useApi()
  const theme = useTheme()
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'))

  const { data: value, isLoading: loadingEvent } = useQuery({
    queryKey: ['admin', 'event', { id: eventId }],
    queryFn: ({ signal }) => api.event.getById(eventId, { signal }),
  })

  return (
    <Loader loading={loadingEvent}>
      <Box>
        <Title smallMarginBottom goBackLink={{ title: 'Retour', to: '/admin?tab=events' }}>
          Editer l'évènement
        </Title>

        <Card>
          <Subtitle>Détails</Subtitle>
          <Stack direction="row" flexWrap="wrap" gap={smallScreen ? 0 : 3}>
            <List dense sx={{ flexGrow: 1 }}>
              <ListItem>
                <ListItemIcon>
                  <TitleIcon />
                </ListItemIcon>
                <ListItemText primary="Titre" secondary={value?.title} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <NumbersIcon />
                </ListItemIcon>
                <ListItemText primary="Nombre de participants" secondary={value?.attendees.length} />
              </ListItem>
            </List>

            <List dense sx={{ flexGrow: 1 }}>
              <ListItem>
                <ListItemIcon>
                  <AccessTimeIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Créé le"
                  secondary={DateTime.fromISO(value?.created_at || '').toLocaleString(
                    DateTime.DATETIME_MED_WITH_SECONDS,
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <NumbersIcon />
                </ListItemIcon>
                <ListItemText primary="Nombre de listes" secondary={value?.wishlists.length} />
              </ListItem>
            </List>
          </Stack>
          {value?.description && (
            <Stack direction="row" flexWrap="wrap" gap={smallScreen ? 0 : 3}>
              <List dense sx={{ flexGrow: 1 }}>
                <ListItem>
                  <ListItemIcon>
                    <ShortTextIcon />
                  </ListItemIcon>
                  <ListItemText primary="Description" secondary={<BreaklineText text={value?.description ?? ''} />} />
                </ListItem>
              </List>
            </Stack>
          )}
        </Card>
        {/* TODO: add secret santa card */}
        <br />
        <Card>
          <Subtitle>Participants</Subtitle>
          <AdminListAttendees attendees={value?.attendees ?? []} />
        </Card>
        <br />
        <Card>
          <Subtitle>Wishlists</Subtitle>
          <AdminListWishlistsForEvent wishlists={value?.wishlists ?? []} />
        </Card>
      </Box>
    </Loader>
  )
}
