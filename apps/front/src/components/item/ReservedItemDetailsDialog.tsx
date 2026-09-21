import type { ReservedItemsListPageQuery } from '../../gql';

import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Avatar,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Rating,
  Stack,
  styled,
  Typography,
} from '@mui/material';
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

export type ReservedItemDetailsDialogProps = {
  item: ReservedItem | undefined;
  onClose: () => void;
};

export const ReservedItemDetailsDialog = ({ item, onClose }: ReservedItemDetailsDialogProps) => {
  const events = item?.events.map(event => event.title).join(', ');

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
            {item.score != null && item.score > 0 && <Rating value={item.score} readOnly size="small" />}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Pour {item.ownerFirstName} {item.ownerLastName} · {item.wishlistTitle}
              {events ? ` · ${events}` : ''}
            </Typography>
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
