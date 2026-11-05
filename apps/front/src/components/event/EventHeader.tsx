import type { EventId } from '@wishlist/common';
import type { EventAttendee } from './event.types';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import EditIcon from '@mui/icons-material/Edit';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PeopleIcon from '@mui/icons-material/People';
import {
  Avatar,
  AvatarGroup,
  Button,
  Container,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  styled,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { DateTime } from 'luxon';
import { useState } from 'react';

import { TabValues } from '../../routes/_authenticated/_with-layout/events/$eventId/edit';
import { Description } from '../common/Description';
import { PageBreadcrumbs } from '../common/PageBreadcrumbs';
import {
  MetaChip,
  MetaChipButton,
  PageHero,
  PageHeroAbout,
  PageHeroActions,
  PageHeroMedia,
  PageHeroMeta,
  PageHeroTitle,
} from '../common/PageHero';
import { EventIcon } from './EventIcon';

const SquareIconButton = styled(IconButton)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const EditButton = styled(Button)(({ theme }) => ({
  height: 40,
  borderRadius: 12,
  padding: theme.spacing(0, 2),
  backgroundColor: theme.palette.background.paper,
}));

const AttendeeAvatars = styled(AvatarGroup)(({ theme }) => ({
  '& .MuiAvatar-root': {
    width: 20,
    height: 20,
    fontSize: '0.6rem',
    borderWidth: 1.5,
    borderColor: theme.palette.background.paper,
  },
}));

const getCountdown = (eventDate: string): { label: string; className?: string } => {
  const days = Math.round(DateTime.fromISO(eventDate).startOf('day').diff(DateTime.now().startOf('day'), 'days').days);
  if (days < 0) return { label: 'Terminé' };
  if (days === 0) return { label: "C'est aujourd'hui !", className: 'success' };
  if (days === 1) return { label: 'Demain', className: 'accent' };
  return { label: `Dans ${days} jours`, className: 'accent' };
};

const attendeeInitials = (attendee: EventAttendee) =>
  attendee.user
    ? `${attendee.user.firstName[0] ?? ''}${attendee.user.lastName[0] ?? ''}`.toUpperCase()
    : (attendee.pendingEmail?.[0]?.toUpperCase() ?? '?');

export type EventHeaderProps = {
  icon?: string;
  title: string;
  description?: string;
  eventDate: string;
  eventId: EventId;
  attendees: EventAttendee[];
  currentUserCanEdit: boolean;
  openAttendeesDialog: () => void;
};

export const EventHeader = ({
  icon,
  title,
  description,
  eventDate,
  eventId,
  attendees,
  currentUserCanEdit,
  openAttendeesDialog,
}: EventHeaderProps) => {
  const navigate = useNavigate();
  const isUpSm = useMediaQuery(theme => theme.breakpoints.up('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const countdown = getCountdown(eventDate);

  const goToEdit = (tab?: TabValues) => {
    setAnchorEl(null);
    void navigate({ to: '/events/$eventId/edit', params: { eventId }, search: tab ? { tab } : {} });
  };

  return (
    <Container maxWidth="lg">
      <PageBreadcrumbs items={[{ label: 'Évènements', to: '/events' }, { label: title }]} />

      <PageHero>
        <PageHeroMedia>
          <EventIcon icon={icon} size="large" />
        </PageHeroMedia>

        <PageHeroTitle>{title}</PageHeroTitle>

        <PageHeroMeta>
          <MetaChip>
            <CalendarMonthIcon />
            {DateTime.fromISO(eventDate).toLocaleString(isUpSm ? DateTime.DATE_HUGE : DateTime.DATE_MED)}
          </MetaChip>
          <MetaChip className={countdown.className}>
            <HourglassTopIcon />
            {countdown.label}
          </MetaChip>
          <MetaChipButton type="button" onClick={openAttendeesDialog}>
            {attendees.length > 0 ? (
              <AttendeeAvatars max={4} spacing="small">
                {attendees.map(attendee => (
                  <Avatar key={attendee.id} src={attendee.user?.pictureUrl ?? undefined}>
                    {attendeeInitials(attendee)}
                  </Avatar>
                ))}
              </AttendeeAvatars>
            ) : (
              <PeopleIcon />
            )}
            {attendees.length} {attendees.length > 1 ? 'participants' : 'participant'}
          </MetaChipButton>
        </PageHeroMeta>

        {currentUserCanEdit && (
          <PageHeroActions>
            {isUpSm ? (
              <EditButton variant="outlined" startIcon={<EditIcon />} onClick={() => goToEdit()}>
                Modifier
              </EditButton>
            ) : (
              <Tooltip title="Modifier l'événement">
                <SquareIconButton size="small" color="primary" onClick={() => goToEdit()}>
                  <EditIcon fontSize="small" />
                </SquareIconButton>
              </Tooltip>
            )}
            <Tooltip title="Plus d'options">
              <SquareIconButton
                size="small"
                aria-controls={anchorEl ? 'event-actions-menu' : undefined}
                aria-haspopup="true"
                onClick={e => setAnchorEl(e.currentTarget)}
              >
                <MoreVertIcon fontSize="small" />
              </SquareIconButton>
            </Tooltip>
          </PageHeroActions>
        )}

        {description && (
          <PageHeroAbout>
            <Description text={description} variant="plain" />
          </PageHeroAbout>
        )}
      </PageHero>

      <Menu
        id="event-actions-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => goToEdit(TabValues.attendees)}>
          <ListItemIcon>
            <PeopleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Gérer les participants</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => goToEdit(TabValues.secretSanta)}>
          <ListItemIcon>
            <CardGiftcardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Gérer le Secret Santa</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};
