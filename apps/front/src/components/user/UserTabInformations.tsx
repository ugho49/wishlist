import { zodResolver } from '@hookform/resolvers/zod'
import SaveIcon from '@mui/icons-material/Save'
import { LoadingButton } from '@mui/lab'
import { Box, Stack, TextField } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { MobileDatePicker } from '@mui/x-date-pickers'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UpdateUserProfileInputDto, UserDto } from '@wishlist/common-types'
import { DateTime } from 'luxon'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { z } from 'zod'

import { RootState } from '../../core'
import { updatePicture as updatePictureAction, updateUser as updateUserAction } from '../../core/store/features'
import { useFetchUserInfo } from '../../hooks/domain/useFetchUserInfo'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { zodRequiredString } from '../../utils/validation'
import { InputLabel } from '../common/InputLabel'
import { Loader } from '../common/Loader'
import { AvatarUpdateButton } from './AvatarUpdateButton'

const mapState = (state: RootState) => state.userProfile.pictureUrl

const schema = z.object({
  firstname: zodRequiredString().max(50, '50 caractères maximum'),
  lastname: zodRequiredString().max(50, '50 caractères maximum'),
  birthday: z.custom<DateTime>().nullable(),
})

type FormFields = z.infer<typeof schema>

export const UserTabInformations = () => {
  const pictureUrl = useSelector(mapState)
  const theme = useTheme()
  const dispatch = useDispatch()
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'))
  const api = useApi()
  const { addToast } = useToast()
  const { user, loading: loadingUser } = useFetchUserInfo()
  const queryClient = useQueryClient()

  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, errors: formErrors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    values: {
      firstname: user?.firstname || '',
      lastname: user?.lastname || '',
      birthday: user?.birthday ? DateTime.fromISO(user.birthday) : null,
    },
  })

  const { mutateAsync: update } = useMutation({
    mutationKey: ['user.update'],
    mutationFn: (data: UpdateUserProfileInputDto) => api.user.update(data),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: (_output, data) => {
      addToast({ message: 'Profil mis à jour', variant: 'info' })

      queryClient.setQueryData(['user'], (old: UserDto) => ({
        ...old,
        ...data,
        birthday: data.birthday ? DateTime.fromJSDate(data.birthday) : null,
      }))

      dispatch(updateUserAction({ firstName: data.firstname, lastName: data.lastname }))
    },
  })

  const onSubmit = (data: FormFields) =>
    update({
      firstname: data.firstname,
      lastname: data.lastname,
      birthday: data.birthday !== null ? new Date(data.birthday.toISODate() || '') : undefined,
    })

  return (
    <Loader loading={loadingUser}>
      <Stack component="form" onSubmit={handleSubmit(onSubmit)} noValidate gap={smallScreen ? 2 : 3}>
        <Stack direction="row" flexWrap="wrap" gap={smallScreen ? 2 : 3}>
          <Stack justifyContent="center" alignItems="center" sx={smallScreen ? { width: '100%' } : undefined}>
            <AvatarUpdateButton
              firstname={user?.firstname || ''}
              lastname={user?.lastname || ''}
              pictureUrl={pictureUrl}
              socials={user?.social || []}
              onPictureUpdated={pictureUrl => dispatch(updatePictureAction(pictureUrl))}
              uploadPictureHandler={api.user.uploadPicture}
              updatePictureFromSocialHandler={api.user.updatePictureFromSocial}
              deletePictureHandler={api.user.deletePicture}
            />
          </Stack>
          <Box sx={{ flexGrow: 1 }}>
            <InputLabel>Email</InputLabel>
            <TextField
              autoComplete="off"
              disabled={true}
              fullWidth
              value={user?.email || ''}
              inputProps={{ readOnly: true }}
              helperText="Ce champ n'est pas modifiable pour le moment"
            />
          </Box>
        </Stack>

        <Stack direction="row" flexWrap="wrap" gap={smallScreen ? 2 : 3}>
          <Box sx={{ flexGrow: 1 }}>
            <InputLabel required>Prénom</InputLabel>
            <TextField
              {...register('firstname')}
              autoComplete="off"
              fullWidth
              placeholder="John"
              error={!!formErrors.firstname}
              helperText={formErrors.firstname?.message}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <InputLabel required>Nom</InputLabel>
            <TextField
              {...register('lastname')}
              autoComplete="off"
              fullWidth
              placeholder="Doe"
              error={!!formErrors.lastname}
              helperText={formErrors.lastname?.message}
            />
          </Box>
        </Stack>

        <Stack>
          <InputLabel>Date de naissance</InputLabel>

          <Controller
            control={control}
            name="birthday"
            render={({ field }) => (
              <MobileDatePicker
                value={field.value}
                inputRef={field.ref}
                disabled={field.disabled}
                referenceDate={DateTime.now().minus({ year: 30 })}
                onChange={date => field.onChange(date)}
                disableFuture={true}
              />
            )}
          />
        </Stack>

        <Stack direction="row" justifyContent="center">
          <LoadingButton
            sx={{ marginTop: '20px' }}
            type="submit"
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
    </Loader>
  )
}
