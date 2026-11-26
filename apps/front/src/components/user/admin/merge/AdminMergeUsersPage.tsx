import type { UserId } from '@wishlist/common';
import type { MergeSelection } from './merge-selection';

import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { Alert, IconButton, Skeleton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { match } from 'ts-pattern';

import {
  rejectionMessage,
  rejectionPattern,
  useAdminMergeUsersMutation,
  useAdminUserMergePreviewQuery,
} from '../../../../gql';
import { useToast } from '../../../../hooks';
import { AdminPageHeader } from '../../../admin/AdminPageHeader';
import { AdminSection } from '../../../admin/AdminSection';
import { AdminMergeUserSlot } from './AdminMergeUserSlot';
import { AdminMergeUsersForm } from './AdminMergeUsersForm';
import { toMergeUsersInput } from './merge-selection';

const SlotsRow = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'stretch',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

const SwapButton = styled(IconButton)(({ theme }) => ({
  alignSelf: 'center',
  border: `1px solid ${theme.palette.grey[300]}`,
  [theme.breakpoints.down('md')]: {
    transform: 'rotate(90deg)',
  },
}));

type AdminMergeUsersPageProps = {
  sourceUserId?: UserId;
  targetUserId?: UserId;
};

export const AdminMergeUsersPage = ({ sourceUserId, targetUserId }: AdminMergeUsersPageProps) => {
  const navigate = useNavigate({ from: '/admin/users/merge' });
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const bothSelected = sourceUserId !== undefined && targetUserId !== undefined && sourceUserId !== targetUserId;
  const { data: preview, isLoading: loadingPreview } = useAdminUserMergePreviewQuery(
    { sourceUserId: sourceUserId as UserId, targetUserId: targetUserId as UserId },
    { enabled: bothSelected, select: d => d.adminUserMergePreview },
  );
  const { mutateAsync: mergeUsers, isPending: merging } = useAdminMergeUsersMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
  });

  const setUsers = (users: { sourceUserId?: UserId; targetUserId?: UserId }) =>
    void navigate({ search: { sourceId: users.sourceUserId, targetId: users.targetUserId }, replace: true });

  const merge = async (selection: MergeSelection) => {
    if (!sourceUserId || !targetUserId) return;

    const res = await mergeUsers({ input: toMergeUsersInput({ sourceUserId, targetUserId, selection }) });
    match(res.adminMergeUsers)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'Comptes fusionnés', variant: 'success' });
        queryClient.removeQueries({ queryKey: ['AdminUserMergePreview'] });
        queryClient.removeQueries({ queryKey: ['AdminUserDetail', { userId: sourceUserId }] });
        void queryClient.invalidateQueries({ queryKey: ['AdminUserDetail', { userId: targetUserId }] });
        void queryClient.invalidateQueries({ queryKey: ['AdminUsersList'] });
        void queryClient.invalidateQueries({ queryKey: ['AdminUsersStats'] });
        void navigate({ to: '/admin/users/$userId', params: { userId: targetUserId } });
      })
      .with({ __typename: 'BusinessRuleRejection' }, rejection =>
        addToast({ message: `Fusion refusée : ${rejection.message}`, variant: 'error' }),
      )
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  const renderPreview = () => {
    if (!bothSelected) {
      return <Alert severity="info">Choisissez les deux comptes pour préparer la fusion.</Alert>;
    }

    if (loadingPreview) {
      return <Skeleton variant="rounded" height={320} />;
    }

    if (!preview) {
      return null;
    }

    return match(preview)
      .with({ __typename: 'AdminUserMergePreview' }, ({ source, target }) => (
        <AdminMergeUsersForm
          key={`${sourceUserId}:${targetUserId}`}
          source={source}
          target={target}
          merging={merging}
          onMerge={selection => void merge(selection)}
        />
      ))
      .with({ __typename: 'BusinessRuleRejection' }, rejection => <Alert severity="error">{rejection.message}</Alert>)
      .with(rejectionPattern, rejection => <Alert severity="error">{rejectionMessage(rejection)}</Alert>)
      .exhaustive();
  };

  return (
    <>
      <AdminPageHeader
        title="Fusionner deux comptes"
        breadcrumbs={[
          { label: 'Admin', to: '/admin' },
          { label: 'Utilisateurs', to: '/admin/users' },
          { label: 'Fusion' },
        ]}
        meta="Pour une même personne inscrite avec deux emails : le compte fusionné transmet ce que vous cochez au compte conservé, puis il est supprimé."
      />

      <AdminSection>
        <SlotsRow>
          <AdminMergeUserSlot
            title="Compte conservé"
            hint="Il reste après la fusion et récupère la sélection."
            tone="keep"
            userId={targetUserId}
            excludedUserId={sourceUserId}
            disabled={merging}
            onChange={userId => setUsers({ sourceUserId, targetUserId: userId })}
          />
          <Tooltip title="Inverser les comptes">
            <span>
              <SwapButton
                aria-label="Inverser les comptes"
                disabled={merging || (!sourceUserId && !targetUserId)}
                onClick={() => setUsers({ sourceUserId: targetUserId, targetUserId: sourceUserId })}
              >
                <SwapHorizIcon />
              </SwapButton>
            </span>
          </Tooltip>
          <AdminMergeUserSlot
            title="Compte fusionné"
            hint="Supprimé après la fusion, avec tout ce qui n'est pas coché."
            tone="drop"
            userId={sourceUserId}
            excludedUserId={targetUserId}
            disabled={merging}
            onChange={userId => setUsers({ sourceUserId: userId, targetUserId })}
          />
        </SlotsRow>

        {renderPreview()}
      </AdminSection>
    </>
  );
};
