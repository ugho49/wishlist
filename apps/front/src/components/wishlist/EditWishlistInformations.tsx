import React, { FormEvent, useMemo, useState } from 'react';
import { DetailedWishlistDto, UpdateWishlistInputDto } from '@wishlist/common-types';
import { Box, Stack, TextField } from '@mui/material';
import { useApi, useToast } from '@wishlist-front/hooks';
import { InputLabel } from '../common/InputLabel';
import { CharsRemaining } from '../common/CharsRemaining';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import { WishlistLogoActions } from './WishlistLogoActions';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export type EditWishlistInformationsProps = {
  wishlist: DetailedWishlistDto;
};

export const EditWishlistInformations = ({ wishlist }: EditWishlistInformationsProps) => {
  const api = useApi();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [title, setTitle] = useState(wishlist.title);
  const [description, setDescription] = useState(wishlist.description);
  const [logoUrl, setLogoUrl] = useState(wishlist.logo_url);

  const updateEnabled = title.trim() !== '';

  const { mutateAsync: updateWishlist, isPending: updateWishlistPending } = useMutation({
    mutationKey: ['wishlist.update', { id: wishlist.id }],
    mutationFn: (data: UpdateWishlistInputDto) => api.wishlist.update(wishlist.id, data),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: (_output, data) => {
      addToast({ message: 'Liste mis à jour', variant: 'info' });

      queryClient.setQueryData(['wishlist', { id: wishlist.id }], (old: DetailedWishlistDto) => ({
        ...old,
        ...data,
      }));
    },
  });

  const { mutateAsync: uploadLogo, isPending: uploadLogoPending } = useMutation({
    mutationKey: ['wishlist.uploadLogo', { id: wishlist.id }],
    mutationFn: (file: File) => api.wishlist.uploadLogo(wishlist.id, file),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: (output) => {
      setLogoUrl(output.logo_url);
      addToast({ message: 'Logo mis à jour', variant: 'info' });

      queryClient.setQueryData(['wishlist', { id: wishlist.id }], (old: DetailedWishlistDto) => ({
        ...old,
        logo_url: output.logo_url,
      }));
    },
  });

  const { mutateAsync: removeLogo, isPending: removeLogoPending } = useMutation({
    mutationKey: ['wishlist.removeLogo', { id: wishlist.id }],
    mutationFn: () => api.wishlist.removeLogo(wishlist.id),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: () => {
      setLogoUrl(undefined);
      addToast({ message: 'Logo supprimé', variant: 'info' });
      queryClient.setQueryData(['wishlist', { id: wishlist.id }], (old: DetailedWishlistDto) => ({
        ...old,
        logo_url: undefined,
      }));
    },
  });

  const loading = useMemo(
    () => removeLogoPending || uploadLogoPending || updateWishlistPending,
    [removeLogoPending, uploadLogoPending, updateWishlistPending],
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const body: UpdateWishlistInputDto = { title, description: description === '' ? undefined : description };
    await updateWishlist(body);
  };

  return (
    <Stack>
      {!wishlist.config.hide_items && (
        <Box marginBottom={3}>
          <WishlistLogoActions
            loading={loading}
            logoUrl={logoUrl}
            onLogoChange={(file) => uploadLogo(file)}
            onLogoRemove={() => removeLogo()}
          />
        </Box>
      )}
      <Stack component="form" onSubmit={onSubmit} gap={3}>
        <Box>
          <InputLabel required>Titre</InputLabel>
          <TextField
            autoComplete="off"
            disabled={loading}
            fullWidth
            required
            value={title}
            inputProps={{ maxLength: 100 }}
            placeholder="Ma super liste"
            helperText={<CharsRemaining max={100} value={title} />}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Box>

        <Box>
          <InputLabel>Description</InputLabel>
          <TextField
            autoComplete="off"
            disabled={loading}
            fullWidth
            multiline
            minRows={4}
            value={description}
            inputProps={{ maxLength: 2000 }}
            placeholder="Une petite description ..."
            helperText={<CharsRemaining max={2000} value={description} />}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Box>

        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          color="secondary"
          loading={loading}
          loadingPosition="start"
          disabled={loading || !updateEnabled}
          startIcon={<SaveIcon />}
        >
          Mettre à jour
        </LoadingButton>
      </Stack>
    </Stack>
  );
};
