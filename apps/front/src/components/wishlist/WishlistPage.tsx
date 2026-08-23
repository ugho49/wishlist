import type { WishlistId } from '@wishlist/common';
import type { RootState } from '../../core/store';

import { Alert, Box, Container, Stack } from '@mui/material';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { FeatureFlags } from '@wishlist/common';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { isRejection, rejectionMessage, useImportableItemsQuery, useWishlistPageQuery } from '../../gql';
import { useFeatureFlag } from '../../hooks/useFeatureFlag';
import { Description } from '../common/Description';
import { ImportItemsDialog } from '../item/ImportItemsDialog';
import { SEO } from '../SEO';
import { WishlistEventsDialog } from './WishlistEventsDialog';
import { WishlistHeader } from './WishlistHeader';
import { WishlistHeaderSkeleton } from './WishlistHeaderSkeleton';
import { WishlistItems } from './WishlistItems';
import { WishlistNotFound } from './WishlistNotFound';

interface WishlistPageProps {
  wishlistId: WishlistId;
}

const mapState = (state: RootState) => state.auth.user?.id;

export const WishlistPage = ({ wishlistId }: WishlistPageProps) => {
  const importItemsEnabled = useFeatureFlag(FeatureFlags.FRONTEND_WISHLIST_IMPORT_ITEMS_ENABLED);
  const { showEventDialog, showImportDialog, sort, filter } = useSearch({
    from: '/_authenticated/_with-layout/wishlists/$wishlistId/',
  });
  const navigate = useNavigate();
  const currentUserId = useSelector(mapState);

  const { data, isLoading: loading } = useWishlistPageQuery({ wishlistId }, { select: d => d.wishlist });
  const wishlist = data?.__typename === 'Wishlist' ? data : undefined;
  const queryRejection = data && isRejection(data) && data.__typename !== 'NotFoundRejection' ? data : undefined;

  const currentUserCanEdit = useMemo(
    () => !!wishlist && (wishlist.owner.id === currentUserId || wishlist.coOwner?.id === currentUserId),
    [wishlist, currentUserId],
  );
  const isPublic = useMemo(() => wishlist?.config.hideItems === false, [wishlist]);

  const { data: importableItems = [] } = useImportableItemsQuery(
    { wishlistId },
    {
      enabled: currentUserCanEdit && !isPublic && importItemsEnabled,
      select: d => (d.importableItems.__typename === 'GetImportableItemsOutput' ? d.importableItems.items : []),
    },
  );

  const setShowEventDialog = useCallback(
    (show: boolean) => {
      void navigate({ from: '/wishlists/$wishlistId/', search: prev => ({ ...prev, showEventDialog: show }) });
    },
    [navigate],
  );

  const setShowImportDialog = useCallback(
    (show: boolean) => {
      void navigate({ from: '/wishlists/$wishlistId/', search: prev => ({ ...prev, showImportDialog: show }) });
    },
    [navigate],
  );

  const setSort = useCallback(
    (newSort: typeof sort) => {
      void navigate({ from: '/wishlists/$wishlistId/', search: prev => ({ ...prev, sort: newSort }) });
    },
    [navigate],
  );

  const setFilter = useCallback(
    (newFilter: typeof filter) => {
      void navigate({ from: '/wishlists/$wishlistId/', search: prev => ({ ...prev, filter: newFilter }) });
    },
    [navigate],
  );

  return (
    <>
      <SEO
        title={wishlist?.title || 'Liste de souhaits'}
        description={`Découvrez la liste de souhaits ${wishlist?.title || ''}.`}
        canonical={`/wishlists/${wishlistId}`}
      />
      <Box>
        {loading && (
          <>
            <WishlistHeaderSkeleton />
            <Container maxWidth="lg">
              <Stack
                sx={{
                  gap: '20px',
                  paddingTop: 3,
                }}
              >
                <WishlistItems loading />
              </Stack>
            </Container>
          </>
        )}

        {!loading && queryRejection && <Alert severity="error">{rejectionMessage(queryRejection)}</Alert>}
        {!loading && !wishlist && !queryRejection && <WishlistNotFound />}

        {!loading && wishlist && (
          <>
            <WishlistHeader
              wishlist={wishlist}
              currentUserCanEdit={currentUserCanEdit}
              isPublic={isPublic}
              hasImportableItems={importableItems.length > 0}
              sort={sort}
              filter={filter}
              onSortChange={setSort}
              onFilterChange={setFilter}
              onOpenEventDialog={() => setShowEventDialog(true)}
              onOpenImportDialog={() => setShowImportDialog(true)}
            />

            <Container maxWidth="lg">
              <Stack
                sx={{
                  gap: '20px',
                  paddingTop: 3,
                }}
              >
                {wishlist.description && <Description text={wishlist.description} />}

                <WishlistItems
                  wishlist={wishlist}
                  hasImportableItems={importableItems.length > 0}
                  onImportItems={() => setShowImportDialog(true)}
                />
              </Stack>
            </Container>

            <WishlistEventsDialog
              open={showEventDialog}
              handleClose={() => setShowEventDialog(false)}
              wishlistId={wishlist.id}
              events={wishlist.events}
              currentUserCanEdit={currentUserCanEdit}
            />

            {currentUserCanEdit && importableItems.length > 0 && (
              <ImportItemsDialog
                open={showImportDialog && importItemsEnabled}
                wishlistId={wishlist.id}
                importableItems={importableItems}
                onClose={() => setShowImportDialog(false)}
                onComplete={() => setShowImportDialog(false)}
              />
            )}
          </>
        )}
      </Box>
    </>
  );
};
