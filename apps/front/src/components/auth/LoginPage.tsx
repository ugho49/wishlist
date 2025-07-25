import type { CredentialResponse } from '@react-oauth/google'
import type { LoginInputDto, LoginOutputDto } from '@wishlist/common'

import { zodResolver } from '@hookform/resolvers/zod'
import LoginIcon from '@mui/icons-material/Login'
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
import { getUrlParameter } from '../../utils/router.utils'
import { RouterLink } from '../common/RouterLink'

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Ce champ ne peut pas être vide'),
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
    <Stack spacing={4} alignItems="center">
      <TitleStyled variant="h4">Connexion</TitleStyled>

      <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={3} width="100%">
        {formErrors.root && <Alert severity="error">{formErrors.root.message}</Alert>}

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
          placeholder="Votre mot de passe"
          autoComplete="current-password"
          error={!!formErrors.password}
          helperText={formErrors.password?.message}
        />

        <ButtonStyled
          type="submit"
          variant="contained"
          size="large"
          color="primary"
          fullWidth
          loading={isSubmitting}
          loadingPosition="start"
          startIcon={<LoginIcon />}
          disabled={isSubmitting || socialLoading}
        >
          Se connecter
        </ButtonStyled>

        <DividerStyled>
          <Typography variant="body2" color="text.secondary">
            ou
          </Typography>
        </DividerStyled>

        <Stack alignItems="center">
          <GoogleLogin onSuccess={onGoogleLoginSuccess} onError={onGoogleLoginFailure} text="signin_with" locale="fr" />
        </Stack>
      </Stack>

      <Stack spacing={2} alignItems="center">
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Pas encore inscrit ?
          </Typography>
          <RouterLink to="/register">Créer un compte</RouterLink>
        </Stack>
        <RouterLink to="/forgot-password">Mot de passe oublié ?</RouterLink>
      </Stack>
    </Stack>
  )
}
