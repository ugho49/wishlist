import type { CredentialResponse } from '@react-oauth/google'
import type { LoginOutputDto } from '@wishlist/common'

import { zodResolver } from '@hookform/resolvers/zod'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { Alert, Button, Divider, Stack, styled, TextField, Typography } from '@mui/material'
import { GoogleLogin } from '@react-oauth/google'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { z } from 'zod'

import { setTokens } from '../../core/store/features'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { zodRequiredString } from '../../utils/validation'
import { RouterLink } from '../common/RouterLink'

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

const DividerStyled = styled(Divider)(() => ({
  marginTop: 16,
  marginBottom: 16,
}))

export const RegisterPage = () => {
  const api = useApi()
  const dispatch = useDispatch()
  const { addToast } = useToast()
  const [socialLoading, setSocialLoading] = useState(false)
  const {
    register,
    setError,
    handleSubmit,
    formState: { isSubmitting, errors: formErrors },
  } = useForm<FormFields>({ resolver: zodResolver(schema) })

  const handleRegisterSuccess = (param: LoginOutputDto) => {
    addToast({ message: 'Bienvenue sur wishlist 👋', variant: 'default' })

    dispatch(
      setTokens({
        accessToken: param.access_token,
        refreshToken: param.refresh_token,
      }),
    )
  }

  const { mutateAsync: registerUser } = useMutation({
    mutationKey: ['register'],
    mutationFn: async (data: FormFields) => {
      await api.user.register(data)
      return api.auth.login({ email: data.email, password: data.password })
    },
    onSuccess: data => handleRegisterSuccess(data),
    onError: e => {
      if (e instanceof AxiosError && e.response?.status === 422) {
        setError('root', { message: 'Cet email est déjà utilisé' })
      } else {
        setError('root', { message: "Une erreur s'est produite." })
      }
    },
  })

  const onSubmit = (data: FormFields) => registerUser(data)

  const onGoogleRegisterSuccess = async (credentialResponse: CredentialResponse) => {
    setSocialLoading(true)
    try {
      await api.user.registerWithGoogle({ credential: credentialResponse.credential || '' })
      const data = await api.auth.loginWithGoogle({ credential: credentialResponse.credential || '' })
      handleRegisterSuccess(data)
    } catch {
      addToast({ message: "Une erreur s'est produite", variant: 'error' })
      setSocialLoading(false)
    }
  }

  const onGoogleRegisterFailure = () => {
    setSocialLoading(false)
    addToast({ message: "Une erreur s'est produite", variant: 'error' })
  }

  return (
    <Stack spacing={4} alignItems="center">
      <TitleStyled variant="h4">Créer un compte</TitleStyled>

      <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={3} width="100%">
        {formErrors.root && <Alert severity="error">{formErrors.root.message}</Alert>}

        <Stack direction="row" spacing={2}>
          <TextFieldStyled
            {...register('firstname')}
            label="Prénom"
            fullWidth
            placeholder="Votre prénom"
            autoComplete="given-name"
            error={!!formErrors.firstname}
            helperText={formErrors.firstname?.message}
          />

          <TextFieldStyled
            {...register('lastname')}
            label="Nom"
            fullWidth
            placeholder="Votre nom"
            autoComplete="family-name"
            error={!!formErrors.lastname}
            helperText={formErrors.lastname?.message}
          />
        </Stack>

        <TextFieldStyled
          {...register('email')}
          type="email"
          label="Email"
          fullWidth
          placeholder="votre@email.com"
          autoComplete="email"
          error={!!formErrors.email}
          helperText={formErrors.email?.message}
        />

        <TextFieldStyled
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

        <Stack alignItems="center">
          <GoogleLogin
            onSuccess={onGoogleRegisterSuccess}
            onError={onGoogleRegisterFailure}
            text="signup_with"
            locale="fr"
          />
        </Stack>
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
