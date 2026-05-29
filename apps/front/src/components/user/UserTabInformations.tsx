import type { RootState } from '../../core'

import { zodResolver } from '@hookform/resolvers/zod'
import SaveIcon from '@mui/icons-material/Save'
import { Box, Button, Stack, TextField } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { DateTime } from 'luxon'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { z } from 'zod'

import { updateUser as updateUserAction } from '../../core/store/features'
import { useUpdateUserProfileMutation } from '../../gql'
import { unwrapResult } from '../../gql/result'
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

  const { mutateAsync: update } = useUpdateUserProfileMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
  })

  const onSubmit = async (data: FormFields) => {
    const birthday = data.birthday !== null ? data.birthday.toISODate() || undefined : undefined

    const res = await update({
      input: {
        firstname: data.firstname,
        lastname: data.lastname,
        birthday,
      },
    })

    unwrapResult(res.updateUserProfile, 'User')

    addToast({ message: 'Profil mis à jour', variant: 'info' })

    dispatch(
      updateUserAction({
        firstName: data.firstname,
        lastName: data.lastname,
        birthday,
      }),
    )

    void queryClient.invalidateQueries({ queryKey: ['UserProfileCurrentUser'] })
  }

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
