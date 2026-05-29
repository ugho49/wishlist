import { zodResolver } from '@hookform/resolvers/zod'
import EmailIcon from '@mui/icons-material/Email'
import InfoIcon from '@mui/icons-material/Info'
import { Alert, Button, Stack, TextField, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useRequestUserEmailChangeMutation, useUserPendingEmailChangeQuery } from '../../gql'
import { unwrapResult } from '../../gql/result'
import { useToast } from '../../hooks/useToast'
import { Loader } from '../common/Loader'
import { Subtitle } from '../common/Subtitle'

const schema = z.object({
  newEmail: z.email('Email invalide').min(1, 'Email requis').max(200, '200 caractères maximum'),
})

type FormFields = z.infer<typeof schema>

export const EmailChangeSection = () => {
  const { addToast } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors: formErrors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      newEmail: '',
    },
  })

  const { data: pendingChange, isLoading: loadingPendingChange } = useUserPendingEmailChangeQuery(undefined, {
    select: d => (d.pendingEmailChange?.__typename === 'PendingEmailChange' ? d.pendingEmailChange : undefined),
  })

  const { mutateAsync: requestEmailChange } = useRequestUserEmailChangeMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
  })

  const expiresAt = pendingChange ? new Date(pendingChange.expiredAt).toLocaleString('fr-FR') : undefined

  const onSubmit = async (data: FormFields) => {
    const res = await requestEmailChange({ input: { newEmail: data.newEmail } })
    unwrapResult(res.requestEmailChange, 'VoidOutput')

    addToast({
      message:
        'Un email de confirmation a été envoyé à votre nouvelle adresse. Vérifiez votre boîte de réception pour confirmer le changement.',
      variant: 'success',
    })
    reset()
    void queryClient.invalidateQueries({ queryKey: ['UserPendingEmailChange'] })
  }

  return (
    <Loader loading={loadingPendingChange}>
      <Subtitle>Changer d'adresse email</Subtitle>

      {!pendingChange && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1, marginBottom: 3 }}>
            Pour changer votre adresse email, entrez votre nouvelle adresse ci-dessous. Un email de confirmation sera
            envoyé à cette nouvelle adresse.
          </Typography>

          <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap={3}>
            <TextField
              {...register('newEmail')}
              label="Nouvelle adresse email"
              type="email"
              fullWidth
              placeholder="nouvel-email@exemple.com"
              autoComplete="email"
              error={!!formErrors.newEmail}
              helperText={formErrors.newEmail?.message}
            />

            <Stack direction="row" justifyContent="center">
              <Button
                type="submit"
                variant="contained"
                size="medium"
                loading={isSubmitting}
                loadingPosition="start"
                disabled={isSubmitting}
                startIcon={<EmailIcon />}
              >
                Demander le changement
              </Button>
            </Stack>
          </Stack>
        </>
      )}

      {pendingChange && (
        <Alert severity="info" icon={<InfoIcon />} sx={{ marginTop: 2 }}>
          <Typography variant="body1" fontWeight={500} gutterBottom>
            Changement d'email en attente
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Un email de confirmation a été envoyé à <strong>{pendingChange.newEmail}</strong>. Vérifiez votre boîte de
            réception et cliquez sur le lien de confirmation avant <strong>{expiresAt}</strong>.
          </Typography>
        </Alert>
      )}
    </Loader>
  )
}
