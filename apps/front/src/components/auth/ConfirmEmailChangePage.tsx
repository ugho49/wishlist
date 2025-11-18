import type { ConfirmEmailChangeInputDto } from '@wishlist/common'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Button, CircularProgress, Stack, styled, Typography } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { RouterLink } from '../common/RouterLink'

const TitleStyled = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  textAlign: 'center',
  marginBottom: 24,
}))

const ButtonStyled = styled(Button)(() => ({
  paddingTop: 12,
  paddingBottom: 12,
  fontSize: '1rem',
  fontWeight: 600,
}))

const FooterStackStyled = styled(Stack)(({ theme }) => ({
  marginTop: theme.spacing(2.5),
  gap: theme.spacing(1),
  alignItems: 'center',
}))

const ErrorMessageStyled = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  color: theme.palette.error.main,
  fontSize: '1.1rem',
  fontWeight: 500,
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
  backgroundColor: theme.palette.success.light,
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  border: `2px solid ${theme.palette.success.main}`,
  gap: theme.spacing(2),
}))

export const ConfirmEmailChangePage = () => {
  const { email, token } = useSearch({ from: '/_anonymous-with-layout/confirm-email-change' })
  const api = useApi()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [isConfirmed, setIsConfirmed] = useState(false)

  const { mutateAsync: confirmEmailChange, isPending } = useMutation({
    mutationKey: ['user.confirmEmailChange'],
    mutationFn: (data: ConfirmEmailChangeInputDto) => api.user.confirmEmailChange(data),
    onError: () => addToast({ message: "Une erreur s'est produite lors de la confirmation", variant: 'error' }),
    onSuccess: () => {
      setIsConfirmed(true)
      addToast({
        message: 'Votre adresse email a été changée avec succès !',
        variant: 'success',
      })
    },
  })

  useEffect(() => {
    if (email && token && !isConfirmed && !isPending) {
      void confirmEmailChange({
        new_email: email,
        token,
      })
    }
  }, [email, token, confirmEmailChange, isConfirmed, isPending])

  if (!email || !token) {
    return (
      <Stack spacing={4} alignItems="center">
        <ErrorMessageStyled variant="h6">Cette URL n'est pas valide</ErrorMessageStyled>
        <InfoMessageStyled variant="body1">
          Le lien de confirmation d'email n'est pas valide. Veuillez vérifier votre email ou demander un nouveau changement
          d'adresse.
        </InfoMessageStyled>
        <RouterLink to="/user/profile">Retour au profil</RouterLink>
      </Stack>
    )
  }

  if (isPending) {
    return (
      <Stack spacing={4} alignItems="center">
        <TitleStyled variant="h4">Confirmation en cours...</TitleStyled>
        <CircularProgress size={60} />
        <InfoMessageStyled variant="body1">
          Nous confirmons votre changement d'adresse email vers <strong>{email}</strong>
        </InfoMessageStyled>
      </Stack>
    )
  }

  if (isConfirmed) {
    return (
      <Stack spacing={4} alignItems="center">
        <TitleStyled variant="h4">Email confirmé !</TitleStyled>

        <SuccessMessageStyled>
          <CheckCircleIcon sx={{ fontSize: 60, alignSelf: 'center' }} />
          <Typography variant="h6" fontWeight={600}>
            Votre adresse email a été changée avec succès
          </Typography>
          <Typography variant="body1">
            Votre nouvelle adresse email est maintenant <strong>{email}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vous pouvez maintenant vous connecter avec votre nouvelle adresse email.
          </Typography>
        </SuccessMessageStyled>

        <ButtonStyled
          fullWidth
          variant="contained"
          size="large"
          color="primary"
          onClick={() => void navigate({ to: '/login', search: { email } })}
        >
          Me connecter
        </ButtonStyled>

        <FooterStackStyled>
          <RouterLink to="/">Retour à l'accueil</RouterLink>
        </FooterStackStyled>
      </Stack>
    )
  }

  return null
}
