import type { AttendeeDto } from '@wishlist/common'

import type { RootState } from '../../core'

import AccessTimeIcon from '@mui/icons-material/AccessTime'
import EditIcon from '@mui/icons-material/Edit'
import ForestIcon from '@mui/icons-material/Forest'
import PeopleIcon from '@mui/icons-material/People'
import { Box, Button, Container, Stack, styled, Typography } from '@mui/material'
import { canEditEvent } from '@wishlist/common'
import { DateTime } from 'luxon'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from '@tanstack/react-router'

import { Route } from '../../routes/_authenticated/events.$eventId'

import { useEventById } from '../../hooks'
import { Description } from '../common/Description'
import { Loader } from '../common/Loader'
import { EventAttendeesDialog } from './EventAttendeesDialog'
import { EventIcon } from './EventIcon'
import { EventNotFound } from './EventNotFound'
import { EventWishlists } from './EventWishlists'
import { MySecretSantaDraw } from './MySecretSantaDraw'

const mapState = (state: RootState) => state.auth.user?.id

const CompactButton = styled(Button)(({ theme }) => ({
  borderRadius: '20px',
  fontSize: '0.75rem',
  textTransform: 'none',
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  height: '28px',
  '&:hover': {
    color: 'white',
  },
}))

const HeaderContainer = styled(Container)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  marginTop: theme.spacing(4),
}))

const HeaderStack = styled(Stack)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  gap: theme.spacing(3),
}))

const LeftSection = styled(Box)({
  flex: 1,
  minWidth: 0,
})

const IconTitleContainer = styled(Stack)({
  flexDirection: 'row',
  gap: '16px',
  alignItems: 'flex-start',
})

const IconWrapper = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  marginTop: theme.spacing(0.5),
}))

const TitleContainer = styled(Box)({
  flex: 1,
  minWidth: 0,
})

const EventTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 400,
  color: theme.palette.primary.main,
  marginTop: 0,
  marginBottom: theme.spacing(1),
  lineHeight: 1.2,
  wordBreak: 'break-word',
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    fontSize: '1.5rem',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '1.8rem',
  },
}))

const MetadataStack = styled(Stack)({
  flexDirection: 'row',
  gap: '16px',
  flexWrap: 'wrap',
  alignItems: 'center',
})

const MetadataItem = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.spacing(1),
  alignItems: 'center',
  color: theme.palette.text.secondary,
}))

const ClickableMetadataItem = styled(MetadataItem)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'color 0.2s',
  '&:hover': {
    color: theme.palette.primary.main,
  },
}))

const MetadataText = styled(Typography)({
  fontSize: '0.875rem',
})

const RightSection = styled(Box)({
  flexShrink: 0,
})

const ButtonsStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1.5),
  justifyContent: 'center',
  alignItems: 'stretch',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'row',
  },
  [theme.breakpoints.up('md')]: {
    flexDirection: 'column',
    minWidth: '180px',
  },
}))

type EventHeaderProps = {
  icon?: string
  title: string
  eventDate: string
  eventId: string
  attendees: AttendeeDto[]
  currentUserCanEdit: boolean
  openAttendeesDialog: () => void
}

const EventHeader = ({
  icon,
  title,
  eventDate,
  eventId,
  attendees,
  currentUserCanEdit,
  openAttendeesDialog,
}: EventHeaderProps) => {
  const navigate = useNavigate()

  return (
    <HeaderContainer maxWidth="lg">
      <HeaderStack>
        {/* Left section - Icon and Title */}
        <LeftSection>
          <IconTitleContainer>
            <IconWrapper>
              <EventIcon icon={icon} size="large" />
            </IconWrapper>
            <TitleContainer>
              <EventTitle variant="h4" as="h1">
                {title}
              </EventTitle>

              {/* Metadata */}
              <MetadataStack>
                <MetadataItem>
                  <AccessTimeIcon fontSize="small" />
                  <MetadataText variant="body2">
                    {DateTime.fromISO(eventDate).toLocaleString(DateTime.DATE_HUGE)}
                  </MetadataText>
                </MetadataItem>
                <ClickableMetadataItem onClick={() => openAttendeesDialog()}>
                  <PeopleIcon fontSize="small" />
                  <MetadataText variant="body2">
                    {attendees.length} {attendees.length > 1 ? 'participants' : 'participant'}
                  </MetadataText>
                </ClickableMetadataItem>
              </MetadataStack>
            </TitleContainer>
          </IconTitleContainer>
        </LeftSection>

        {/* Right section - Action Buttons */}
        {currentUserCanEdit && (
          <RightSection>
            <ButtonsStack>
              <CompactButton
                color="success"
                variant="outlined"
                size="small"
                startIcon={<ForestIcon fontSize="small" />}
                onClick={() => navigate(`/events/${eventId}/secret-santa`)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'success.light',
                  },
                }}
              >
                Secret Santa
              </CompactButton>
              <CompactButton
                color="primary"
                variant="outlined"
                size="small"
                startIcon={<EditIcon fontSize="small" />}
                onClick={() => navigate(`/events/${eventId}/edit`)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                }}
              >
                Modifier
              </CompactButton>
            </ButtonsStack>
          </RightSection>
        )}
      </HeaderStack>
    </HeaderContainer>
  )
}

export const EventPage = () => {
  const currentUserId = useSelector(mapState)
  const { eventId } = Route.useParams()
  const [openAttendeesDialog, setOpenAttendeesDialog] = useState(false)
  const { event, loading } = useEventById(eventId)

  const attendees = useMemo(() => event?.attendees || [], [event])
  const currentUserCanEdit = useMemo(() => canEditEvent(attendees, currentUserId ?? ''), [attendees, currentUserId])

  return (
    <Box>
      <Loader loading={loading}>
        {!event && <EventNotFound />}
        {event && (
          <>
            <EventHeader
              icon={event.icon}
              title={event.title}
              eventId={event.id}
              eventDate={event.event_date}
              attendees={attendees}
              currentUserCanEdit={currentUserCanEdit}
              openAttendeesDialog={() => setOpenAttendeesDialog(true)}
            />

            <Container maxWidth="lg">
              <Stack gap={'20px'}>
                <MySecretSantaDraw eventId={event.id} />

                {event.description && <Description text={event.description} />}

                <EventWishlists event={event} />
              </Stack>
            </Container>

            <EventAttendeesDialog
              open={openAttendeesDialog}
              handleClose={() => setOpenAttendeesDialog(false)}
              currentUserCanEdit={currentUserCanEdit}
              eventId={event.id}
              attendees={attendees}
            />
          </>
        )}
      </Loader>
    </Box>
  )
}
