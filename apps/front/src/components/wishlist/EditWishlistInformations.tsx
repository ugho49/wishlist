import { zodResolver } from '@hookform/resolvers/zod'
import SaveIcon from '@mui/icons-material/Save'
import { LoadingButton } from '@mui/lab'
import { Box, Stack, TextField } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DetailedWishlistDto, UpdateWishlistInputDto } from '@wishlist/common-types'
import React, { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { zodRequiredString } from '../../utils/validation'
import { InputLabel } from '../common/InputLabel'
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

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors: formErrors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    values: {
      title: wishlist.title || '',
      description: wishlist.description,
    },
  })

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

  const loadingLogoUpdate = useMemo(
    () => removeLogoPending || uploadLogoPending,
    [removeLogoPending, uploadLogoPending],
  )

  const onSubmit = (data: FormFields) =>
    updateWishlist({ title: data.title, description: data.description === '' ? undefined : data.description })

  return (
    <Stack>
      {!wishlist.config.hide_items && (
        <Box marginBottom={3}>
          <WishlistLogoActions
            loading={loadingLogoUpdate}
            logoUrl={logoUrl}
            onLogoChange={file => uploadLogo(file)}
            onLogoRemove={() => removeLogo()}
          />
        </Box>
      )}
      <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap={3}>
        <Box>
          <InputLabel required>Titre</InputLabel>
          <TextField
            {...register('title')}
            autoComplete="off"
            fullWidth
            placeholder="Ma super liste"
            error={!!formErrors.title}
            helperText={formErrors.title?.message}
          />
        </Box>

        <Box>
          <InputLabel>Description</InputLabel>
          <TextField
            {...register('description')}
            autoComplete="off"
            fullWidth
            multiline
            minRows={4}
            placeholder="Une petite description ..."
            error={!!formErrors.description}
            helperText={formErrors.description?.message}
          />
        </Box>

        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          color="secondary"
          loading={isSubmitting}
          loadingPosition="start"
          disabled={isSubmitting}
          startIcon={<SaveIcon />}
        >
          Mettre à jour
        </LoadingButton>
      </Stack>
    </Stack>
  )
}
