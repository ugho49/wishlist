import type { DetailedWishlistDto, WishlistId } from '@wishlist/common'
import type { RootState } from '../../core'
import type { WishlistPageQuery } from '../../gql/__generated__/types'

import { Box, Container, Stack } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { FeatureFlags } from '@wishlist/common'
import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { match, P } from 'ts-pattern'

import { useWishlistPageQuery } from '../../gql/__generated__/graphql'
import { useApi } from '../../hooks'
import { useFeatureFlag } from '../../hooks/useFeatureFlag'
import { Description } from '../common/Description'
import { Loader } from '../common/Loader'
import { ImportItemsDialog } from '../item/ImportItemsDialog'
import { SEO } from '../SEO'
import { WishlistEventsDialog } from './WishlistEventsDialog'
import { WishlistHeader } from './WishlistHeader'
import { WishlistItems } from './WishlistItems'
import { WishlistNotFound } from './WishlistNotFound'

type GqlWishlist = Extract<NonNullable<WishlistPageQuery['getWishlistById']>, { __typename?: 'Wishlist' }>

const mapState = (state: RootState) => state.auth.user?.id

function mapGqlToDto(gql: GqlWishlist): DetailedWishlistDto {
  return {
    id: gql.id,
    title: gql.title,
    description: gql.description ?? undefined,
    logo_url: gql.logoUrl ?? undefined,
    owner: {
      id: gql.owner.id,
      firstname: gql.owner.firstName,
      lastname: gql.owner.lastName,
      email: '',
      picture_url: gql.owner.pictureUrl ?? undefined,
    },
    co_owner: gql.coOwner
      ? {
          id: gql.coOwner.id,
          firstname: gql.coOwner.firstName,
          lastname: gql.coOwner.lastName,
          email: '',
          picture_url: gql.coOwner.pictureUrl ?? undefined,
        }
      : undefined,
    events: gql.events.map(event => ({
      id: event.id,
      title: event.title,
      event_date: event.eventDate,
    })),
    items: gql.items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description ?? undefined,
      url: item.url ?? undefined,
      score: item.score ?? undefined,
      is_suggested: item.isSuggested ?? undefined,
      picture_url: item.pictureUrl ?? undefined,
      taken_by: item.takerUser
        ? {
            id: item.takerUser.id,
            firstname: item.takerUser.firstName,
            lastname: item.takerUser.lastName,
            email: '',
            picture_url: item.takerUser.pictureUrl ?? undefined,
          }
        : undefined,
      taken_at: item.takenAt ?? undefined,
      created_at: item.createdAt,
    })),
    config: {
      hide_items: gql.config.hideItems,
    },
    created_at: '',
    updated_at: '',
  }
}

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
  const currentUserId = useSelector(mapState)

  const { data, isLoading } = useWishlistPageQuery({ wishlistId })

  const { wishlist, currentUserCanEdit } = useMemo(() => {
    const result = data?.getWishlistById

    return match(result)
      .with({ __typename: 'NotFoundRejection' }, () => ({ wishlist: undefined, currentUserCanEdit: false }))
      .with({ __typename: 'ForbiddenRejection' }, () => ({ wishlist: undefined, currentUserCanEdit: false }))
      .with({ __typename: 'UnauthorizedRejection' }, () => ({ wishlist: undefined, currentUserCanEdit: false }))
      .with({ __typename: 'InternalErrorRejection' }, () => ({ wishlist: undefined, currentUserCanEdit: false }))
      .with(P.nullish, () => ({ wishlist: undefined, currentUserCanEdit: false }))
      .with({ id: P.string }, gqlWishlist => {
        const mapped = mapGqlToDto(gqlWishlist)
        const canEdit = mapped.owner.id === currentUserId || mapped.co_owner?.id === currentUserId
        return { wishlist: mapped, currentUserCanEdit: canEdit }
      })
      .exhaustive()
  }, [data, currentUserId])

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
      />
      <Box>
        <Loader loading={isLoading}>
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
