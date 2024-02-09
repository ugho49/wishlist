import React from 'react';
import { useApi, useToast } from '@wishlist-front/hooks';
import { Alert, Box, Stack, TextField } from '@mui/material';
import { InputLabel } from '../common/InputLabel';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import { useMutation } from '@tanstack/react-query';
import type { ChangeUserPasswordInputDto } from '@wishlist/common-types';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  oldPassword: z.string().min(1, { message: '1 caractère minimum' }),
  newPassword: z.string().min(8, { message: '8 caractères minimum' }).max(50, { message: '50 caractères maximum' }),
});

type FormFields = z.infer<typeof schema>;

export const UserTabPassword = () => {
  const api = useApi();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    reset: resetForm,
    setError,
    formState: { isSubmitting, errors: formErrors },
  } = useForm<FormFields>({ resolver: zodResolver(schema) });

  const { mutateAsync: changePassword } = useMutation({
    mutationKey: ['user.changePassword'],
    mutationFn: (data: ChangeUserPasswordInputDto) => api.user.changePassword(data),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: () => {
      addToast({ message: 'Mot de passe mis à jour', variant: 'info' });
      resetForm();
    },
  });

  const onSubmit = async (data: FormFields) => {
    if (data.oldPassword === data.newPassword) {
      setError('root', { message: "Le nouveau mot de passe doit être différent de l'ancien" });
      return;
    }

    await changePassword({
      old_password: data.oldPassword,
      new_password: data.newPassword,
    });
  };

  return (
    <Stack component="form" onSubmit={handleSubmit(onSubmit)} noValidate gap={3}>
      {formErrors.root && <Alert severity="error">{formErrors.root.message}</Alert>}

      <Box>
        <InputLabel required>Ancien mot de passe</InputLabel>
        <TextField
          {...register('oldPassword')}
          type="password"
          autoComplete="off"
          fullWidth
          placeholder="********"
          error={!!formErrors.oldPassword}
          helperText={formErrors.oldPassword?.message}
        />
      </Box>
      <Box>
        <InputLabel required>Nouveau mot de passe</InputLabel>
        <TextField
          {...register('newPassword')}
          type="password"
          autoComplete="off"
          fullWidth
          placeholder="********"
          error={!!formErrors.newPassword}
          helperText={formErrors.newPassword?.message}
        />
      </Box>
      <Stack direction="row" justifyContent="center">
        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          color="secondary"
          loading={isSubmitting}
          loadingPosition="start"
          disabled={isSubmitting}
          startIcon={<SaveIcon />}
        >
          Mettre à jour
        </LoadingButton>
      </Stack>
    </Stack>
  );
};
