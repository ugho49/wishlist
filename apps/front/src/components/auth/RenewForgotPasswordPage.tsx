import React from 'react';
import { RouterLink } from '../common/RouterLink';
import { Card } from '../common/Card';
import { Box, Stack, TextField } from '@mui/material';
import { Subtitle } from '../common/Subtitle';
import { InputLabel } from '../common/InputLabel';
import { LoadingButton } from '@mui/lab';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import { useNavigate } from 'react-router-dom';
import { useApi, useCustomSearchParams, useToast } from '@wishlist-front/hooks';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import type { ResetPasswordValidationInputDto } from '@wishlist/common-types';

type SearchParamsType = {
  email?: string;
  token?: string;
};

const schema = z.object({
  password: z.string().min(8, { message: '8 caractères minimum' }).max(50, { message: '50 caractères maximum' }),
});

type FormFields = z.infer<typeof schema>;

export const RenewForgotPasswordPage = () => {
  const api = useApi();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [queryParams] = useCustomSearchParams<SearchParamsType>();
  const { email, token } = queryParams;

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors: formErrors },
  } = useForm<FormFields>({ resolver: zodResolver(schema) });

  const { mutateAsync: validateResetPassword } = useMutation({
    mutationKey: ['user.validateResetPassword'],
    mutationFn: (data: ResetPasswordValidationInputDto) => api.user.validateResetPassword(data),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: () => {
      addToast({
        message: 'Le mot de passe à été réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
        variant: 'success',
      });
      const searchParam = new URLSearchParams();
      searchParam.append('email', email || '');
      navigate({ pathname: '/login', search: searchParam.toString() });
    },
  });

  const onSubmit = (data: FormFields) =>
    validateResetPassword({
      email: email || '',
      token: token || '',
      new_password: data.password,
    });

  if (!email || !token) {
    return <div>Cette url n'est pas valide</div>;
  }

  return (
    <>
      <Card sx={{ width: '100%' }}>
        <Subtitle>Mot de passe oublié</Subtitle>
        <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap={3}>
          <Box>
            <InputLabel>Email</InputLabel>
            <TextField autoComplete="off" fullWidth value={email} inputProps={{ readOnly: true }} disabled />
          </Box>
          <Box>
            <InputLabel required>Nouveau mot de passe</InputLabel>
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
          <LoadingButton
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            color="secondary"
            loading={isSubmitting}
            loadingPosition="start"
            startIcon={<SaveAsIcon />}
            disabled={isSubmitting}
          >
            Changer mon mot de passe
          </LoadingButton>
        </Stack>
      </Card>
      <Stack sx={{ marginTop: '20px' }} gap={1} alignItems="center">
        <Stack direction="row" alignItems="center" gap={1}>
          <Box>Déjà inscrit ?</Box>
          <RouterLink to="/login">Me connecter</RouterLink>
        </Stack>
      </Stack>
    </>
  );
};
