import type { WishlistId } from '@wishlist/common'

import { Box, Container, Stack } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { FeatureFlags } from '@wishlist/common'
import { useCallback, useMemo } from 'react'

import { useApi, useWishlistById } from '../../hooks'
import { useFeatureFlag } from '../../hooks/useFeatureFlag'
import { Description } from '../common/Description'
import { Loader } from '../common/Loader'
import { ImportItemsDialog } from '../item/ImportItemsDialog'
import { SEO } from '../SEO'
import { WishlistEventsDialog } from './WishlistEventsDialog'
import { WishlistHeader } from './WishlistHeader'
import { WishlistItems } from './WishlistItems'
import { WishlistNotFound } from './WishlistNotFound'

interface WishlistPageProps {
  wishlistId: WishlistId
}

export const WishlistPage = ({ wishlistId }: WishlistPageProps) => {
  const importItemsEnabled = useFeatureFlag(FeatureFlags.FRONTEND_WISHLIST_IMPORT_ITEMS_ENABLED)
  const { showEventDialog, showImportDialog, sort, filter } = useSearch({
    from: '/_authenticated/_with-layout/wishlists/$wishlistId/',
  })
  const navigate = useNavigate()
  const api = useApi()
  const { wishlist, loading, currentUserCanEdit } = useWishlistById(wishlistId)
  const isPublic = useMemo(() => wishlist?.config.hide_items === false, [wishlist])

  const { data: importableItems = [] } = useQuery({
    queryKey: ['item.importable', { wishlistId }],
    queryFn: () => api.item.getImportableItems({ wishlist_id: wishlistId }),
    enabled: currentUserCanEdit && !isPublic && importItemsEnabled,
  })

  const setShowEventDialog = useCallback(
    (show: boolean) => {
      void navigate({ from: '/wishlists/$wishlistId', search: prev => ({ ...prev, showEventDialog: show }) })
    },
    [navigate],
  )

  const setShowImportDialog = useCallback(
    (show: boolean) => {
      void navigate({ from: '/wishlists/$wishlistId', search: prev => ({ ...prev, showImportDialog: show }) })
    },
    [navigate],
  )

  const setSort = useCallback(
    (newSort: typeof sort) => {
      void navigate({ from: '/wishlists/$wishlistId', search: prev => ({ ...prev, sort: newSort }) })
    },
    [navigate],
  )

  const setFilter = useCallback(
    (newFilter: typeof filter) => {
      void navigate({ from: '/wishlists/$wishlistId', search: prev => ({ ...prev, filter: newFilter }) })
    },
    [navigate],
  )

  return (
    <>
      <SEO
        title={wishlist?.title || 'Liste de souhaits'}
        description={`Découvrez la liste de souhaits ${wishlist?.title || ''}.`}
        canonical={`/wishlists/${wishlistId}`}
        noindex
      />
      <Box>
        <Loader loading={loading}>
          {!wishlist && <WishlistNotFound />}

          {wishlist && (
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
                <Stack gap="20px" sx={{ paddingTop: 3 }}>
                  {wishlist.description && <Description text={wishlist.description} allowMarkdown />}

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
        </Loader>
      </Box>
    </>
  )
}
