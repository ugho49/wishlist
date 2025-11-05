import type { AttendeeDto, EventId } from '@wishlist/common'

import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import EditIcon from '@mui/icons-material/Edit'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import PeopleIcon from '@mui/icons-material/People'
import {
  Box,
  Button,
  Container,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  styled,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { DateTime } from 'luxon'
import { useCallback, useState } from 'react'

import { TabValues } from '../../routes/_authenticated/_with-layout/events/$eventId/edit'
import { EventIcon } from './EventIcon'

const HeaderContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(3),

  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}))

const LeftSection = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.spacing(3),
  alignItems: 'center',
  flex: 1,
}))

const TitleContainer = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1),
  flex: 1,
  minWidth: 0,
}))

const EventTitle = styled(Box)(({ theme }) => ({
  fontWeight: 400,
  color: theme.palette.primary.main,
  marginTop: 0,
  lineHeight: 1.2,
  wordBreak: 'break-word',
  overflow: 'hidden',

  [theme.breakpoints.down('md')]: {
    fontSize: '1.25rem',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '1.5rem',
  },
}))

const MetadataStack = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.spacing(3),
  flexWrap: 'wrap',
  alignItems: 'flex-start',

  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
}))

const MetadataBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  color: theme.palette.text.secondary,
}))

const ClickableMetadataBox = styled(MetadataBox)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'color 0.2s',
  '&:hover': {
    color: theme.palette.primary.main,
  },
}))

const RightSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
}))

const UpdateButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  height: '40px',
  fontWeight: 500,
  fontSize: '0.875rem',
  padding: theme.spacing(1, 2),
  border: `1px solid ${theme.palette.divider}`,
}))

const CompactIconButton = styled(IconButton)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  height: '40px',
  width: '40px',
}))

const ReponsiveUpdateButton = (props: { eventId: EventId }) => {
  const { eventId } = props
  const isDownMd = useMediaQuery(theme => theme.breakpoints.down('md'))
  const isUpSm = useMediaQuery(theme => theme.breakpoints.up('sm'))
  const navigate = useNavigate()

  const handleNavigateToEdit = useCallback(() => {
    void navigate({ to: '/events/$eventId/edit', params: { eventId } })
  }, [navigate, eventId])

  if (isDownMd && isUpSm) {
    return (
      <Tooltip title="Modifier les informations de l'événement">
        <CompactIconButton size="small" onClick={handleNavigateToEdit}>
          <EditIcon fontSize="small" />
        </CompactIconButton>
      </Tooltip>
    )
  }

  return (
    <UpdateButton variant="outlined" color="primary" startIcon={<EditIcon />} onClick={handleNavigateToEdit}>
      Modifier
    </UpdateButton>
  )
}

export type EventHeaderProps = {
  icon?: string
  title: string
  eventDate: string
  eventId: EventId
  attendees: AttendeeDto[]
  currentUserCanEdit: boolean
  openAttendeesDialog: () => void
}

export const EventHeader = ({
  icon,
  title,
  eventDate,
  eventId,
  attendees,
  currentUserCanEdit,
  openAttendeesDialog,
}: EventHeaderProps) => {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleSecretSanta = () => {
    handleCloseMenu()
    void navigate({ to: '/events/$eventId/edit', params: { eventId }, search: { tab: TabValues.secretSanta } })
  }

  const handleAttendees = () => {
    handleCloseMenu()
    void navigate({ to: '/events/$eventId/edit', params: { eventId }, search: { tab: TabValues.attendees } })
  }

  return (
    <Container maxWidth="lg">
      <HeaderContent>
        {/* Left section - Avatar, Title and Metadata */}
        <LeftSection>
          <EventIcon icon={icon} size="large" />

          <TitleContainer>
            <EventTitle>{title}</EventTitle>

            {/* Metadata */}
            <MetadataStack>
              <MetadataBox>
                <AccessTimeIcon fontSize="small" />
                <Typography variant="body2">
                  {DateTime.fromISO(eventDate).toLocaleString(DateTime.DATE_HUGE)}
                </Typography>
              </MetadataBox>

              <ClickableMetadataBox onClick={() => openAttendeesDialog()}>
                <PeopleIcon fontSize="small" />
                <Typography variant="body2">
                  {attendees.length} {attendees.length > 1 ? 'participants' : 'participant'}
                </Typography>
              </ClickableMetadataBox>
            </MetadataStack>
          </TitleContainer>
        </LeftSection>

        {/* Right section - Action Button with Dropdown */}
        {currentUserCanEdit && (
          <RightSection>
            <ReponsiveUpdateButton eventId={eventId} />

            <Tooltip title="Plus d'options">
              <CompactIconButton size="small" onClick={handleOpenMenu}>
                <KeyboardArrowDownIcon />
              </CompactIconButton>
            </Tooltip>
          </RightSection>
        )}
      </HeaderContent>

      {/* Actions Menu */}
      <Menu
        id="event-actions-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleAttendees}>
          <ListItemIcon>
            <PeopleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Gérer les participants</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleSecretSanta}>
          <ListItemIcon>
            <CardGiftcardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Gérer le Secret Santa</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  )
}
