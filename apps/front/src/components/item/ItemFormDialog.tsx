import React, { FormEvent, forwardRef, useEffect, useState } from 'react';
import { AddItemInputDto, ItemDto } from '@wishlist/common-types';
import {
  AppBar,
  Box,
  Container,
  Dialog,
  IconButton,
  Slide,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { CharsRemaining } from '../common/CharsRemaining';
import { InputLabel } from '../common/InputLabel';
import { LoadingButton } from '@mui/lab';
import { isValidUrl, useApi } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { useSnackbar } from 'notistack';
import { Rating } from '../common/Rating';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const Transition = forwardRef((props: TransitionProps & { children: React.ReactElement }, ref: React.Ref<unknown>) => {
  const { children, ...other } = props;
  return <Slide direction="up" ref={ref} {...other} children={children} />;
});

type ModeProps<T> = T extends 'create'
  ? { mode: 'create'; item?: never; handleCreate: (item: ItemDto) => void; handleUpdate?: never }
  : T extends 'edit'
  ? { mode: 'edit'; item: ItemDto; handleCreate?: never; handleUpdate: (item: ItemDto) => void }
  : never;

export type ItemFormDialogProps = (ModeProps<'create'> | ModeProps<'edit'>) & {
  open: boolean;
  wishlistId: string;
  title: string;
  handleClose: () => void;
};

export const ItemFormDialog = ({
  title,
  open,
  item,
  mode,
  handleClose,
  handleCreate,
  handleUpdate,
  wishlistId,
}: ItemFormDialogProps) => {
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { enqueueSnackbar } = useSnackbar();
  const api = useApi(wishlistApiRef);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const invalidUrl = url !== '' && !isValidUrl(url);
  const formIsValid = name.trim() !== '' && !invalidUrl;

  const resetForm = () => {
    setName('');
    setDescription('');
    setUrl('');
    setScore(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const base: AddItemInputDto = {
        name,
        description: description === '' ? undefined : description,
        url: url === '' ? undefined : url,
        score: score === null ? undefined : score,
      };

      if (mode === 'create') {
        const newItem = await api.item.create({
          wishlist_id: wishlistId,
          ...base,
        });

        resetForm();
        handleCreate(newItem);
        enqueueSnackbar('Souhait créé avec succès', { variant: 'success' });
      }

      if (mode === 'edit') {
        await api.item.update(item.id, base);
        handleUpdate({ ...item, ...base });
        enqueueSnackbar('Le souhait à bien été modifié', { variant: 'success' });
      }

      handleClose();
    } catch (e) {
      enqueueSnackbar("Une erreur s'est produite", { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!item) return;

    setName(item.name);
    setDescription(item.description || '');
    setUrl(item.url || '');
    setScore(item.score || null);
  }, [item]);

  return (
    <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography sx={{ ml: 2, flex: 1, textTransform: 'uppercase' }} variant="h6" component="div">
            {title}
          </Typography>
          <IconButton edge="start" color="inherit" disabled={loading} onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ marginTop: '40px' }}>
        <Stack component="form" onSubmit={onSubmit} noValidate gap={smallScreen ? 2 : 3}>
          <Box>
            <InputLabel required>Nom</InputLabel>
            <TextField
              autoComplete="off"
              disabled={loading}
              fullWidth
              value={name}
              inputProps={{ maxLength: 40 }}
              placeholder="Nom du souhait"
              helperText={<CharsRemaining max={40} value={name} />}
              onChange={(e) => setName(e.target.value)}
            />
            {/* TODO: suggest to "add size" if it's clothe */}
          </Box>

          <Box>
            <InputLabel>Détails</InputLabel>

            <TextField
              autoComplete="off"
              disabled={loading}
              fullWidth
              value={description}
              inputProps={{ maxLength: 60 }}
              placeholder="Ajouter du détail à votre souhait"
              helperText={<CharsRemaining max={60} value={description} />}
              onChange={(e) => setDescription(e.target.value)}
            />
            {/* TODO: suggest to "add size" if it's clothe */}
          </Box>

          <Box>
            <InputLabel>URL</InputLabel>

            <TextField
              type="url"
              autoComplete="off"
              disabled={loading}
              fullWidth
              value={url}
              inputProps={{ maxLength: 1000 }}
              placeholder="Ex: https://www.google.com"
              error={invalidUrl}
              helperText={
                <>
                  {invalidUrl && <span>L'url saisie n'est pas valide</span>}
                  {!invalidUrl && <CharsRemaining max={1000} value={url} />}
                </>
              }
              onChange={(e) => setUrl(e.target.value)}
            />
          </Box>

          <Box>
            <InputLabel>Niveau de préférence</InputLabel>

            <Rating value={score} disabled={loading} onChange={(_, value) => setScore(value)} size="large" />
          </Box>

          <LoadingButton
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            color="secondary"
            loading={loading}
            loadingPosition="start"
            disabled={loading || !formIsValid}
            startIcon={<SaveIcon />}
          >
            {mode === 'create' ? 'Ajouter' : 'Modifier'}
          </LoadingButton>
        </Stack>
      </Container>
    </Dialog>
  );
};
