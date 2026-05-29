import { zodResolver } from '@hookform/resolvers/zod'
import SaveIcon from '@mui/icons-material/Save'
import { Alert, Box, Button, Stack, TextField } from '@mui/material'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useChangeUserPasswordMutation } from '../../gql'
import { unwrapResult } from '../../gql/result'
import { useToast } from '../../hooks/useToast'
import { Card } from '../common/Card'
import { Subtitle } from '../common/Subtitle'

const schema = z.object({
  oldPassword: z.string().min(1, 'Ce champ ne peut pas être vide'),
  newPassword: z.string().min(8, '8 caractères minimum').max(50, '50 caractères maximum'),
})

type FormFields = z.infer<typeof schema>

export const UserTabPassword = () => {
  const { addToast } = useToast()

  const {
    register,
    handleSubmit,
    reset: resetForm,
    setError,
    formState: { isSubmitting, errors: formErrors },
  } = useForm<FormFields>({ resolver: zodResolver(schema) })

  const { mutateAsync: changePassword } = useChangeUserPasswordMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
  })

  const onSubmit = async (data: FormFields) => {
    if (data.oldPassword === data.newPassword) {
      setError('root', { message: "Le nouveau mot de passe doit être différent de l'ancien" })
      return
    }

    const res = await changePassword({
      input: {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      },
    })

    unwrapResult(res.changeUserPassword, 'VoidOutput')

    addToast({ message: 'Mot de passe mis à jour', variant: 'info' })
    resetForm()
  }

  return (
    <Card>
      <Subtitle>Modifier le mot de passe</Subtitle>

      {formErrors.root && <Alert severity="error">{formErrors.root.message}</Alert>}

      <Stack component="form" onSubmit={handleSubmit(onSubmit)} noValidate gap={3}>
        <Stack direction="row" flexWrap="wrap" gap={3}>
          <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
            <TextField
              {...register('oldPassword')}
              label="Ancien mot de passe"
              type="password"
              autoComplete="off"
              fullWidth
              placeholder="********"
              error={!!formErrors.oldPassword}
              helperText={formErrors.oldPassword?.message}
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
            <TextField
              {...register('newPassword')}
              label="Nouveau mot de passe"
              type="password"
              autoComplete="off"
              fullWidth
              placeholder="********"
              error={!!formErrors.newPassword}
              helperText={formErrors.newPassword?.message}
            />
          </Box>
        </Stack>
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
    </Card>
  )
}
