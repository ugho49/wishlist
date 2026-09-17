import type { ReactNode } from 'react';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Alert, Box, ListItemButton, ListItemIcon, ListItemText, styled } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import { environment } from '../../environment';
import {
  isRejection,
  rejectionMessage,
  useAdminDashboardEventsStatsQuery,
  useAdminDashboardUsersStatsQuery,
} from '../../gql';
import { AdminDashboardSkeleton } from './AdminDashboardSkeleton';
import { AdminGrowthChart } from './AdminGrowthChart';
import { AdminPageHeader } from './AdminPageHeader';
import { AdminSection } from './AdminSection';
import { AdminStats } from './AdminStats';

const DashboardGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: '1fr 1fr',
  },
}));

const DomainBody = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  minWidth: 0,
}));

const QueuesCard = styled(Box)(({ theme }) => ({
  gridColumn: '1 / -1',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.grey[200]}`,
  overflow: 'hidden',
}));

const DestinationButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: 0,
  paddingTop: theme.spacing(1.25),
  paddingBottom: theme.spacing(1.25),
}));

const DestinationIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 40,
  color: theme.palette.primary.main,
}));

const ExternalHint = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  color: theme.palette.text.secondary,
}));

type DomainPanelProps = {
  isPending: boolean;
  errorMessage?: string;
  footer: ReactNode;
  children: ReactNode;
};

const DomainPanel = ({ isPending, errorMessage, footer, children }: DomainPanelProps) => {
  let body: ReactNode = children;
  if (isPending) body = <AdminDashboardSkeleton />;
  else if (errorMessage) body = <Alert severity="error">{errorMessage}</Alert>;

  return <AdminSection footer={footer}>{body}</AdminSection>;
};

export const AdminPage = () => {
  const navigate = useNavigate();
  const { data: usersData, isPending: usersPending } = useAdminDashboardUsersStatsQuery(
    {},
    { select: d => d.adminUsersStats },
  );
  const { data: eventsData, isPending: eventsPending } = useAdminDashboardEventsStatsQuery(
    {},
    { select: d => d.adminEventsStats },
  );
  const usersStats = usersData?.__typename === 'AdminUsersStats' ? usersData : undefined;
  const eventsStats = eventsData?.__typename === 'AdminEventsStats' ? eventsData : undefined;
  const usersRejection = usersData && isRejection(usersData) ? usersData : undefined;
  const eventsRejection = eventsData && isRejection(eventsData) ? eventsData : undefined;

  return (
    <>
      <AdminPageHeader title="Administration" />

      <DashboardGrid>
        <DomainPanel
          isPending={usersPending}
          errorMessage={usersRejection ? rejectionMessage(usersRejection) : undefined}
          footer={
            <DestinationButton onClick={() => navigate({ to: '/admin/users' })}>
              <DestinationIcon>
                <GroupsIcon />
              </DestinationIcon>
              <ListItemText primary="Utilisateurs" secondary="Gérer les comptes, sessions et listes" />
            </DestinationButton>
          }
        >
          {usersStats ? (
            <DomainBody>
              <AdminStats
                items={[
                  { label: 'Utilisateurs', value: usersStats.totalCount },
                  { label: 'Actifs', value: usersStats.enabledCount },
                  { label: 'Admins', value: usersStats.adminCount },
                ]}
              />
              <AdminGrowthChart title="Nouveaux utilisateurs" data={usersStats.createdByMonth} />
            </DomainBody>
          ) : null}
        </DomainPanel>

        <DomainPanel
          isPending={eventsPending}
          errorMessage={eventsRejection ? rejectionMessage(eventsRejection) : undefined}
          footer={
            <DestinationButton onClick={() => navigate({ to: '/admin/events' })}>
              <DestinationIcon>
                <CalendarMonthIcon />
              </DestinationIcon>
              <ListItemText primary="Évènements" secondary="Gérer les évènements, participants et secret santa" />
            </DestinationButton>
          }
        >
          {eventsStats ? (
            <DomainBody>
              <AdminStats
                items={[
                  { label: 'Évènements', value: eventsStats.totalCount },
                  { label: 'À venir', value: eventsStats.upcomingCount },
                  { label: 'Passés', value: eventsStats.pastCount },
                ]}
              />
              <AdminGrowthChart title="Nouveaux évènements" data={eventsStats.createdByMonth} />
            </DomainBody>
          ) : null}
        </DomainPanel>

        <QueuesCard>
          <DestinationButton onClick={() => window.open(environment.bullMqDashboardUrl, '_blank', 'noopener')}>
            <DestinationIcon>
              <ManageHistoryIcon />
            </DestinationIcon>
            <ListItemText primary="Queues" secondary="Dashboard BullMQ" />
            <ExternalHint>
              <OpenInNewIcon fontSize="small" />
            </ExternalHint>
          </DestinationButton>
        </QueuesCard>
      </DashboardGrid>
    </>
  );
};
