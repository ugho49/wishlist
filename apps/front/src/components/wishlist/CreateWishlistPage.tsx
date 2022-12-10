import React, { useEffect, useMemo, useState } from 'react';
import { useApi, useCustomSearchParams, useToast } from '@wishlist/common-front';
import { MAX_EVENTS_BY_LIST, MiniEventDto } from '@wishlist/common-types';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { useAsync } from 'react-use';
import { Title } from '../common/Title';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { InputLabel } from '../common/InputLabel';
import { CharsRemaining } from '../common/CharsRemaining';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { DateTime } from 'luxon';
import { SearchEventSelect } from '../event/SearchEventSelect';
import { Card } from '../common/Card';

type QueryParamType = { 'from-event'?: string };

const steps = ['Informations', 'Evènements'];

export const CreateWishlistPage = () => {
  const theme = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [queryParams] = useCustomSearchParams<QueryParamType>();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hideItems, setHideItems] = useState(true);
  const [events, setEvents] = useState<MiniEventDto[]>([]);
  const api = useApi(wishlistApiRef);

  const { value } = useAsync(() => api.event.getAll({ limit: 100, only_future: true }), []);
  const availableEvents = useMemo(() => value?.resources || [], [value]);

  const nextStepEnabled = title?.trim() !== '';
  const createEnabled = events.length > 0;

  useEffect(() => {
    api.user.getInfo().then((user) =>
      setTitle((prev) => {
        if (prev !== '') return prev;
        return `Liste de ${user.firstname}`;
      })
    );
  }, [api.user]);

  useEffect(() => {
    if (queryParams['from-event']) {
      api.event.getById(queryParams['from-event']).then((value) => setEvents((prev) => [...prev, value]));
    }
  }, [api, queryParams]);

  const createWishlist = async () => {
    setLoading(true);
    try {
      const wishlist = await api.wishlist.create({
        title,
        description: description === '' ? undefined : description,
        hide_items: hideItems,
        event_ids: events.map((e) => e.id),
        items: [],
      });

      addToast({ message: 'Liste créé avec succès', variant: 'success' });
      navigate(`/wishlists/${wishlist.id}`);
    } catch (e) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
      setLoading(false);
    }
  };

  return (
    <Box>
      <Title>Créer une liste</Title>
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={step - 1} alternativeLabel>
          {steps.map((label, i) => (
            <Step key={label} completed={step > i + 1 || loading}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      <Container maxWidth="sm" sx={{ marginTop: '40px' }}>
        <Card>
          {step === 1 && (
            <Stack component="form" noValidate gap={3}>
              <Box>
                <InputLabel required>Titre</InputLabel>
                <TextField
                  autoComplete="off"
                  disabled={loading}
                  fullWidth
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

              <Box>
                <InputLabel>Paramètres avancés</InputLabel>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!hideItems}
                      onChange={(e) => setHideItems(!e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label={
                    <Stack gap={1}>
                      <Typography variant="body1">Rendre cette liste publique (Voir les éléments cochés ?)</Typography>
                      <Typography variant="caption">
                        <b>Attention</b> ce paramètre ne pourra pas être changé après la création. Ce paramètre est
                        utile pour gérer la liste de quelqu'un d'autre, un enfant, etc ...
                      </Typography>
                    </Stack>
                  }
                />
              </Box>
            </Stack>
          )}

          {step === 2 && (
            <Stack gap={3}>
              <Box>
                <InputLabel required>Gérer les évènements</InputLabel>

                <SearchEventSelect
                  disabled={loading || events.length === MAX_EVENTS_BY_LIST}
                  options={availableEvents}
                  excludedEventIds={events.map((e) => e.id)}
                  onChange={(val) => setEvents((prevState) => [...prevState, val])}
                />
              </Box>
              <List sx={{ pt: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {events.map((event) => (
                  <Card variant="outlined" sx={{ padding: 0 }} key={event.id}>
                    <ListItem
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => setEvents((prev) => prev.filter((value) => value.id !== event.id))}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.background.paper }}>
                          <CalendarMonthIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<b>{event.title}</b>}
                        secondary={DateTime.fromISO(event.event_date).toLocaleString(DateTime.DATE_MED)}
                      />
                    </ListItem>
                  </Card>
                ))}
              </List>
            </Stack>
          )}

          <Stack direction="row" justifyContent="space-between" alignItems="center" marginTop={3}>
            <Box>
              {step > 1 && (
                <Button
                  onClick={() => setStep((prev) => prev - 1)}
                  disabled={step === 1}
                  startIcon={<KeyboardArrowLeftIcon />}
                >
                  Précédent
                </Button>
              )}
            </Box>
            {step !== 2 && (
              <Button
                onClick={() => setStep((prev) => prev + 1)}
                disabled={!nextStepEnabled}
                endIcon={<KeyboardArrowRightIcon />}
              >
                Suivant
              </Button>
            )}
            {step === 2 && (
              <LoadingButton
                variant="contained"
                loading={loading}
                loadingPosition="start"
                disabled={!createEnabled || loading}
                endIcon={<SaveIcon />}
                onClick={() => createWishlist()}
              >
                Créer
              </LoadingButton>
            )}
          </Stack>
        </Card>
      </Container>
    </Box>
  );
};
