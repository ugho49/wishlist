import type { WishlistId } from '@wishlist/common';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ListIcon from '@mui/icons-material/List';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Alert, Avatar, Button, Chip, Tab } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import {
  isRejection,
  rejectionMessage,
  rejectionPattern,
  useAdminDeleteWishlistMutation,
  useAdminWishlistGetWishlistQuery,
} from '../../../gql';
import { useToast } from '../../../hooks';
import { AdminPageHeader } from '../../admin/AdminPageHeader';
import { AdminSection } from '../../admin/AdminSection';
import { AdminTabs } from '../../admin/AdminTabs';
import { ConfirmButton } from '../../common/ConfirmButton';
import { Loader } from '../../common/Loader';
import { AdminUserTab } from '../../user/admin/AdminUserPage';
import { WISHLIST_MODE_LABELS } from '../wishlist-mode';
import { AdminListEventsForWishlist } from './AdminListEventsForWishlist';
import { AdminListItemsForWishlist } from './AdminListItemsForWishlist';
import { AdminWishlistInformations } from './AdminWishlistInformations';

export enum AdminWishlistTab {
  info = 'info',
  items = 'items',
  events = 'events',
}

const HeaderWishlistAvatar = styled(Avatar)(({ theme }) => ({
  width: 88,
  height: 88,
  backgroundColor: theme.palette.primary.main,
  flexShrink: 0,
}));

type AdminWishlistPageProps = {
  wishlistId: WishlistId;
};

export const AdminWishlistPage = ({ wishlistId }: AdminWishlistPageProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { tab } = useSearch({ from: '/_authenticated/_with-layout/admin/wishlists/$wishlistId' });
  const navigate = useNavigate({ from: '/admin/wishlists/$wishlistId' });

  const { data, isLoading: loadingWishlist } = useAdminWishlistGetWishlistQuery(
    { id: wishlistId },
    { select: d => d.adminWishlist },
  );
  const wishlist = data?.__typename === 'Wishlist' ? data : undefined;
  const queryRejection = data && isRejection(data) ? data : undefined;

  const invalidateWishlist = () =>
    queryClient.invalidateQueries({ queryKey: ['AdminWishlistGetWishlist', { id: wishlistId }] });

  const { mutateAsync: deleteWishlistMutation, isPending: loadingDelete } = useAdminDeleteWishlistMutation({
    onError: () => addToast({ message: 'Impossible de supprimer la liste', variant: 'error' }),
  });

  const deleteWishlist = async () => {
    const res = await deleteWishlistMutation({ id: wishlistId });
    match(res.adminDeleteWishlist)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'Liste supprimée avec succès', variant: 'success' });
        void queryClient.invalidateQueries({ queryKey: ['AdminListWishlistsForUser'] });
        void queryClient.invalidateQueries({ queryKey: ['AdminEventGetEvent'] });
        if (wishlist) {
          void navigate({
            to: '/admin/users/$userId',
            params: { userId: wishlist.owner.id },
            search: { tab: AdminUserTab.wishlists },
            replace: true,
          });
        } else {
          void navigate({ to: '/admin', replace: true });
        }
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  const wishlistTitle = wishlist?.title ?? 'Liste';
  const ownerName = wishlist ? `${wishlist.owner.firstName} ${wishlist.owner.lastName}` : '';
  const createdAtLabel = wishlist?.createdAt
    ? DateTime.fromISO(wishlist.createdAt).toLocaleString(DateTime.DATETIME_MED)
    : undefined;

  const wishlistTabs = [
    { value: AdminWishlistTab.info, label: 'Infos', icon: <InfoOutlinedIcon /> },
    { value: AdminWishlistTab.items, label: `Souhaits (${wishlist?.items.length ?? 0})`, icon: <CardGiftcardIcon /> },
    {
      value: AdminWishlistTab.events,
      label: `Évènements (${wishlist?.events.length ?? 0})`,
      icon: <CalendarMonthIcon />,
    },
  ];

  return (
    <Loader loading={loadingWishlist}>
      <AdminPageHeader
        title={wishlistTitle}
        breadcrumbs={[
          { label: 'Admin', to: '/admin' },
          { label: 'Utilisateurs', to: '/admin/users' },
          ...(wishlist
            ? [
                {
                  label: ownerName,
                  to: '/admin/users/$userId' as const,
                  params: { userId: wishlist.owner.id },
                  search: { tab: AdminUserTab.wishlists },
                },
              ]
            : []),
          { label: wishlistTitle },
        ]}
        avatar={
          <HeaderWishlistAvatar src={wishlist?.logoUrl ?? undefined}>
            <ListIcon fontSize="large" />
          </HeaderWishlistAvatar>
        }
        chips={wishlist ? <Chip size="small" label={WISHLIST_MODE_LABELS[wishlist.mode]} /> : null}
        meta={[ownerName ? `de ${ownerName}` : null, createdAtLabel ? `créée le ${createdAtLabel}` : null]
          .filter(Boolean)
          .join(' · ')}
        actions={
          wishlist ? (
            <>
              <Button
                variant="outlined"
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={() => void navigate({ to: '/wishlists/$wishlistId', params: { wishlistId } })}
              >
                Voir la liste
              </Button>
              <ConfirmButton
                confirmTitle="Supprimer la liste"
                confirmText="Êtes-vous sûr de vouloir supprimer cette liste ? Tous ses souhaits et leurs réservations seront supprimés."
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                loading={loadingDelete}
                disabled={loadingDelete}
                onClick={() => void deleteWishlist()}
              >
                Supprimer
              </ConfirmButton>
            </>
          ) : undefined
        }
      />

      {queryRejection && <Alert severity="error">{rejectionMessage(queryRejection)}</Alert>}

      {wishlist && (
        <>
          <AdminTabs
            value={tab}
            onChange={(_, newValue) =>
              void navigate({ search: prev => ({ ...prev, tab: newValue as AdminWishlistTab }), replace: true })
            }
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            {wishlistTabs.map(tabItem => (
              <Tab
                key={tabItem.value}
                value={tabItem.value}
                label={smallScreen ? undefined : tabItem.label}
                iconPosition="start"
                icon={tabItem.icon}
              />
            ))}
          </AdminTabs>

          {tab === AdminWishlistTab.info && (
            <AdminWishlistInformations wishlist={wishlist} onChanged={() => void invalidateWishlist()} />
          )}

          {tab === AdminWishlistTab.items && (
            <AdminSection>
              <AdminListItemsForWishlist items={wishlist.items} />
            </AdminSection>
          )}

          {tab === AdminWishlistTab.events && (
            <AdminSection>
              <AdminListEventsForWishlist events={wishlist.events} />
            </AdminSection>
          )}
        </>
      )}
    </Loader>
  );
};
