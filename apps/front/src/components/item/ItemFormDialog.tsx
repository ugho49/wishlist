import React, { FormEvent, forwardRef, useState } from 'react';
import { ItemDto } from '@wishlist/common-types';
import {
  AppBar,
  Box,
  Container,
  Dialog,
  IconButton,
  Rating,
  Slide,
  Stack,
  TextField,
  Theme,
  Toolbar,
  Typography,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { CharsRemaining } from '../common/CharsRemaining';
import { makeStyles } from '@mui/styles';
import { InputLabel } from '../common/InputLabel';
import { LoadingButton } from '@mui/lab';
import { useApi } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';

const Transition = forwardRef((props: TransitionProps & { children: React.ReactElement }, ref: React.Ref<unknown>) => {
  return <Slide direction="up" ref={ref} {...props} />;
});

type ModeProps<T> = T extends 'create'
  ? { mode: 'create'; item?: never; handleCreate: (item: ItemDto) => void; handleUpdate?: never }
  : T extends 'edit'
  ? { mode: 'edit'; item: ItemDto; handleCreate?: never; handleUpdate: (item: ItemDto) => void }
  : never;

export type ItemFormDialogProps = (ModeProps<'create'> | ModeProps<'edit'>) & {
  open: boolean;
  wishlistId: string;
  handleClose: () => void;
};

const useStyles = makeStyles((theme: Theme) => ({}));

export const ItemFormDialog = ({
  open,
  item,
  mode,
  handleClose,
  handleCreate,
  handleUpdate,
  wishlistId,
}: ItemFormDialogProps) => {
  const classes = useStyles();
  const api = useApi(wishlistApiRef);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const formIsValid = name.trim() !== '';

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
      if (mode === 'create') {
        const newItem = await api.item.create({
          name,
          wishlist_id: wishlistId,
          description: description === '' ? undefined : description,
          url: url === '' ? undefined : url,
          score: score || undefined,
        });

        resetForm();
        handleCreate(newItem);
      }

      if (mode === 'edit') {
        // const { data } = await api.updateBabyTimeline(babyId, editState.id, {
        //   type: timelineType,
        //   details: typeFormState,
        //   occurredAt: occurredAt.toISO(),
        // });
        // dispatch(editTimelineEntry(data));
      }

      handleClose();
    } catch (e) {
      console.error(e); // TODO handle error properly
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography sx={{ ml: 2, flex: 1, textTransform: 'uppercase' }} variant="h6" component="div">
            {mode === 'create' ? 'Ajouter un souhait' : 'Modifier le souhait'}
          </Typography>
          <IconButton edge="start" color="inherit" disabled={loading} onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ marginTop: '40px' }}>
        <Stack component="form" onSubmit={onSubmit} noValidate gap={3}>
          <Box>
            <InputLabel required>Nom</InputLabel>
            <TextField
              autoComplete="off"
              disabled={loading}
              fullWidth
              value={name}
              inputProps={{ maxLength: 40 }}
              placeholder="Nom du souhait"
              helperText={name && <CharsRemaining max={40} value={name} />}
              onChange={(e) => setName(e.target.value)}
            />
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
              helperText={description && <CharsRemaining max={60} value={description} />}
              onChange={(e) => setDescription(e.target.value)}
            />
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
              helperText={url && <CharsRemaining max={1000} value={url} />}
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
          {/* TODO --> */}
          {/*{mode === 'edit' && (*/}
          {/*  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>*/}
          {/*    <Button*/}
          {/*      variant="outlined"*/}
          {/*      color="error"*/}
          {/*      aria-label="delete"*/}
          {/*      disabled={loading}*/}
          {/*      size="small"*/}
          {/*      startIcon={<DeleteIcon />}*/}
          {/*      onClick={() => deleteEntry()}*/}
          {/*    >*/}
          {/*      Supprimer*/}
          {/*    </Button>*/}
          {/*  </Box>*/}
          {/*)}*/}
        </Stack>
      </Container>
    </Dialog>
  );
};