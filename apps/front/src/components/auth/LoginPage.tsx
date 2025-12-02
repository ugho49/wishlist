import type { LoginInputDto, LoginOutputDto } from '@wishlist/common'

import { zodResolver } from '@hookform/resolvers/zod'
import LoginIcon from '@mui/icons-material/Login'
import { Alert, Button, Divider, Stack, styled, TextField, Typography } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { z } from 'zod'

import { setTokens } from '../../core/store/features'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { RouterLink } from '../common/RouterLink'
import { SEO } from '../SEO'
import { GoogleButton } from './GoogleButton'

const schema = z.object({
  email: z.email('Email invalide'),
  password: z.string().min(1, 'Ce champ ne peut pas être vide'),
})

type FormFields = z.infer<typeof schema>

const TitleStyled = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  textAlign: 'center',
}))

const ButtonStyled = styled(Button)(() => ({
  paddingTop: 12,
  paddingBottom: 12,
  fontSize: '1rem',
  fontWeight: 600,
}))

const SocialButtonsStack = styled(Stack)(() => ({
  width: '100%',
  gap: 12,
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
  const navigate = useNavigate()
  const { redirectUrl, email: emailFromSearch } = useSearch({ from: '/_anonymous-with-layout/login' })
  const {
    register,
    setError,
    handleSubmit,
    formState: { isSubmitting, errors: formErrors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: { email: emailFromSearch || '' },
  })

  const handleLoginSuccess = (param: LoginOutputDto) => {
    addToast({ message: 'Heureux de vous revoir 🤓', variant: 'default' })

    dispatch(
      setTokens({
        accessToken: param.access_token,
      }),
    )

    void navigate({ to: redirectUrl })
  }

  const onSocialError = () => {
    setSocialLoading(false)
    addToast({ message: "Une erreur s'est produite", variant: 'error' })
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

  const { mutateAsync: loginWithGoogle } = useMutation({
    mutationKey: ['loginWithGoogle'],
    mutationFn: (code: string) => api.auth.loginWithGoogle({ code, createUserIfNotExists: false }),
    onSuccess: data => handleLoginSuccess(data),
    onError: () => onSocialError(),
  })

  const onSubmit = (data: FormFields) => login(data)

  return (
    <>
      <SEO
        title="Connexion"
        description="Connectez-vous à votre compte Wishlist pour gérer vos listes de souhaits et partager vos envies avec vos proches."
        canonical="/login"
        noindex
      />
      <Stack spacing={4} alignItems="center">
        <TitleStyled variant="h4">Connexion</TitleStyled>

        <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={3} width="100%">
          {formErrors.root && <Alert severity="error">{formErrors.root.message}</Alert>}

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

          <SocialButtonsStack alignItems="center">
            <GoogleButton
              loading={socialLoading}
              disabled={socialLoading}
              onSuccess={code => loginWithGoogle(code)}
              onError={() => onSocialError()}
              onStart={() => setSocialLoading(true)}
              iconSize={23}
            >
              Se connecter avec Google
            </GoogleButton>
            {/* <SocialButton
            variant="contained"
            loading={socialLoading}
            disabled={socialLoading}
            startIcon={<CustomIcon name="facebook" style={{ width: 24.5, height: 24.5 }} />}
          >
            Se connecter avec facebook
          </SocialButton> */}
          </SocialButtonsStack>
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
    </>
  )
}
