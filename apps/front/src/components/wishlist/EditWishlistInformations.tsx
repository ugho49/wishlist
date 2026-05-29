import type { DetailedWishlist } from './wishlist.types'

import { zodResolver } from '@hookform/resolvers/zod'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import { Box, Button, Stack, TextField } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { uploadWishlistLogo } from '../../api/upload'
import { useDeleteWishlistMutation, useRemoveWishlistLogoMutation, useUpdateWishlistMutation } from '../../gql'
import { unwrapResult } from '../../gql/result'
import { useToast } from '../../hooks/useToast'
import { zodRequiredString } from '../../utils/validation'
import { Card } from '../common/Card'
import { ConfirmButton } from '../common/ConfirmButton'
import { Subtitle } from '../common/Subtitle'
import { TextareaMarkdown } from '../common/TextareaMarkdown'
import { WishlistLogoActions } from './WishlistLogoActions'

export type EditWishlistInformationsProps = {
  wishlist: DetailedWishlist
}

const schema = z.object({
  title: zodRequiredString().max(100, '100 caractères maximum'),
  description: z.string().max(2000, '2000 caractères maximum').optional(),
})

type FormFields = z.infer<typeof schema>

export const EditWishlistInformations = ({ wishlist }: EditWishlistInformationsProps) => {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [logoUrl, setLogoUrl] = useState<string | undefined>(wishlist.logoUrl ?? undefined)
  const navigate = useNavigate()
  const invalidateWishlist = () =>
    queryClient.invalidateQueries({ queryKey: ['WishlistPage', { wishlistId: wishlist.id }] })

  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, errors: formErrors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    values: {
      title: wishlist.title || '',
      description: wishlist.description ?? undefined,
    },
  })

  const { mutateAsync: updateWishlistMutation } = useUpdateWishlistMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: res => {
      unwrapResult(res.updateWishlist, 'VoidOutput')
      addToast({ message: 'Liste mis à jour', variant: 'info' })
      void invalidateWishlist()
    },
  })

  const { mutateAsync: uploadLogo, isPending: uploadLogoPending } = useMutation({
    mutationFn: (file: File) => uploadWishlistLogo(wishlist.id, file),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: output => {
      setLogoUrl(output.logo_url)
      addToast({ message: 'Logo mis à jour', variant: 'info' })
      void invalidateWishlist()
    },
  })

  const { mutateAsync: removeLogo, isPending: removeLogoPending } = useRemoveWishlistLogoMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: res => {
      unwrapResult(res.removeWishlistLogo, 'VoidOutput')
      setLogoUrl(undefined)
      addToast({ message: 'Logo supprimé', variant: 'info' })
      void invalidateWishlist()
    },
  })

  const { mutateAsync: deleteWishlistMutation } = useDeleteWishlistMutation()

  const deleteWishlist = async () => {
    try {
      const res = await deleteWishlistMutation({ id: wishlist.id })
      unwrapResult(res.deleteWishlist, 'VoidOutput')
      addToast({ message: 'La liste à bien été supprimée', variant: 'success' })
      void navigate({ to: '/wishlists' })
    } catch {
      addToast({ message: "Une erreur s'est produite", variant: 'error' })
    }
  }

  const loadingLogoUpdate = useMemo(
    () => removeLogoPending || uploadLogoPending,
    [removeLogoPending, uploadLogoPending],
  )

  const onSubmit = (data: FormFields) =>
    updateWishlistMutation({
      id: wishlist.id,
      input: { title: data.title, description: data.description === '' ? undefined : data.description },
    })

  return (
    <Stack gap={3}>
      <Card>
        <Subtitle>Modifier les informations</Subtitle>
        <Stack>
          <Box marginBottom={3}>
            <WishlistLogoActions
              loading={loadingLogoUpdate}
              logoUrl={logoUrl}
              onLogoChange={async file => {
                await uploadLogo(file)
              }}
              onLogoRemove={async () => {
                await removeLogo({ id: wishlist.id })
              }}
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
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <TextareaMarkdown
                    label="Description"
                    autoComplete="off"
                    fullWidth
                    maxLength={2000}
                    placeholder="Une petite description (supporte le markdown) ..."
                    error={!!formErrors.description}
                    helperText={formErrors.description?.message}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
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
      </Card>

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
