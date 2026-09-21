import type { ReactNode } from 'react';
import type { ReservedItemsListPageQuery } from '../../gql';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Avatar,
  alpha,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { DateTime } from 'luxon';

type ReservedItem = Extract<
  ReservedItemsListPageQuery['myReservedItems'],
  { __typename: 'GetReservedItemsPagedResponse' }
>['data'][number];

const Picture = styled('img')(({ theme }) => ({
  width: '100%',
  maxHeight: 320,
  objectFit: 'contain',
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.grey[100],
}));

const SectionLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
}));

const ProductLink = styled('a')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  padding: theme.spacing(1, 2),
  borderRadius: 24,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: 600,
  textDecoration: 'none',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const formatTakenAt = (takenAt: string) => DateTime.fromISO(takenAt).setLocale('fr').toFormat("d MMMM yyyy 'à' HH:mm");

const formatEventDate = (eventDate: string) =>
  DateTime.fromISO(eventDate).setLocale('fr').toLocaleString(DateTime.DATE_FULL);

const Context = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const ForWhom = styled('p')(({ theme }) => ({
  margin: 0,
  marginBottom: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  '& strong': {
    color: theme.palette.text.primary,
    fontWeight: 600,
  },
}));

const DestinationButton = styled('button')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  width: '100%',
  padding: theme.spacing(1.25, 1.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 16,
  backgroundColor: theme.palette.background.paper,
  textAlign: 'left',
  cursor: 'pointer',
  font: 'inherit',
  color: 'inherit',
  '&:hover, &:focus-visible': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.06),
    outline: 'none',
  },
}));

const IconBadge = styled('span')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: 12,
  flexShrink: 0,
  backgroundColor: alpha(theme.palette.primary.main, 0.12),
  color: theme.palette.primary.main,
}));

const DestinationText = styled('span')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
});

const DestinationTitle = styled('span')({
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const DestinationSubtitle = styled('span')(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.85rem',
}));

const DestinationChevron = styled(ChevronRightIcon)(({ theme }) => ({
  color: theme.palette.text.secondary,
  flexShrink: 0,
}));

type DestinationProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onOpen: () => void;
};

const Destination = ({ icon, title, subtitle, onOpen }: DestinationProps) => (
  <DestinationButton type="button" onClick={onOpen}>
    <IconBadge>{icon}</IconBadge>
    <DestinationText>
      <DestinationTitle>{title}</DestinationTitle>
      <DestinationSubtitle>{subtitle}</DestinationSubtitle>
    </DestinationText>
    <DestinationChevron />
  </DestinationButton>
);

type EventDestinationProps = {
  event: ReservedItem['events'][number];
  onClose: () => void;
};

const EventDestination = ({ event, onClose }: EventDestinationProps) => {
  const navigate = useNavigate();
  const openEvent = () => {
    onClose();
    void navigate({ to: '/events/$eventId', params: { eventId: event.id } });
  };

  return (
    <Destination
      icon={<CalendarMonthIcon fontSize="small" />}
      title={event.title}
      subtitle={formatEventDate(event.eventDate)}
      onOpen={openEvent}
    />
  );
};

export type ReservedItemDetailsDialogProps = {
  item: ReservedItem | undefined;
  onClose: () => void;
};

export const ReservedItemDetailsDialog = ({ item, onClose }: ReservedItemDetailsDialogProps) => {
  const navigate = useNavigate();
  const openWishlist = () => {
    if (!item) return;
    onClose();
    void navigate({ to: '/wishlists/$wishlistId', params: { wishlistId: item.wishlistId } });
  };

  return (
    <Dialog open={item !== undefined} onClose={onClose} fullWidth maxWidth="sm">
      {item && (
        <>
          <DialogTitle>
            <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
              <span>{item.name}</span>
              <IconButton onClick={onClose} aria-label="Fermer">
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            {item.pictureUrl && <Picture src={item.pictureUrl} alt="" />}
            <Context>
              <ForWhom>
                Pour{' '}
                <strong>
                  {item.ownerFirstName} {item.ownerLastName}
                </strong>
              </ForWhom>
              <Destination
                icon={<FormatListBulletedIcon fontSize="small" />}
                title={item.wishlistTitle}
                subtitle="Liste"
                onOpen={openWishlist}
              />
              {item.events.map(event => (
                <EventDestination key={event.id} event={event} onClose={onClose} />
              ))}
            </Context>
            {item.description && (
              <>
                <SectionLabel>Description</SectionLabel>
                <Typography>{item.description}</Typography>
              </>
            )}
            {item.url && (
              <ProductLink href={item.url} target="_blank" rel="noopener noreferrer">
                Voir le produit
                <OpenInNewIcon fontSize="small" />
              </ProductLink>
            )}
            <SectionLabel>Participants</SectionLabel>
            <List disablePadding>
              {item.takers.map((taker, index) => (
                <ListItem key={taker.userId} disableGutters>
                  <ListItemAvatar>
                    <Avatar src={taker.pictureUrl ?? undefined}>{taker.firstName.toUpperCase().charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${taker.firstName} ${taker.lastName}`}
                    secondary={`${index === 0 ? 'Réservé' : 'Participé'} le ${formatTakenAt(taker.takenAt)}`}
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};
