import type { UserId } from '@wishlist/common'
import type { DetailedWishlist } from './wishlist.types'

import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import { Avatar, Box, Stack, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { match } from 'ts-pattern'

import {
  rejectionMessage,
  rejectionPattern,
  useAddWishlistCoOwnerMutation,
  useRemoveWishlistCoOwnerMutation,
} from '../../gql'
import { useToast } from '../../hooks/useToast'
import { Card } from '../common/Card'
import { ConfirmButton } from '../common/ConfirmButton'
import { Subtitle } from '../common/Subtitle'
import { SearchUserSelect } from '../user/SearchUserSelect'

export type EditWishlistManagementProps = {
  wishlist: DetailedWishlist
}

export const EditWishlistManagement = ({ wishlist }: EditWishlistManagementProps) => {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const invalidateWishlist = () =>
    queryClient.invalidateQueries({ queryKey: ['WishlistPage', { wishlistId: wishlist.id }] })

  const { mutateAsync: addCoOwnerMutation } = useAddWishlistCoOwnerMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
  })
  const addCoOwner = async (userId: UserId) => {
    const res = await addCoOwnerMutation({ id: wishlist.id, input: { userId } })
    match(res.addWishlistCoOwner)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'Co-gestionnaire ajouté avec succès', variant: 'success' })
        void invalidateWishlist()
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive()
  }

  const { mutateAsync: removeCoOwnerMutation } = useRemoveWishlistCoOwnerMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
  })
  const removeCoOwner = async () => {
    const res = await removeCoOwnerMutation({ id: wishlist.id })
    match(res.removeWishlistCoOwner)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'Co-gestionnaire retiré avec succès', variant: 'success' })
        void invalidateWishlist()
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive()
  }

  return (
    <Card>
      <Subtitle>Co-gestionnaire</Subtitle>
      <Stack gap={4}>
        <Typography variant="body2" color="text.secondary">
          Pour les listes publiques, vous pouvez ajouter un co-gestionnaire qui pourra gérer la liste comme vous
          (ajouter/supprimer des items, modifier la liste, etc.).
        </Typography>

        {wishlist.coOwner ? (
          <Stack direction="row" alignItems="center" gap={2}>
            <Avatar src={wishlist.coOwner.pictureUrl ?? undefined} sx={{ width: 40, height: 40 }}>
              {wishlist.coOwner.firstName[0]}
              {wishlist.coOwner.lastName[0]}
            </Avatar>
            <Box flex={1}>
              <Typography variant="body1" fontWeight={500}>
                {wishlist.coOwner.firstName} {wishlist.coOwner.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {wishlist.coOwner.email}
              </Typography>
            </Box>
            <ConfirmButton
              confirmTitle="Retirer le co-gestionnaire ?"
              confirmText={
                <span>
                  Êtes-vous sûr de vouloir retirer le co-gestionnaire{' '}
                  <b>
                    {wishlist.coOwner.firstName} {wishlist.coOwner.lastName}
                  </b>{' '}
                  ?
                </span>
              }
              variant="outlined"
              color="error"
              size="small"
              startIcon={<PersonRemoveIcon />}
              onClick={() => removeCoOwner()}
            >
              Retirer
            </ConfirmButton>
          </Stack>
        ) : (
          <SearchUserSelect
            label="Ajouter un co-gestionnaire"
            onChange={value => {
              if (typeof value !== 'string') void addCoOwner(value.id)
            }}
            excludedEmails={[wishlist.owner.email]}
            acceptNewUsers={false}
          />
        )}
      </Stack>
    </Card>
  )
}
