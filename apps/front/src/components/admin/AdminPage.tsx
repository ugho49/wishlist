import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Alert, Box, List, ListItemButton, ListItemIcon, ListItemText, styled } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import { environment } from '../../environment';
import { isRejection, rejectionMessage, useAdminDashboardQuery } from '../../gql';
import { AdminGrowthChart } from './AdminGrowthChart';
import { AdminPageHeader } from './AdminPageHeader';
import { AdminSection } from './AdminSection';
import { AdminStats } from './AdminStats';

const DashboardGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '1fr 1fr',
  },
}));

const DashboardColumn = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  minWidth: 0,
}));

const Destinations = styled(Box)({
  gridColumn: '1 / -1',
});

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
  const { data } = useAdminDashboardQuery();
  const usersStats = data?.adminUsersStats.__typename === 'AdminUsersStats' ? data.adminUsersStats : undefined;
  const eventsStats = data?.adminEventsStats.__typename === 'AdminEventsStats' ? data.adminEventsStats : undefined;
  const usersRejection = data?.adminUsersStats && isRejection(data.adminUsersStats) ? data.adminUsersStats : undefined;
  const eventsRejection =
    data?.adminEventsStats && isRejection(data.adminEventsStats) ? data.adminEventsStats : undefined;
  const dashboardError = usersRejection ?? eventsRejection;

  return (
    <>
      <AdminPageHeader title="Administration" />

      {dashboardError ? <Alert severity="error">{rejectionMessage(dashboardError)}</Alert> : null}

      <DashboardGrid>
        <DashboardColumn>
          {usersStats ? (
            <>
              <AdminStats
                items={[
                  { label: 'Utilisateurs', value: usersStats.totalCount },
                  { label: 'Actifs', value: usersStats.enabledCount },
                  { label: 'Admins', value: usersStats.adminCount },
                ]}
              />
              <AdminGrowthChart title="Nouveaux utilisateurs" data={usersStats.createdByMonth} />
            </>
          ) : null}
        </DashboardColumn>

        <DashboardColumn>
          {eventsStats ? (
            <>
              <AdminStats
                items={[
                  { label: 'Évènements', value: eventsStats.totalCount },
                  { label: 'À venir', value: eventsStats.upcomingCount },
                  { label: 'Passés', value: eventsStats.pastCount },
                ]}
              />
              <AdminGrowthChart title="Nouveaux évènements" data={eventsStats.createdByMonth} />
            </>
          ) : null}
        </DashboardColumn>

        <Destinations>
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
        </Destinations>
      </DashboardGrid>
    </>
  );
};
