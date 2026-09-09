import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { Stack, Typography } from '@mui/material';

export const EmptyNotificationsState = () => (
  <Stack alignItems="center" spacing={1} sx={{ py: 6 }}>
    <NotificationsNoneIcon color="disabled" sx={{ fontSize: 48 }} />
    <Typography variant="h6">Aucune notification</Typography>
    <Typography variant="body2" color="text.secondary" textAlign="center">
      Les réservations, nouveaux invités, Secret Santa et rappels d’événements apparaîtront ici.
    </Typography>
  </Stack>
);
