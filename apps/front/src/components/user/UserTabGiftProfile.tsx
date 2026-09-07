import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import SaveIcon from '@mui/icons-material/Save';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { match } from 'ts-pattern';

import {
  rejectionMessage,
  rejectionPattern,
  useUpdateUserGiftProfileMutation,
  useUserGiftProfileQuery,
} from '../../gql';
import { useToast } from '../../hooks/useToast';
import { Card } from '../common/Card';
import { Loader } from '../common/Loader';
import { Subtitle } from '../common/Subtitle';

type FormFields = {
  clothingSize: string;
  shoeSize: string;
  notes: string;
  line1: string;
  line2: string;
  postalCode: string;
  city: string;
  country: string;
};

export const UserTabGiftProfile = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useUserGiftProfileQuery({}, { select: d => d.currentUser });
  const profile = data?.__typename === 'User' ? data.giftProfile : undefined;

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormFields>({
    values: {
      clothingSize: profile?.clothingSize ?? '',
      shoeSize: profile?.shoeSize ?? '',
      notes: profile?.notes ?? '',
      line1: profile?.address?.line1 ?? '',
      line2: profile?.address?.line2 ?? '',
      postalCode: profile?.address?.postalCode ?? '',
      city: profile?.address?.city ?? '',
      country: profile?.address?.country ?? 'France',
    },
  });

  const { mutateAsync: update } = useUpdateUserGiftProfileMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
  });

  const onSubmit = async (form: FormFields) => {
    const hasAddress = form.line1.trim() !== '' && form.postalCode.trim() !== '' && form.city.trim() !== '';
    const res = await update({
      input: {
        clothingSize: form.clothingSize.trim() || undefined,
        shoeSize: form.shoeSize.trim() || undefined,
        notes: form.notes.trim() || undefined,
        address: hasAddress
          ? {
              line1: form.line1.trim(),
              line2: form.line2.trim() || undefined,
              postalCode: form.postalCode.trim(),
              city: form.city.trim(),
              country: form.country.trim() || 'France',
            }
          : undefined,
      },
    });

    match(res.updateUserGiftProfile)
      .with({ __typename: 'UserGiftProfile' }, () => {
        addToast({ message: 'Infos cadeaux mises à jour', variant: 'info' });
        void queryClient.invalidateQueries({ queryKey: ['UserGiftProfile'] });
      })
      .with({ __typename: 'ValidationRejection' }, rejection =>
        addToast({ message: rejection.errors[0]?.message ?? 'Champs invalides', variant: 'error' }),
      )
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  return (
    <Card>
      <Loader loading={isLoading}>
        <Subtitle>Pour mes cadeaux</Subtitle>
        <Alert severity="info" icon={<CardGiftcardIcon />} sx={{ mb: 2 }}>
          Tailles et notes sont visibles par les participants de vos listes. L’adresse n’apparaît qu’aux personnes qui
          ont réservé un souhait.
        </Alert>

        <Stack component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ gap: 3 }}>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flexGrow: 1 }}>
              <TextField
                {...register('clothingSize')}
                label="Taille vêtements"
                fullWidth
                placeholder="M, 38, 12 ans…"
              />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <TextField {...register('shoeSize')} label="Pointure" fullWidth placeholder="42" />
            </Box>
          </Stack>

          <TextField
            {...register('notes')}
            label="Allergies et notes"
            fullWidth
            multiline
            minRows={2}
            placeholder="Allergie au latex, pas de parfum…"
          />

          <Typography variant="subtitle2" color="text.secondary">
            Adresse de livraison
          </Typography>

          <TextField {...register('line1')} label="Adresse" fullWidth placeholder="12 rue des Fleurs" />
          <TextField {...register('line2')} label="Complément" fullWidth placeholder="Bâtiment, étage…" />
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flexGrow: 1 }}>
              <TextField {...register('postalCode')} label="Code postal" fullWidth placeholder="75011" />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <TextField {...register('city')} label="Ville" fullWidth placeholder="Paris" />
            </Box>
          </Stack>
          <TextField {...register('country')} label="Pays" fullWidth />

          <Stack direction="row" sx={{ justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              loading={isSubmitting}
              loadingPosition="start"
              disabled={isSubmitting}
              startIcon={<SaveIcon />}
            >
              Enregistrer
            </Button>
          </Stack>
        </Stack>
      </Loader>
    </Card>
  );
};
