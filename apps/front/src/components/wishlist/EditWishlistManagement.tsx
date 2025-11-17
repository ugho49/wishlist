import type { DetailedWishlistDto, MiniUserDto, UserId } from '@wishlist/common'

import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import { Avatar, Box, Stack, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { Card } from '../common/Card'
import { ConfirmButton } from '../common/ConfirmButton'
import { Subtitle } from '../common/Subtitle'
import { SearchUserSelect } from '../user/SearchUserSelect'

export type EditWishlistManagementProps = {
  wishlist: DetailedWishlistDto
}

export const EditWishlistManagement = ({ wishlist }: EditWishlistManagementProps) => {
  const api = useApi()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const { mutateAsync: addCoOwner } = useMutation({
    mutationKey: ['wishlist.addCoOwner', { id: wishlist.id }],
    mutationFn: (userId: UserId) => api.wishlist.addCoOwner(wishlist.id, { user_id: userId }),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: () => {
      addToast({ message: 'Co-gestionnaire ajouté avec succès', variant: 'success' })
      void queryClient.invalidateQueries({ queryKey: ['wishlist', { id: wishlist.id }] })
    },
  })

  const { mutateAsync: removeCoOwner } = useMutation({
    mutationKey: ['wishlist.removeCoOwner', { id: wishlist.id }],
    mutationFn: () => api.wishlist.removeCoOwner(wishlist.id),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: () => {
      addToast({ message: 'Co-gestionnaire retiré avec succès', variant: 'success' })
      void queryClient.invalidateQueries({ queryKey: ['wishlist', { id: wishlist.id }] })
    },
  })

  return (
    <Card>
      <Subtitle>Co-gestionnaire</Subtitle>
      <Stack gap={4}>
        <Typography variant="body2" color="text.secondary">
          Pour les listes publiques, vous pouvez ajouter un co-gestionnaire qui pourra gérer la liste comme vous
          (ajouter/supprimer des items, modifier la liste, etc.).
        </Typography>

        {wishlist.co_owner ? (
          <Stack direction="row" alignItems="center" gap={2}>
            <Avatar src={wishlist.co_owner.picture_url} sx={{ width: 40, height: 40 }}>
              {wishlist.co_owner.firstname[0]}
              {wishlist.co_owner.lastname[0]}
            </Avatar>
            <Box flex={1}>
              <Typography variant="body1" fontWeight={500}>
                {wishlist.co_owner.firstname} {wishlist.co_owner.lastname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {wishlist.co_owner.email}
              </Typography>
            </Box>
            <ConfirmButton
              confirmTitle="Retirer le co-gestionnaire ?"
              confirmText={
                <span>
                  Êtes-vous sûr de vouloir retirer le co-gestionnaire{' '}
                  <b>
                    {wishlist.co_owner.firstname} {wishlist.co_owner.lastname}
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
            onChange={value => addCoOwner((value as MiniUserDto).id)}
            excludedEmails={[wishlist.owner.email]}
            acceptNewUsers={false}
          />
        )}
      </Stack>
    </Card>
  )
}
