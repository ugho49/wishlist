import ForestIcon from '@mui/icons-material/Forest'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import PeopleIcon from '@mui/icons-material/People'
import { Box, Container, Tab, Tabs } from '@mui/material'
import { useQueryState } from 'nuqs'

import { useEventById } from '../../hooks'
import { Route } from '../../routes/_authenticated/events.$eventId.edit'
import { Loader } from '../common/Loader'
import { Title } from '../common/Title'
import { EditEventAttendees } from './EditEventAttendees'
import { EditEventInformations } from './EditEventInformations'
import { EditSecretSanta } from './EditSecretSanta'
import { EventNotFound } from './EventNotFound'

enum TabValues {
  informations = 'informations',
  attendees = 'attendees',
  secretSanta = 'secret_santa',
}

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

export const EditEventPage = () => {
  const { eventId } = Route.useParams()
  const [tab, setTab] = useQueryState('tab', { defaultValue: TabValues.informations })
  const { event, loading, currentUserCanEdit } = useEventById(eventId)

  return (
    <Box>
      <Title smallMarginBottom>Modifier l'évènement</Title>
      <Loader loading={loading}>
        {(!event || !currentUserCanEdit) && <EventNotFound />}
        {event && currentUserCanEdit && (
          <Container maxWidth="md">
            <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: '20px' }}>
              <Tabs
                value={tab}
                onChange={(_, newValue) => setTab(newValue)}
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
              {tab === TabValues.secretSanta && <EditSecretSanta eventId={event.id} />}
            </Box>
          </Container>
        )}
      </Loader>
    </Box>
  )
}
