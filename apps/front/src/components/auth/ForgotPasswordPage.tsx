import type { ResetPasswordInputDto } from '@wishlist/common'

import { zodResolver } from '@hookform/resolvers/zod'
import AttachEmailIcon from '@mui/icons-material/AttachEmail'
import { Box, Button, Stack, styled, TextField, Typography } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { InputLabel } from '../common/InputLabel'
import { RouterLink } from '../common/RouterLink'

const schema = z.object({
  email: z.string().email('Email invalide').max(200, '200 caractères maximum'),
})

type FormFields = z.infer<typeof schema>

const TitleStyled = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  textAlign: 'center',
  marginBottom: 24,
}))

const TextFieldStyled = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}))

const ButtonStyled = styled(Button)(() => ({
  paddingTop: 12,
  paddingBottom: 12,
  fontSize: '1rem',
  fontWeight: 600,
}))

const MessageBoxStyled = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.grey[200]}`,
}))

const FooterStackStyled = styled(Stack)(({ theme }) => ({
  marginTop: theme.spacing(2.5),
  gap: theme.spacing(1),
  alignItems: 'center',
}))

export const ForgotPasswordPage = () => {
  const api = useApi()
  const { addToast } = useToast()
  const [resetCodeSent, setResetCodeSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors: formErrors },
  } = useForm<FormFields>({ resolver: zodResolver(schema) })

  const { mutateAsync: sendResetPasswordEmail } = useMutation({
    mutationKey: ['user.sendResetPasswordEmail'],
    mutationFn: (data: ResetPasswordInputDto) => api.user.sendResetUserPasswordEmail(data),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: () => {
      setResetCodeSent(true)
      addToast({ message: 'Un email vient de vous être envoyé pour réinitialiser le mot de passe', variant: 'info' })
    },
  })

  const onSubmit = (data: FormFields) => sendResetPasswordEmail(data)

  return (
    <Stack spacing={4} alignItems="center">
      {resetCodeSent ? (
        <MessageBoxStyled>
          <Typography variant="body1" gutterBottom>
            Un email 📩 vient de vous être envoyé pour réinitialiser le mot de passe. Aller regarder dans votre boite
            mail 😊
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            (Pensez aussi à regarder dans les spams)
          </Typography>
        </MessageBoxStyled>
      ) : (
        <>
          <TitleStyled variant="h4">Mot de passe oublié</TitleStyled>

          <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={3} width="100%">
            <Box>
              <InputLabel required>Email</InputLabel>
              <TextFieldStyled
                {...register('email')}
                type="email"
                fullWidth
                placeholder="Entrer l'email que vous avez utilisé lors de l'inscription"
                autoComplete="email"
                autoFocus
                error={!!formErrors.email}
                helperText={formErrors.email?.message}
              />
            </Box>

            <ButtonStyled
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              color="primary"
              loading={isSubmitting}
              loadingPosition="start"
              startIcon={<AttachEmailIcon />}
              disabled={isSubmitting}
            >
              Réinitialisez mon mot de passe
            </ButtonStyled>
          </Stack>
        </>
      )}

      <FooterStackStyled>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Déjà inscrit ?
          </Typography>
          <RouterLink to="/login">Me connecter</RouterLink>
        </Stack>
      </FooterStackStyled>
    </Stack>
  )
}
