import type { MiniUserDto } from '@wishlist/common'
import type { RootState } from '../../core'

import { zodResolver } from '@hookform/resolvers/zod'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import SaveIcon from '@mui/icons-material/Save'
import { Avatar, Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { type DetailedWishlistDto, FeatureFlags, type UpdateWishlistInputDto } from '@wishlist/common'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
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
import { SearchUserSelect } from '../user/SearchUserSelect'
import { WishlistLogoActions } from './WishlistLogoActions'

const mapState = (state: RootState) => state.auth.user?.id

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
  const currentUserId = useSelector(mapState)
  const isOwner = wishlist.owner.id === currentUserId
  const isPublic = wishlist.config.hide_items === false

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

  const { mutateAsync: addCoOwner } = useMutation({
    mutationKey: ['wishlist.addCoOwner', { id: wishlist.id }],
    mutationFn: (userId: string) => api.wishlist.addCoOwner(wishlist.id, { user_id: userId as import('@wishlist/common').UserId }),
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

  const handleAddCoOwner = async (selected: MiniUserDto | string) => {
    // Only accept user objects, not email strings
    if (typeof selected === 'string') {
      addToast({ message: 'Seuls les utilisateurs existants peuvent être co-gestionnaires', variant: 'warning' })
      return
    }

    try {
      await addCoOwner(selected.id)
    } catch {
      addToast({ message: "Une erreur s'est produite", variant: 'error' })
    }
  }

  const handleRemoveCoOwner = async () => {
    try {
      await removeCoOwner()
    } catch {
      addToast({ message: "Une erreur s'est produite", variant: 'error' })
    }
  }

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

      {/* Co-owner management - Only for public lists and only for the owner */}
      {isPublic && isOwner && (
        <Card>
          <Subtitle>Co-gestionnaire</Subtitle>
          <Stack gap={2}>
            <Typography variant="body2" color="text.secondary">
              Pour les listes publiques, vous pouvez ajouter un co-gestionnaire qui pourra gérer la liste comme vous
              (ajouter/supprimer des items, modifier la liste, etc.).
            </Typography>

            {wishlist.co_owner ? (
              <Stack gap={2}>
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
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<PersonRemoveIcon />}
                    onClick={handleRemoveCoOwner}
                  >
                    Retirer
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <SearchUserSelect
                label="Ajouter un co-gestionnaire"
                onChange={handleAddCoOwner}
                excludedEmails={[wishlist.owner.email]}
              />
            )}
          </Stack>
        </Card>
      )}

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
