import type { UpdateUserProfileInputDto, UserDto } from '@wishlist/common'
import type { RootState } from '../../core'

import { zodResolver } from '@hookform/resolvers/zod'
import SaveIcon from '@mui/icons-material/Save'
import { Box, Button, Stack, TextField } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DateTime } from 'luxon'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { z } from 'zod'

import { updateUser as updateUserAction } from '../../core/store/features'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { zodRequiredString } from '../../utils/validation'
import { Card } from '../common/Card'
import { WishlistDatePicker } from '../common/DatePicker'
import { Loader } from '../common/Loader'
import { Subtitle } from '../common/Subtitle'
import { EmailChangeSection } from './EmailChangeSection'

const mapState = (state: RootState) => state.userProfile

const schema = z.object({
  firstname: zodRequiredString().max(50, '50 caractères maximum'),
  lastname: zodRequiredString().max(50, '50 caractères maximum'),
  birthday: z.custom<DateTime>().nullable(),
})

type FormFields = z.infer<typeof schema>

export const UserTabInformations = () => {
  const userState = useSelector(mapState)
  const dispatch = useDispatch()
  const api = useApi()
  const { addToast } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, errors: formErrors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    values: {
      firstname: userState.firstName || '',
      lastname: userState.lastName || '',
      birthday: userState.birthday ? DateTime.fromISO(userState.birthday) : null,
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

      dispatch(
        updateUserAction({
          firstName: data.firstname,
          lastName: data.lastname,
          birthday: data.birthday ? data.birthday.toISOString() : undefined,
        }),
      )
    },
  })

  const onSubmit = (data: FormFields) =>
    update({
      firstname: data.firstname,
      lastname: data.lastname,
      birthday: data.birthday !== null ? new Date(data.birthday.toISODate() || '') : undefined,
    })

  return (
    <Stack gap={3}>
      <Card>
        <Loader loading={!userState.isUserLoaded}>
          <Subtitle>Modifier les informations</Subtitle>

          <Stack component="form" onSubmit={handleSubmit(onSubmit)} noValidate gap={3}>
            <Stack direction="row" flexWrap="wrap" gap={3}>
              <Box sx={{ flexGrow: 1 }}>
                <TextField
                  {...register('firstname')}
                  autoComplete="off"
                  label="Prénom"
                  fullWidth
                  required
                  placeholder="John"
                  error={!!formErrors.firstname}
                  helperText={formErrors.firstname?.message}
                />
              </Box>

              <Box sx={{ flexGrow: 1 }}>
                <TextField
                  {...register('lastname')}
                  label="Nom"
                  required
                  autoComplete="off"
                  fullWidth
                  placeholder="Doe"
                  error={!!formErrors.lastname}
                  helperText={formErrors.lastname?.message}
                />
              </Box>
            </Stack>

            <Box sx={{ flexGrow: 1 }}>
              <Controller
                control={control}
                name="birthday"
                render={({ field }) => (
                  <WishlistDatePicker
                    label="Date de naissance"
                    value={field.value}
                    inputRef={field.ref}
                    disabled={field.disabled}
                    referenceDate={DateTime.now().minus({ year: 30 })}
                    onChange={date => field.onChange(date)}
                    disableFuture
                    fullWidth
                  />
                )}
              />
            </Box>

            <Stack direction="row" justifyContent="center">
              <Button
                sx={{ marginTop: '8px' }}
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
        </Loader>
      </Card>

      <Card>
        <EmailChangeSection />
      </Card>
    </Stack>
  )
}
