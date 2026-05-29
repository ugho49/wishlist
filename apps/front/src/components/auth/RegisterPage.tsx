import { zodResolver } from '@hookform/resolvers/zod'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { Alert, Button, Divider, Stack, styled, TextField, Typography } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { z } from 'zod'

import { setTokens } from '../../core/store/features'
import { useAuthLoginMutation, useAuthLoginWithGoogleMutation, useAuthRegisterUserMutation } from '../../gql'
import { GraphqlRejectionError, unwrapResult } from '../../gql/result'
import { useToast } from '../../hooks/useToast'
import { zodRequiredString } from '../../utils/validation'
import { RouterLink } from '../common/RouterLink'
import { GoogleButton } from './GoogleButton'

const schema = z.object({
  email: z.email({ message: 'Email invalide' }).max(200, '200 caractères maximum'),
  password: z.string().min(8, '8 caractères minimum').max(50, '50 caractères maximum'),
  firstname: zodRequiredString().max(50, '50 caractères maximum'),
  lastname: zodRequiredString().max(50, '50 caractères maximum'),
})

type FormFields = z.infer<typeof schema>

const TitleStyled = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  textAlign: 'center',
}))

const SocialButtonsStack = styled(Stack)(() => ({
  width: '100%',
  gap: 12,
}))

const ButtonStyled = styled(Button)(() => ({
  paddingTop: 12,
  paddingBottom: 12,
  fontSize: '1rem',
  fontWeight: 600,
}))

const DividerStyled = styled(Divider)(() => ({
  marginTop: 16,
  marginBottom: 16,
}))

export const RegisterPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [socialLoading, setSocialLoading] = useState(false)

  const {
    register,
    setError,
    handleSubmit,
    formState: { isSubmitting, errors: formErrors },
  } = useForm<FormFields>({ resolver: zodResolver(schema) })

  const handleRegisterSuccess = (accessToken: string, from: 'social' | 'email') => {
    addToast({ message: 'Bienvenue sur wishlist 👋', variant: 'default' })

    dispatch(
      setTokens({
        accessToken,
      }),
    )

    // Redirect to welcome page for new users
    void navigate({ to: '/welcome', search: { from } })
  }

  const { mutateAsync: registerUserMutation } = useAuthRegisterUserMutation()
  const { mutateAsync: loginMutation } = useAuthLoginMutation()
  const { mutateAsync: loginWithGoogleMutation } = useAuthLoginWithGoogleMutation()

  const registerUser = async (data: FormFields) => {
    try {
      const registerRes = await registerUserMutation({ input: data })
      unwrapResult(registerRes.registerUser, 'User')

      const loginRes = await loginMutation({ input: { email: data.email, password: data.password } })
      const output = unwrapResult(loginRes.login, 'LoginOutput')
      handleRegisterSuccess(output.accessToken, 'email')
    } catch (e) {
      if (e instanceof GraphqlRejectionError && e.typename === 'ValidationRejection') {
        setError('root', { message: 'Cet email est déjà utilisé' })
      } else {
        setError('root', { message: "Une erreur s'est produite." })
      }
    }
  }

  const registerWithGoogle = async (code: string) => {
    try {
      const res = await loginWithGoogleMutation({ input: { code, createUserIfNotExists: true } })
      const output = unwrapResult(res.loginWithGoogle, 'LoginWithGoogleOutput')
      handleRegisterSuccess(output.accessToken, 'social')
    } catch {
      onSocialError()
    }
  }

  const onSubmit = (data: FormFields) => registerUser(data)

  const onSocialError = () => {
    setSocialLoading(false)
    addToast({ message: "Une erreur s'est produite", variant: 'error' })
  }

  return (
    <Stack spacing={4} alignItems="center">
      <TitleStyled variant="h4">Créer un compte</TitleStyled>

      <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={3} width="100%">
        {formErrors.root && <Alert severity="error">{formErrors.root.message}</Alert>}

        <Stack direction="row" spacing={2}>
          <TextField
            {...register('firstname')}
            label="Prénom"
            fullWidth
            placeholder="Votre prénom"
            autoComplete="given-name"
            error={!!formErrors.firstname}
            helperText={formErrors.firstname?.message}
          />

          <TextField
            {...register('lastname')}
            label="Nom"
            fullWidth
            placeholder="Votre nom"
            autoComplete="family-name"
            error={!!formErrors.lastname}
            helperText={formErrors.lastname?.message}
          />
        </Stack>

        <TextField
          {...register('email')}
          type="email"
          label="Email"
          fullWidth
          placeholder="votre@email.com"
          autoComplete="email"
          error={!!formErrors.email}
          helperText={formErrors.email?.message}
        />

        <TextField
          {...register('password')}
          type="password"
          label="Mot de passe"
          fullWidth
          placeholder="Choisissez un mot de passe sécurisé"
          autoComplete="new-password"
          error={!!formErrors.password}
          helperText={formErrors.password?.message}
        />

        <ButtonStyled
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          loading={isSubmitting}
          loadingPosition="start"
          startIcon={<PersonAddIcon />}
          disabled={isSubmitting || socialLoading}
        >
          Créer mon compte
        </ButtonStyled>

        <DividerStyled>
          <Typography variant="body2" color="text.secondary">
            ou
          </Typography>
        </DividerStyled>

        <SocialButtonsStack alignItems="center">
          <GoogleButton
            loading={socialLoading}
            disabled={socialLoading}
            onSuccess={code => registerWithGoogle(code)}
            onError={() => onSocialError()}
            onStart={() => setSocialLoading(true)}
            iconSize={23}
          >
            S'inscrire avec Google
          </GoogleButton>
        </SocialButtonsStack>
      </Stack>

      <Stack spacing={2} alignItems="center">
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Déjà inscrit ?
          </Typography>
          <RouterLink to="/login">Se connecter</RouterLink>
        </Stack>
        <RouterLink to="/forgot-password">Mot de passe oublié ?</RouterLink>
      </Stack>
    </Stack>
  )
}
