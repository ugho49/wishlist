import { zodResolver } from '@hookform/resolvers/zod';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Button, Stack, styled, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { match } from 'ts-pattern';
import { z } from 'zod';

import { BusinessRuleCode, rejectionMessage, rejectionPattern, useAddFriendMutation } from '../../gql';
import { useToast } from '../../hooks/useToast';

const schema = z.object({
  email: z.email('Email invalide').max(200, '200 caractères maximum'),
});

type FormFields = z.infer<typeof schema>;

const FormRow = styled('form')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1.5),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

const SubmitButton = styled(Button)({
  flexShrink: 0,
  // Aligned with the text field (not its helper text)
  height: 40,
});

export type AddFriendFormProps = {
  onAdded: () => void;
};

/** Adds a friend by their exact email: there is no search of the other users. */
export const AddFriendForm = ({ onAdded }: AddFriendFormProps) => {
  const { addToast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormFields>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const { mutateAsync: addFriend, isPending } = useAddFriendMutation({
    onError: () => addToast({ message: "Impossible d'ajouter cet ami", variant: 'error' }),
  });

  const onSubmit = async ({ email }: FormFields) => {
    const res = await addFriend({ email });

    match(res.addFriend)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'Ami ajouté !', variant: 'success' });
        reset();
        onAdded();
      })
      .with({ __typename: 'NotFoundRejection' }, () => setError('email', { message: 'Aucun compte avec cet email' }))
      .with({ __typename: 'BusinessRuleRejection', code: BusinessRuleCode.RateLimited }, () =>
        setError('email', { message: 'Trop de recherches par email, réessayez plus tard' }),
      )
      .with({ __typename: 'ValidationRejection' }, () => setError('email', { message: 'Email invalide' }))
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  return (
    <Stack sx={{ gap: 1 }}>
      <FormRow onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          {...register('email')}
          type="email"
          size="small"
          fullWidth
          label="Email de votre ami"
          placeholder="prenom.nom@exemple.fr"
          disabled={isPending}
          error={!!errors.email}
          helperText={
            errors.email?.message ??
            "L'email exact de son compte. Il apparaîtra dans vos suggestions, même sans évènement en commun, et n'est pas prévenu."
          }
        />
        <SubmitButton type="submit" variant="contained" startIcon={<PersonAddIcon />} loading={isPending}>
          Ajouter
        </SubmitButton>
      </FormRow>
    </Stack>
  );
};
