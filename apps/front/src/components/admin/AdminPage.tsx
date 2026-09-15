import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { List, ListItemButton, ListItemIcon, ListItemText, styled } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import { environment } from '../../environment';
import { AdminPageHeader } from './AdminPageHeader';
import { AdminSection } from './AdminSection';

const DestinationList = styled(List)(() => ({
  padding: 0,
}));

const DestinationButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  '& + &': {
    marginTop: theme.spacing(0.5),
  },
}));

const DestinationIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 40,
  color: theme.palette.primary.main,
}));

const ExternalHint = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  color: theme.palette.text.secondary,
}));

export const AdminPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <AdminPageHeader title="Administration" breadcrumbs={[{ label: 'Admin' }]} />

      <AdminSection>
        <DestinationList>
          <DestinationButton onClick={() => navigate({ to: '/admin/users' })}>
            <DestinationIcon>
              <GroupsIcon />
            </DestinationIcon>
            <ListItemText primary="Utilisateurs" secondary="Gérer les comptes, sessions et listes" />
          </DestinationButton>
          <DestinationButton onClick={() => navigate({ to: '/admin/events' })}>
            <DestinationIcon>
              <CalendarMonthIcon />
            </DestinationIcon>
            <ListItemText primary="Évènements" secondary="Gérer les évènements, participants et secret santa" />
          </DestinationButton>
          <DestinationButton onClick={() => window.open(environment.bullMqDashboardUrl, '_blank', 'noopener')}>
            <DestinationIcon>
              <ManageHistoryIcon />
            </DestinationIcon>
            <ListItemText primary="Queues" secondary="Dashboard BullMQ" />
            <ExternalHint>
              <OpenInNewIcon fontSize="small" />
            </ExternalHint>
          </DestinationButton>
        </DestinationList>
      </AdminSection>
    </>
  );
};
