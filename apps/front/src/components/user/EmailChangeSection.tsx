import type { RequestEmailChangeInputDto } from '@wishlist/common'

import { zodResolver } from '@hookform/resolvers/zod'
import EmailIcon from '@mui/icons-material/Email'
import InfoIcon from '@mui/icons-material/Info'
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { Subtitle } from '../common/Subtitle'

const schema = z.object({
  new_email: z.email('Email invalide').min(1, 'Email requis').max(200, '200 caractères maximum'),
})

type FormFields = z.infer<typeof schema>

export const EmailChangeSection = () => {
  const api = useApi()
  const { addToast } = useToast()
  const queryClient = useQueryClient()

  const { data: pendingChange } = useQuery({
    queryKey: ['user.pendingEmailChange'],
    queryFn: ({ signal }) => api.user.getPendingEmailChange({ signal }),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors: formErrors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      new_email: '',
    },
  })

  const { mutateAsync: requestEmailChange } = useMutation({
    mutationKey: ['user.requestEmailChange'],
    mutationFn: (data: RequestEmailChangeInputDto) => api.user.requestEmailChange(data),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: () => {
      addToast({
        message:
          'Un email de confirmation a été envoyé à votre nouvelle adresse. Vérifiez votre boîte de réception pour confirmer le changement.',
        variant: 'success',
      })
      reset()
      void queryClient.invalidateQueries({ queryKey: ['user.pendingEmailChange'] })
    },
  })

  const onSubmit = (data: FormFields) => requestEmailChange({ new_email: data.new_email })

  if (pendingChange) {
    const expiresAt = new Date(pendingChange.expired_at)
    const isExpired = expiresAt < new Date()

    return (
      <Box>
        <Subtitle>Changer d'adresse email</Subtitle>

        <Alert severity={isExpired ? 'warning' : 'info'} icon={<InfoIcon />} sx={{ marginTop: 2 }}>
          <Typography variant="body1" fontWeight={500} gutterBottom>
            {isExpired ? 'Demande de changement expirée' : "Changement d'email en attente"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isExpired ? (
              <>
                Votre demande de changement vers <strong>{pendingChange.new_email}</strong> a expiré. Vous pouvez faire
                une nouvelle demande ci-dessous.
              </>
            ) : (
              <>
                Un email de confirmation a été envoyé à <strong>{pendingChange.new_email}</strong>. Vérifiez votre boîte
                de réception et cliquez sur le lien de confirmation avant{' '}
                <strong>{expiresAt.toLocaleString('fr-FR')}</strong>.
              </>
            )}
          </Typography>
        </Alert>

        {isExpired && (
          <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap={3} sx={{ marginTop: 3 }}>
            <TextField
              {...register('new_email')}
              label="Nouvelle adresse email"
              type="email"
              fullWidth
              placeholder="nouvel-email@exemple.com"
              autoComplete="email"
              error={!!formErrors.new_email}
              helperText={formErrors.new_email?.message}
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
        )}
      </Box>
    )
  }

  return (
    <Box>
      <Subtitle>Changer d'adresse email</Subtitle>

      <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1, marginBottom: 3 }}>
        Pour changer votre adresse email, entrez votre nouvelle adresse ci-dessous. Un email de confirmation sera envoyé
        à cette nouvelle adresse.
      </Typography>

      <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap={3}>
        <TextField
          {...register('new_email')}
          label="Nouvelle adresse email"
          type="email"
          fullWidth
          placeholder="nouvel-email@exemple.com"
          autoComplete="email"
          error={!!formErrors.new_email}
          helperText={formErrors.new_email?.message}
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
    </Box>
  )
}
