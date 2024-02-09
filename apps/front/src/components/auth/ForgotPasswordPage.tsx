import React, { useState } from 'react';
import { RouterLink } from '../common/RouterLink';
import { Card } from '../common/Card';
import { Subtitle } from '../common/Subtitle';
import { Box, Stack, TextField } from '@mui/material';
import { InputLabel } from '../common/InputLabel';
import { LoadingButton } from '@mui/lab';
import AttachEmailIcon from '@mui/icons-material/AttachEmail';
import { useApi, useToast } from '@wishlist-front/hooks';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { LoginInputDto, type ResetPasswordInputDto } from '@wishlist/common-types';
import { AxiosError } from 'axios';

const schema = z.object({
  email: z.string().email({ message: 'Email invalide' }).max(200, { message: '200 caractères maximum' }),
});

type FormFields = z.infer<typeof schema>;

export const ForgotPasswordPage = () => {
  const api = useApi();
  const { addToast } = useToast();
  const [resetCodeSent, setResetCodeSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors: formErrors },
  } = useForm<FormFields>({ resolver: zodResolver(schema) });

  const { mutateAsync: sendResetPasswordEmail } = useMutation({
    mutationKey: ['user.sendResetPasswordEmail'],
    mutationFn: (data: ResetPasswordInputDto) => api.user.sendResetUserPasswordEmail(data),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: () => {
      setResetCodeSent(true);
      addToast({ message: 'Un email vient de vous être envoyé pour réinitialiser le mot de passe', variant: 'info' });
    },
  });

  const onSubmit = (data: FormFields) => sendResetPasswordEmail(data);

  return (
    <>
      <Card sx={{ width: '100%' }}>
        {resetCodeSent && (
          <Box component="p" style={{ textAlign: 'center' }}>
            Un email 📩 vient de vous être envoyé pour réinitialiser le mot de passe. Aller regarder dans votre boite
            mail 😊
            <br />
            <br />
            <b>(Pensez aussi à regarder dans les spams)</b>
          </Box>
        )}
        {!resetCodeSent && (
          <>
            <Subtitle>Mot de passe oublié</Subtitle>
            <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap={3}>
              <Box>
                <InputLabel required>Email</InputLabel>
                <TextField
                  {...register('email')}
                  type="email"
                  fullWidth
                  placeholder="Entrer l'email que vous avez utilisé lors de l'inscription"
                  autoComplete="email"
                  autoFocus
                  error={!!formErrors.email}
                  helperText={formErrors.email?.message}
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
                startIcon={<AttachEmailIcon />}
                disabled={isSubmitting}
              >
                Réinitialisez mon mot de passe
              </LoadingButton>
            </Stack>
          </>
        )}
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
