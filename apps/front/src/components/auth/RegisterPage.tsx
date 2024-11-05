import type { CredentialResponse } from '@react-oauth/google'
import type { LoginOutputDto } from '@wishlist/common-types'

import { zodResolver } from '@hookform/resolvers/zod'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { LoadingButton } from '@mui/lab'
import { Alert, Box, Stack, TextField } from '@mui/material'
import { GoogleLogin } from '@react-oauth/google'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { z } from 'zod'

import { setTokens } from '../../core/store/features'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { zodRequiredString } from '../../utils/validation'
import { Card } from '../common/Card'
import { InputLabel } from '../common/InputLabel'
import { RouterLink } from '../common/RouterLink'
import { Subtitle } from '../common/Subtitle'

const schema = z.object({
  email: z.string().email({ message: 'Email invalide' }).max(200, '200 caractères maximum'),
  password: z.string().min(8, '8 caractères minimum').max(50, '50 caractères maximum'),
  firstname: zodRequiredString().max(50, '50 caractères maximum'),
  lastname: zodRequiredString().max(50, '50 caractères maximum'),
})

type FormFields = z.infer<typeof schema>

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
    <>
      <Card sx={{ width: '100%' }}>
        <Subtitle>Inscription</Subtitle>
        <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap={3}>
          {formErrors.root && <Alert severity="error">{formErrors.root.message}</Alert>}

          <Stack direction="row" flexWrap="wrap" gap={3}>
            <Box sx={{ flexGrow: 1 }}>
              <InputLabel required>Prénom</InputLabel>
              <TextField
                {...register('firstname')}
                fullWidth
                autoFocus
                placeholder="Mon Prénom"
                autoComplete="given-name"
                error={!!formErrors.firstname}
                helperText={formErrors.firstname?.message}
              />
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <InputLabel required>Nom</InputLabel>
              <TextField
                {...register('lastname')}
                fullWidth
                placeholder="Mon Nom"
                autoComplete="family-name"
                error={!!formErrors.lastname}
                helperText={formErrors.lastname?.message}
              />
            </Box>
          </Stack>

          <Box>
            <InputLabel required>Email</InputLabel>
            <TextField
              {...register('email')}
              type="email"
              fullWidth
              placeholder="Mon adresse email"
              autoComplete="email"
              error={!!formErrors.email}
              helperText={formErrors.email?.message}
            />
          </Box>
          <Box>
            <InputLabel required>Mot de passe</InputLabel>
            <TextField
              {...register('password')}
              fullWidth
              placeholder="Un super mot de passe"
              type="password"
              autoComplete="new-password"
              error={!!formErrors.password}
              helperText={formErrors.password?.message}
            />
          </Box>
          <Stack alignItems="center" gap={2}>
            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              color="secondary"
              loading={isSubmitting}
              loadingPosition="start"
              startIcon={<PersonAddIcon />}
              disabled={isSubmitting || socialLoading}
            >
              M'inscrire
            </LoadingButton>
            <GoogleLogin
              onSuccess={onGoogleRegisterSuccess}
              onError={onGoogleRegisterFailure}
              text="signup_with"
              locale="fr"
            />
          </Stack>
        </Stack>
      </Card>
      <Stack sx={{ marginTop: '20px' }} gap={1} alignItems="center">
        <Stack direction="row" alignItems="center" gap={1}>
          <Box>Déjà inscrit ?</Box>
          <RouterLink to="/login">Me connecter</RouterLink>
        </Stack>
        <RouterLink to="/forgot-password">Mot de passe oublié ?</RouterLink>
      </Stack>
    </>
  )
}
