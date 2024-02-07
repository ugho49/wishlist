import React, { FormEvent, useState } from 'react';
import { DetailedWishlistDto, UpdateWishlistInputDto } from '@wishlist/common-types';
import { Box, Stack, TextField } from '@mui/material';
import { useToast } from '@wishlist/common-front';
import { useApi } from '@wishlist-front/hooks';
import { InputLabel } from '../common/InputLabel';
import { CharsRemaining } from '../common/CharsRemaining';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import { WishlistLogoActions } from './WishlistLogoActions';

export type EditWishlistInformationsProps = {
  wishlist: DetailedWishlistDto;
  onChange: (updatedValues: UpdateWishlistInputDto) => void;
};

export const EditWishlistInformations = ({ wishlist, onChange }: EditWishlistInformationsProps) => {
  const [loading, setLoading] = useState(false);
  const api = useApi();
  const { addToast } = useToast();
  const [title, setTitle] = useState(wishlist.title);
  const [description, setDescription] = useState(wishlist.description);
  const [logoUrl, setLogoUrl] = useState(wishlist.logo_url);

  const updateEnabled = title.trim() !== '';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body: UpdateWishlistInputDto = { title, description: description === '' ? undefined : description };
      await api.wishlist.update(wishlist.id, body);
      onChange(body);
      addToast({ message: 'Liste mis à jour', variant: 'info' });
    } catch (e) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const onLogoChange = async (file: File) => {
    setLoading(true);

    try {
      const res = await api.wishlist.uploadLogo(wishlist.id, file);
      setLogoUrl(res.logo_url);
      addToast({ message: 'Logo mis à jour', variant: 'info' });
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = (e as any)?.response?.data?.message as string;
      addToast({ message: error || "Une erreur s'est produite", variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const onLogoRemove = async () => {
    setLoading(true);
    try {
      await api.wishlist.removeLogo(wishlist.id);
      setLogoUrl(undefined);
      addToast({ message: 'Logo supprimé', variant: 'info' });
    } catch (e) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack>
      {!wishlist.config.hide_items && (
        <Box marginBottom={3}>
          <WishlistLogoActions
            loading={loading}
            logoUrl={logoUrl}
            onLogoChange={(file) => onLogoChange(file)}
            onLogoRemove={() => onLogoRemove()}
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
