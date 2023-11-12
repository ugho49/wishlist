import React, { FormEvent, forwardRef, useEffect, useState } from 'react';
import { AddItemInputDto, ItemDto } from '@wishlist/common-types';
import {
  AppBar,
  Avatar,
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
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { CharsRemaining } from '../common/CharsRemaining';
import { InputLabel } from '../common/InputLabel';
import { LoadingButton } from '@mui/lab';
import { isValidUrl, useApi, useToast } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { Rating } from '../common/Rating';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { TidyURL } from 'tidy-url';

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
  const { addToast } = useToast();
  const api = useApi(wishlistApiRef);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [pictureUrl, setPictureUrl] = useState('');
  const [validPictureUrl, setValidPictureUrl] = useState<boolean | undefined>(true);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const invalidUrl = url !== '' && !isValidUrl(url);
  const formIsValid = name.trim() !== '' && !invalidUrl && ((pictureUrl && validPictureUrl === true) || !pictureUrl);

  const resetForm = () => {
    setName('');
    setDescription('');
    setUrl('');
    setPictureUrl('');
    setScore(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const base: AddItemInputDto = {
        name,
        description: description === '' ? undefined : description,
        url: url === '' ? undefined : TidyURL.clean(url).url,
        picture_url: pictureUrl === '' ? undefined : pictureUrl,
        score: score === null ? undefined : score,
      };

      if (mode === 'create') {
        const newItem = await api.item.create({
          wishlist_id: wishlistId,
          ...base,
        });

        resetForm();
        handleCreate(newItem);
        addToast({ message: 'Souhait créé avec succès', variant: 'success' });
      }

      if (mode === 'edit') {
        await api.item.update(item.id, base);
        handleUpdate({ ...item, ...base });
        addToast({ message: 'Le souhait à bien été modifié', variant: 'success' });
      }

      handleClose();
    } catch (e) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!item) return;

    setName(item.name);
    setDescription(item.description || '');
    setUrl(item.url || '');
    setPictureUrl(item.picture_url || '');
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

          <Stack direction="row" flexWrap="wrap" gap={2}>
            <Box sx={{ flexGrow: 1 }}>
              <InputLabel>URL de photo</InputLabel>

              <TextField
                type="url"
                autoComplete="off"
                disabled={loading}
                fullWidth
                value={pictureUrl}
                inputProps={{ maxLength: 1000 }}
                placeholder="Ex: https://www.google.com"
                error={validPictureUrl === false}
                helperText={
                  <>
                    {validPictureUrl === false && <span>L'url saisie ne contient pas une image</span>}
                    {validPictureUrl === true && <CharsRemaining max={1000} value={url} />}
                  </>
                }
                onChange={(e) => {
                  setValidPictureUrl(undefined);
                  setPictureUrl(e.target.value);
                }}
              />
            </Box>

            {pictureUrl && validPictureUrl !== false && (
              <Box>
                <InputLabel>Preview</InputLabel>

                <Avatar
                  src={pictureUrl}
                  sx={(theme) => ({
                    height: '56px',
                    width: '56px',
                  })}
                  onLoad={() => setValidPictureUrl(true)}
                  onError={() => setValidPictureUrl(false)}
                >
                  <CameraAltIcon fontSize="small" />
                </Avatar>
              </Box>
            )}
          </Stack>

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
