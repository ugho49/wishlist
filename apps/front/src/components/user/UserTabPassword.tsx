import type { ChangeUserPasswordInputDto } from '@wishlist/common'

import { zodResolver } from '@hookform/resolvers/zod'
import SaveIcon from '@mui/icons-material/Save'
import { Alert, Box, Button, Stack, TextField } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { InputLabel } from '../common/InputLabel'

const schema = z.object({
  oldPassword: z.string().min(1, 'Ce champ ne peut pas être vide'),
  newPassword: z.string().min(8, '8 caractères minimum').max(50, '50 caractères maximum'),
})

type FormFields = z.infer<typeof schema>

export const UserTabPassword = () => {
  const api = useApi()
  const { addToast } = useToast()

  const {
    register,
    handleSubmit,
    reset: resetForm,
    setError,
    formState: { isSubmitting, errors: formErrors },
  } = useForm<FormFields>({ resolver: zodResolver(schema) })

  const { mutateAsync: changePassword } = useMutation({
    mutationKey: ['user.changePassword'],
    mutationFn: (data: ChangeUserPasswordInputDto) => api.user.changePassword(data),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: () => {
      addToast({ message: 'Mot de passe mis à jour', variant: 'info' })
      resetForm()
    },
  })

  const onSubmit = async (data: FormFields) => {
    if (data.oldPassword === data.newPassword) {
      setError('root', { message: "Le nouveau mot de passe doit être différent de l'ancien" })
      return
    }

    await changePassword({
      old_password: data.oldPassword,
      new_password: data.newPassword,
    })
  }

  return (
    <Stack component="form" onSubmit={handleSubmit(onSubmit)} noValidate gap={3}>
      {formErrors.root && <Alert severity="error">{formErrors.root.message}</Alert>}

      <Box>
        <InputLabel required>Ancien mot de passe</InputLabel>
        <TextField
          {...register('oldPassword')}
          type="password"
          autoComplete="off"
          fullWidth
          placeholder="********"
          error={!!formErrors.oldPassword}
          helperText={formErrors.oldPassword?.message}
        />
      </Box>
      <Box>
        <InputLabel required>Nouveau mot de passe</InputLabel>
        <TextField
          {...register('newPassword')}
          type="password"
          autoComplete="off"
          fullWidth
          placeholder="********"
          error={!!formErrors.newPassword}
          helperText={formErrors.newPassword?.message}
        />
      </Box>
      <Stack direction="row" justifyContent="center">
        <Button
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
        </Button>
      </Stack>
    </Stack>
  )
}
