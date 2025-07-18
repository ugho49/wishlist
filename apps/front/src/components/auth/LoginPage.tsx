import type { CredentialResponse } from '@react-oauth/google'
import type { LoginInputDto, LoginOutputDto } from '@wishlist/common'

import { zodResolver } from '@hookform/resolvers/zod'
import LoginIcon from '@mui/icons-material/Login'
import { Alert, Box, Button, Stack, TextField } from '@mui/material'
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
import { getUrlParameter } from '../../utils/router.utils'
import { Card } from '../common/Card'
import { InputLabel } from '../common/InputLabel'
import { RouterLink } from '../common/RouterLink'
import { Subtitle } from '../common/Subtitle'

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Ce champ ne peut pas être vide'),
})

type FormFields = z.infer<typeof schema>

export const LoginPage = () => {
  const api = useApi()
  const dispatch = useDispatch()
  const { addToast } = useToast()
  const [socialLoading, setSocialLoading] = useState(false)
  const {
    register,
    setError,
    handleSubmit,
    formState: { isSubmitting, errors: formErrors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: { email: getUrlParameter('email') || '' },
  })

  const handleLoginSuccess = (param: LoginOutputDto) => {
    addToast({ message: 'Heureux de vous revoir 🤓', variant: 'default' })

    dispatch(
      setTokens({
        accessToken: param.access_token,
        refreshToken: param.refresh_token,
      }),
    )
  }

  const { mutateAsync: login } = useMutation({
    mutationKey: ['login'],
    mutationFn: (data: LoginInputDto) => api.auth.login(data),
    onSuccess: data => handleLoginSuccess(data),
    onError: e => {
      if (e instanceof AxiosError && (e.response?.status === 401 || e.response?.status === 403)) {
        setError('root', { message: 'Email ou mot de passe incorrect' })
      } else {
        setError('root', { message: "Une erreur s'est produite." })
      }
    },
  })

  const onSubmit = (data: FormFields) => login(data)

  const onGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setSocialLoading(true)
      const data = await api.auth.loginWithGoogle({ credential: credentialResponse.credential || '' })
      handleLoginSuccess(data)
    } catch {
      setSocialLoading(false)
      addToast({ message: "Une erreur s'est produite", variant: 'error' })
    }
  }

  const onGoogleLoginFailure = () => {
    setSocialLoading(false)
    addToast({ message: "Une erreur s'est produite", variant: 'error' })
  }

  return (
    <>
      <Card sx={{ width: '100%' }}>
        <Subtitle>Connexion</Subtitle>

        <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap={3}>
          {formErrors.root && <Alert severity="error">{formErrors.root.message}</Alert>}

          <Box>
            <InputLabel required>Email</InputLabel>
            <TextField
              {...register('email')}
              type="email"
              fullWidth
              placeholder="Entrer l'email que vous avez utilisé lors de l'inscription"
              autoComplete="email"
              error={!!formErrors.email}
              helperText={formErrors.email?.message}
            />
          </Box>
          <Box>
            <InputLabel required>Mot de passe</InputLabel>
            <TextField
              {...register('password')}
              type="password"
              fullWidth
              placeholder="Mon mot de passe"
              autoComplete="current-password"
              error={!!formErrors.password}
              helperText={formErrors.password?.message}
            />
          </Box>
          <Stack alignItems="center" gap={2}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              color="secondary"
              loading={isSubmitting}
              loadingPosition="start"
              startIcon={<LoginIcon />}
              disabled={isSubmitting || socialLoading}
            >
              Me connecter
            </Button>
            <GoogleLogin
              onSuccess={onGoogleLoginSuccess}
              onError={onGoogleLoginFailure}
              text="signin_with"
              locale="fr"
            />
          </Stack>
        </Stack>
      </Card>
      <Stack sx={{ marginTop: '20px' }} gap={1} alignItems="center">
        <Stack direction="row" alignItems="center" gap={1}>
          <Box>Pas encore inscrit ?</Box>
          <RouterLink to="/register">Inscription</RouterLink>
        </Stack>
        <RouterLink to="/forgot-password">Mot de passe oublié ?</RouterLink>
      </Stack>
    </>
  )
}
