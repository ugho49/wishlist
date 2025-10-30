import type { AttendeeDto, EventId } from '@wishlist/common'

import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import EditIcon from '@mui/icons-material/Edit'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import PeopleIcon from '@mui/icons-material/People'
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  styled,
  Typography,
} from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { DateTime } from 'luxon'
import { useState } from 'react'

import { TabValues } from '../../routes/_authenticated/_with-layout/events/$eventId/edit'
import { EventIcon } from './EventIcon'

const HeaderContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  marginBottom: theme.spacing(4),
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

const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  boxShadow: 'none',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}))

const MainActionButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.875rem',
  padding: theme.spacing(1, 2.5),
  [theme.breakpoints.down('md')]: {
    flex: 1,
  },
}))

const DropdownButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 1),
  minWidth: 'auto',
}))

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
    <HeaderContainer>
      <Container maxWidth="lg">
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

          {/* Right section - Action Button with Dropdown */}
          {currentUserCanEdit && (
            <RightSection>
              <StyledButtonGroup variant="outlined" color="primary" disableElevation>
                <MainActionButton
                  startIcon={<EditIcon />}
                  onClick={() => navigate({ to: '/events/$eventId/edit', params: { eventId } })}
                >
                  Modifier
                </MainActionButton>
                <DropdownButton size="small" onClick={handleOpenMenu}>
                  <KeyboardArrowDownIcon />
                </DropdownButton>
              </StyledButtonGroup>

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
            </RightSection>
          )}
        </HeaderStack>
      </Container>
    </HeaderContainer>
  )
}
