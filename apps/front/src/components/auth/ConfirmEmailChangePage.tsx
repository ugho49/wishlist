import type { ConfirmEmailChangeInputDto } from '@wishlist/common'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { CircularProgress, Stack, styled, Typography } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { useApi } from '../../hooks/useApi'
import { RouterLink } from '../common/RouterLink'

const ContainerStyled = styled(Stack)(({ theme }) => ({
  height: '100vh',
  justifyContent: 'center',
  gap: theme.spacing(4),
  alignItems: 'center',
  padding: theme.spacing(4),
}))

const TitleStyled = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  textAlign: 'center',
  marginBottom: 24,
}))

const FooterStackStyled = styled(Stack)(({ theme }) => ({
  marginTop: theme.spacing(2.5),
  gap: theme.spacing(1),
  alignItems: 'center',
}))

const ErrorMessageStyled = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  color: theme.palette.error.main,
  fontSize: '1.3rem',
  fontWeight: 600,
}))

const InfoMessageStyled = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.grey[50],
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.grey[200]}`,
}))

const SuccessMessageStyled = styled(Stack)(({ theme }) => ({
  textAlign: 'center',
  color: theme.palette.success.dark,
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  border: `2px solid ${theme.palette.success.main}`,
  gap: theme.spacing(2),
}))

type ConfirmEmailChangePageProps = {
  email: string
  token: string
}

export const ConfirmEmailChangePage = (props: ConfirmEmailChangePageProps) => {
  const { email, token } = props
  const api = useApi()
  const [error, setError] = useState<boolean>(false)
  const [redirectTimeoutInSeconds, setRedirectTimeoutInSeconds] = useState<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const navigate = useNavigate()

  const { mutateAsync: confirmEmailChange, isPending } = useMutation({
    mutationKey: ['user.confirmEmailChange'],
    mutationFn: (data: ConfirmEmailChangeInputDto) => api.user.confirmEmailChange(data),
    onError: () => setError(true),
    onSuccess: () => {
      setRedirectTimeoutInSeconds(10)

      const interval = setInterval(() => {
        setRedirectTimeoutInSeconds(prev => {
          const newTimeout = prev - 1
          if (newTimeout <= 0) {
            clearInterval(interval)
            return 0
          }
          return newTimeout
        })
      }, 1000)

      const timeout = setTimeout(() => {
        void navigate({ to: '/user/profile' })
      }, 10000)
      timeoutRef.current = timeout
    },
  })

  useEffect(() => {
    if (email && token) {
      void confirmEmailChange({
        new_email: email,
        token,
      })
    }

    if (!email || !token) {
      setError(true)
    }
  }, [email, token, confirmEmailChange])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  if (error) {
    return (
      <ContainerStyled>
        <ErrorMessageStyled variant="h4">Cette URL n'est pas valide</ErrorMessageStyled>
        <InfoMessageStyled variant="body1">
          Le lien de confirmation d'email n'est pas valide. Veuillez vérifier votre email ou demander un nouveau
          changement d'adresse.
        </InfoMessageStyled>
        <RouterLink to="/user/profile">Retour au profil</RouterLink>
      </ContainerStyled>
    )
  }

  if (isPending) {
    return (
      <ContainerStyled>
        <TitleStyled variant="h4">Confirmation en cours...</TitleStyled>
        <CircularProgress size={60} />
        <InfoMessageStyled variant="body1">
          Nous confirmons votre changement d'adresse email vers <strong>{email}</strong>
        </InfoMessageStyled>
      </ContainerStyled>
    )
  }

  return (
    <ContainerStyled>
      <SuccessMessageStyled>
        <CheckCircleIcon sx={{ fontSize: 60, alignSelf: 'center' }} />
        <Typography variant="h6" fontWeight={600}>
          Votre adresse email a été changée avec succès 🎉
        </Typography>
        <Typography variant="body1">
          Votre nouvelle adresse email est maintenant <strong>{email}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vous pouvez maintenant vous connecter avec votre nouvelle adresse email.
        </Typography>
      </SuccessMessageStyled>

      <FooterStackStyled>
        <RouterLink to="/user/profile">Retour au profil</RouterLink>
        {redirectTimeoutInSeconds > 0 && (
          <Typography variant="body2" color="text.secondary">
            Vous allez être automatiquement redirigé dans {redirectTimeoutInSeconds} seconde
            {redirectTimeoutInSeconds > 1 ? 's' : ''}.
          </Typography>
        )}
      </FooterStackStyled>
    </ContainerStyled>
  )
}
