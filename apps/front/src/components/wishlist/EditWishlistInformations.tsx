import { zodResolver } from '@hookform/resolvers/zod'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import { Box, Button, Stack, TextField } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { type DetailedWishlistDto, FeatureFlags, type UpdateWishlistInputDto } from '@wishlist/common'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { useApi } from '../../hooks/useApi'
import { useFeatureFlag } from '../../hooks/useFeatureFlag'
import { useToast } from '../../hooks/useToast'
import { zodRequiredString } from '../../utils/validation'
import { Card } from '../common/Card'
import { CharsRemaining } from '../common/CharsRemaining'
import { ConfirmButton } from '../common/ConfirmButton'
import { Subtitle } from '../common/Subtitle'
import { TextareaMarkdown } from '../common/TextareaMarkdown'
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
  const isFeatureFlagMarkdownEnabled = useFeatureFlag(FeatureFlags.FRONTEND_ACTIVATE_DESCRIPTION_MARKDOWN)

  const {
    register,
    control,
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
    onSuccess: () => {
      addToast({ message: 'Liste mis à jour', variant: 'info' })
      void queryClient.invalidateQueries({ queryKey: ['wishlist', { id: wishlist.id }] })
    },
  })

  const { mutateAsync: uploadLogo, isPending: uploadLogoPending } = useMutation({
    mutationKey: ['wishlist.uploadLogo', { id: wishlist.id }],
    mutationFn: (file: File) => api.wishlist.uploadLogo(wishlist.id, file),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: output => {
      setLogoUrl(output.logo_url)
      addToast({ message: 'Logo mis à jour', variant: 'info' })
      void queryClient.invalidateQueries({ queryKey: ['wishlist', { id: wishlist.id }] })
    },
  })

  const { mutateAsync: removeLogo, isPending: removeLogoPending } = useMutation({
    mutationKey: ['wishlist.removeLogo', { id: wishlist.id }],
    mutationFn: () => api.wishlist.removeLogo(wishlist.id),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: () => {
      setLogoUrl(undefined)
      addToast({ message: 'Logo supprimé', variant: 'info' })
      void queryClient.invalidateQueries({ queryKey: ['wishlist', { id: wishlist.id }] })
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
    updateWishlist({ title: data.title, description: data.description === '' ? undefined : data.description })

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
                await removeLogo()
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
                render={({ field, formState: { errors } }) =>
                  isFeatureFlagMarkdownEnabled ? (
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
                  ) : (
                    <TextField
                      label="Description"
                      autoComplete="off"
                      fullWidth
                      multiline
                      minRows={4}
                      value={field.value}
                      slotProps={{ htmlInput: { maxLength: 2000 } }}
                      placeholder="Une petite description ..."
                      helperText={errors.description?.message || <CharsRemaining max={2000} value={field.value} />}
                      onChange={field.onChange}
                    />
                  )
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
