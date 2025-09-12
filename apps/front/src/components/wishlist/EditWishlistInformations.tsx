import type { DetailedWishlistDto, UpdateWishlistInputDto } from '@wishlist/common'

import { zodResolver } from '@hookform/resolvers/zod'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import { Box, Button, Stack, TextField } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { zodRequiredString } from '../../utils/validation'
import { CardV2 } from '../common/CardV2'
import { CharsRemaining } from '../common/CharsRemaining'
import { ConfirmButton } from '../common/ConfirmButton'
import { Subtitle } from '../common/Subtitle'
import { WishlistLogoActions } from './WishlistLogoActions'

export type EditWishlistInformationsProps = {
  wishlist: DetailedWishlistDto
}

const schema = z.object({
  title: zodRequiredString().max(100, '100 caractères maximum'),
  description: z.string().max(2000, '2000 caractères maximum').optional(),
})

type FormFields = z.infer<typeof schema>

export const EditWishlistInformations = ({ wishlist }: EditWishlistInformationsProps) => {
  const api = useApi()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [logoUrl, setLogoUrl] = useState(wishlist.logo_url)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors: formErrors },
    watch,
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    values: {
      title: wishlist.title || '',
      description: wishlist.description,
    },
  })

  const formValues = watch()

  const { mutateAsync: updateWishlist } = useMutation({
    mutationKey: ['wishlist.update', { id: wishlist.id }],
    mutationFn: (data: UpdateWishlistInputDto) => api.wishlist.update(wishlist.id, data),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: (_output, data) => {
      addToast({ message: 'Liste mis à jour', variant: 'info' })

      queryClient.setQueryData(['wishlist', { id: wishlist.id }], (old: DetailedWishlistDto) => ({
        ...old,
        ...data,
      }))
    },
  })

  const { mutateAsync: uploadLogo, isPending: uploadLogoPending } = useMutation({
    mutationKey: ['wishlist.uploadLogo', { id: wishlist.id }],
    mutationFn: (file: File) => api.wishlist.uploadLogo(wishlist.id, file),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: output => {
      setLogoUrl(output.logo_url)
      addToast({ message: 'Logo mis à jour', variant: 'info' })

      queryClient.setQueryData(['wishlist', { id: wishlist.id }], (old: DetailedWishlistDto) => ({
        ...old,
        logo_url: output.logo_url,
      }))
    },
  })

  const { mutateAsync: removeLogo, isPending: removeLogoPending } = useMutation({
    mutationKey: ['wishlist.removeLogo', { id: wishlist.id }],
    mutationFn: () => api.wishlist.removeLogo(wishlist.id),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: () => {
      setLogoUrl(undefined)
      addToast({ message: 'Logo supprimé', variant: 'info' })
      queryClient.setQueryData(['wishlist', { id: wishlist.id }], (old: DetailedWishlistDto) => ({
        ...old,
        logo_url: undefined,
      }))
    },
  })

  const { mutateAsync: handleDelete } = useMutation({
    mutationKey: ['wishlist.delete', { id: wishlist.id }],
    mutationFn: () => api.wishlist.delete(wishlist.id),
  })

  const deleteWishlist = async () => {
    try {
      await handleDelete()
      addToast({ message: 'La liste à bien été supprimée', variant: 'success' })
      navigate('/wishlists')
    } catch {
      addToast({ message: "Une erreur s'est produite", variant: 'error' })
    }
  }

  const loadingLogoUpdate = useMemo(
    () => removeLogoPending || uploadLogoPending,
    [removeLogoPending, uploadLogoPending],
  )

  const onSubmit = (data: FormFields) =>
    updateWishlist({ title: data.title, description: data.description === '' ? undefined : data.description })

  return (
    <Stack gap={3}>
      <CardV2>
        <Subtitle>Modifier les informations</Subtitle>
        <Stack>
          <Box marginBottom={3}>
            <WishlistLogoActions
              loading={loadingLogoUpdate}
              logoUrl={logoUrl}
              onLogoChange={file => uploadLogo(file)}
              onLogoRemove={() => removeLogo()}
            />
          </Box>
          <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap={3}>
            <Box>
              <TextField
                {...register('title')}
                label="Titre"
                autoComplete="off"
                fullWidth
                placeholder="Ma super liste"
                error={!!formErrors.title}
                helperText={formErrors.title?.message}
              />
            </Box>

            <Box>
              <TextField
                {...register('description')}
                label="Description"
                autoComplete="off"
                fullWidth
                multiline
                minRows={4}
                placeholder="Une petite description ..."
                error={!!formErrors.description}
                helperText={
                  formErrors.description?.message || <CharsRemaining max={2000} value={formValues.description || ''} />
                }
              />
            </Box>

            <Stack direction="row" justifyContent="center">
              <Button
                type="submit"
                variant="contained"
                size="medium"
                loading={isSubmitting}
                loadingPosition="start"
                disabled={isSubmitting}
                startIcon={<SaveIcon />}
              >
                Mettre à jour
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </CardV2>

      <Stack alignItems="center">
        <Box>
          <ConfirmButton
            confirmTitle="Supprimer la liste"
            confirmText={
              <span>
                Êtes-vous sûr de vouloir supprimer la liste <b>{wishlist.title}</b> ?
              </span>
            }
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={() => deleteWishlist()}
          >
            Supprimer la liste
          </ConfirmButton>
        </Box>
      </Stack>
    </Stack>
  )
}
