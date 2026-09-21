import type { ReactNode } from 'react';
import type { ReservedItemsListPageQuery } from '../../gql';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
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
  DateTime.fromISO(eventDate).setLocale('fr').toLocaleString(DateTime.DATE_MED);

const Meta = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.spacing(0.75),
  marginTop: theme.spacing(1.5),
}));

const ForWhom = styled('span')(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.8125rem',
}));

const LinkChip = styled('button')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  maxWidth: '100%',
  padding: theme.spacing(0.25, 1),
  border: 'none',
  borderRadius: 999,
  backgroundColor: theme.palette.action.hover,
  color: theme.palette.text.secondary,
  font: 'inherit',
  fontSize: '0.8125rem',
  lineHeight: 1.6,
  cursor: 'pointer',
  '& svg': {
    fontSize: '0.95rem',
  },
  '&:hover, &:focus-visible': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    color: theme.palette.primary.dark,
    outline: 'none',
  },
}));

const ChipLabel = styled('span')({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

type DestinationProps = {
  icon: ReactNode;
  label: string;
  onOpen: () => void;
};

const Destination = ({ icon, label, onOpen }: DestinationProps) => (
  <LinkChip type="button" onClick={onOpen}>
    {icon}
    <ChipLabel>{label}</ChipLabel>
  </LinkChip>
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
      icon={<CalendarMonthIcon fontSize="inherit" />}
      label={`${event.title} · ${formatEventDate(event.eventDate)}`}
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
            <Meta>
              <ForWhom>
                Pour {item.ownerFirstName} {item.ownerLastName}
              </ForWhom>
              <Destination
                icon={<FormatListBulletedIcon fontSize="inherit" />}
                label={item.wishlistTitle}
                onOpen={openWishlist}
              />
              {item.events.map(event => (
                <EventDestination key={event.id} event={event} onClose={onClose} />
              ))}
            </Meta>
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
