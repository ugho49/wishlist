import type { EventId } from '@wishlist/common'

import ForestIcon from '@mui/icons-material/Forest'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import PeopleIcon from '@mui/icons-material/People'
import { Box, Container, Tab, Tabs } from '@mui/material'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Loader } from '@wishlist/front-components/common/Loader'
import { Title } from '@wishlist/front-components/common/Title'
import { EditEventAttendees } from '@wishlist/front-components/event/EditEventAttendees'
import { EditEventInformations } from '@wishlist/front-components/event/EditEventInformations'
import { EditSecretSanta } from '@wishlist/front-components/event/EditSecretSanta'
import { EventNotFound } from '@wishlist/front-components/event/EventNotFound'
import { SEO } from '@wishlist/front-components/SEO'
import { useEventById } from '@wishlist/front-hooks'
import z from 'zod'

export enum TabValues {
  informations = 'informations',
  attendees = 'attendees',
  secretSanta = 'secret_santa',
}

export const Route = createFileRoute('/_authenticated/_with-layout/events/$eventId/edit')({
  validateSearch: z.object({
    tab: z.enum(TabValues).optional().catch(TabValues.informations).default(TabValues.informations),
  }),
  params: {
    parse: params => ({ eventId: params.eventId as EventId }),
  },
  component: RouteComponent,
})

const tabs = [
  {
    value: TabValues.informations,
    label: 'Informations',
    icon: <InfoOutlinedIcon />,
  },
  {
    value: TabValues.attendees,
    label: 'Participants',
    icon: <PeopleIcon />,
  },
  {
    value: TabValues.secretSanta,
    label: 'Secret Santa',
    icon: <ForestIcon />,
  },
]

function RouteComponent() {
  const { eventId } = Route.useParams()
  const { tab } = Route.useSearch()
  const { event, loading, currentUserCanEdit } = useEventById(eventId)
  const navigate = useNavigate({ from: '/events/$eventId/edit' })

  const handleTabChange = (newValue: TabValues) => {
    void navigate({ search: { tab: newValue } })
  }

  return (
    <>
      <SEO
        title={`Modifier l'évènement ${event?.title || ''}`}
        description={`Modifier l'événement ${event?.title || ''}.`}
        canonical={`/events/${eventId}/edit`}
      />
      <Box>
        <Title>Modifier l'évènement</Title>
        <Loader loading={loading}>
          {(!event || !currentUserCanEdit) && <EventNotFound />}
          {event && currentUserCanEdit && (
            <Container maxWidth="md">
              <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: '20px' }}>
                <Tabs
                  value={tab}
                  onChange={(_, newValue) => handleTabChange(newValue as TabValues)}
                  variant="fullWidth"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                >
                  {tabs.map(tab => (
                    <Tab key={tab.value} value={tab.value} label={tab.label} iconPosition="start" icon={tab.icon} />
                  ))}
                </Tabs>
              </Box>
              <Box>
                {tab === TabValues.informations && <EditEventInformations event={event} />}
                {tab === TabValues.attendees && <EditEventAttendees eventId={event.id} attendees={event.attendees} />}
                {tab === TabValues.secretSanta && <EditSecretSanta event={event} />}
              </Box>
            </Container>
          )}
        </Loader>
      </Box>
    </>
  )
}
