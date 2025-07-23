import type { ResetPasswordValidationInputDto } from '@wishlist/common'

import { zodResolver } from '@hookform/resolvers/zod'
import SaveAsIcon from '@mui/icons-material/SaveAs'
import { Box, Button, Stack, styled, TextField, Typography } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useApi } from '../../hooks/useApi'
import { useCustomSearchParams } from '../../hooks/useCustomSearchParams'
import { useToast } from '../../hooks/useToast'
import { InputLabel } from '../common/InputLabel'
import { RouterLink } from '../common/RouterLink'

type SearchParamsType = {
  email?: string
  token?: string
}

const schema = z
  .object({
    password: z.string().min(8, '8 caractères minimum').max(50, '50 caractères maximum'),
    confirmPassword: z.string().min(1, 'Veuillez confirmer votre mot de passe'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
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

export const RenewForgotPasswordPage = () => {
  const api = useApi()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [queryParams] = useCustomSearchParams<SearchParamsType>()
  const { email, token } = queryParams

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors: formErrors },
  } = useForm<FormFields>({ resolver: zodResolver(schema) })

  const { mutateAsync: validateResetPassword } = useMutation({
    mutationKey: ['user.validateResetPassword'],
    mutationFn: (data: ResetPasswordValidationInputDto) => api.user.validateResetPassword(data),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: () => {
      addToast({
        message: 'Le mot de passe à été réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
        variant: 'success',
      })
      const searchParam = new URLSearchParams()
      searchParam.append('email', email || '')
      navigate({ pathname: '/login', search: searchParam.toString() })
    },
  })

  const onSubmit = (data: FormFields) =>
    validateResetPassword({
      email: email || '',
      token: token || '',
      new_password: data.password,
    })

  if (!email || !token) {
    return (
      <Stack spacing={4} alignItems="center">
        <ErrorMessageStyled variant="h6">Cette URL n'est pas valide</ErrorMessageStyled>
        <RouterLink to="/forgot-password">Demander un nouveau lien</RouterLink>
      </Stack>
    )
  }

  return (
    <Stack spacing={4} alignItems="center">
      <TitleStyled variant="h4">Mot de passe oublié</TitleStyled>

      <InfoMessageStyled variant="body1">
        Vous êtes en train de définir un nouveau mot de passe pour <strong>{email}</strong>
      </InfoMessageStyled>

      <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={3} width="100%">
        <Box>
          <InputLabel required>Nouveau mot de passe</InputLabel>
          <TextFieldStyled
            {...register('password')}
            fullWidth
            placeholder="Un super mot de passe"
            type="password"
            autoComplete="new-password"
            autoFocus
            error={!!formErrors.password}
            helperText={formErrors.password?.message}
          />
        </Box>

        <Box>
          <InputLabel required>Confirmer le mot de passe</InputLabel>
          <TextFieldStyled
            {...register('confirmPassword')}
            fullWidth
            placeholder="Confirmez votre mot de passe"
            type="password"
            autoComplete="new-password"
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword?.message}
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
          startIcon={<SaveAsIcon />}
          disabled={isSubmitting}
        >
          Changer mon mot de passe
        </ButtonStyled>
      </Stack>

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
