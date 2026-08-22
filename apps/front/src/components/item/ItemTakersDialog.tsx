import CloseIcon from '@mui/icons-material/Close';
import RedeemIcon from '@mui/icons-material/Redeem';
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
  Stack,
  styled,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';

export type ItemTakerDetails = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  pictureUrl?: string | null;
  takenAt: string;
};

export type ItemTakersDialogProps = {
  open: boolean;
  handleClose: () => void;
  itemName: string;
  takers: ItemTakerDetails[];
};

const formatTakenAt = (takenAt: string) => DateTime.fromISO(takenAt).setLocale('fr').toFormat("d MMMM yyyy 'à' HH:mm");

const TakerText = styled(ListItemText)({
  minWidth: 0,
  marginTop: 0,
  marginBottom: 0,
  '& .MuiListItemText-primary': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 600,
  },
});

const ItemSubtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
}));

const TakersDialogContent = styled(DialogContent)({
  paddingTop: 0,
});

export const ItemTakersDialog = ({ open, handleClose, itemName, takers }: ItemTakersDialogProps) => {
  const sortedTakers = [...takers].sort(
    (a, b) => DateTime.fromISO(a.takenAt).toMillis() - DateTime.fromISO(b.takenAt).toMillis(),
  );

  return (
    <Dialog onClose={() => handleClose()} open={open} fullWidth maxWidth="xs">
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Stack direction="row" alignItems="center" gap={1} minWidth={0}>
            <RedeemIcon color="primary" />
            <span>Réservations</span>
          </Stack>
          <IconButton onClick={() => handleClose()} aria-label="Fermer">
            <CloseIcon />
          </IconButton>
        </Stack>
        <ItemSubtitle variant="body2" noWrap title={itemName}>
          {itemName}
        </ItemSubtitle>
      </DialogTitle>
      <TakersDialogContent>
        <List disablePadding>
          {sortedTakers.map((taker, index) => {
            const fullName = [taker.firstName, taker.lastName].filter(Boolean).join(' ');
            const verb = index === 0 ? 'Réservé' : 'Participé';

            return (
              <ListItem key={taker.id} disableGutters>
                <ListItemAvatar>
                  <Avatar src={taker.pictureUrl ?? undefined}>
                    {taker.firstName?.toUpperCase()?.charAt(0) ?? '?'}
                  </Avatar>
                </ListItemAvatar>
                <TakerText
                  primary={fullName || 'Utilisateur'}
                  secondary={`${verb} le ${formatTakenAt(taker.takenAt)}`}
                />
              </ListItem>
            );
          })}
        </List>
      </TakersDialogContent>
    </Dialog>
  );
};
