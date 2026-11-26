import type { RootState } from '../../core/store';
import type { SelectableEvent } from '../event/SearchEventSelect';
import type { WishlistMode } from './wishlist-mode';

import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import DeleteIcon from '@mui/icons-material/Delete';
import Diversity1TwoToneIcon from '@mui/icons-material/Diversity1TwoTone';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Alert,
  alpha,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  Step,
  StepLabel,
  Stepper,
  styled,
  TextField,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { MAX_EVENTS_BY_LIST } from '@wishlist/common';
import clsx from 'clsx';
import uniq from 'lodash/uniq';
import { DateTime } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useInterval } from 'usehooks-ts';

import { createWishlistMultipart } from '../../api/upload';
import { isRejection, rejectionMessage, useEventSelectAvailableEventsQuery } from '../../gql';
import { useObjectUrl, useToast } from '../../hooks';
import { getRandomPlaceholderName } from '../../utils/wishlist.utils';
import { Card } from '../common/Card';
import { Loader } from '../common/Loader';
import { Subtitle } from '../common/Subtitle';
import { TextareaMarkdown } from '../common/TextareaMarkdown';
import { Title } from '../common/Title';
import { EventIcon } from '../event/EventIcon';
import { SearchEventSelect } from '../event/SearchEventSelect';
import { WishlistModeNotice } from './WishlistModeNotice';
import { WishlistPreview } from './WishlistPreview';
import { WISHLIST_MODE_LABELS } from './wishlist-mode';

const steps = ['Type de liste', 'Informations', 'Evènements'];

const OptionCard = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${theme.palette.grey[200]}`,
  padding: 16,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  gap: 24,
  textTransform: 'none',
  minHeight: 'auto',
  width: '100%',
  textAlign: 'left',
  '&:hover, &:focus, &.selected': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.main + '08',
  },
  '&:hover, &:focus': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
}));

const OptionBody = styled('span')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
});

const OptionHeader = styled('span')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: 12,
  rowGap: 4,
  marginBottom: 4,
});

const OptionTitle = styled('span')(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  lineHeight: 1.4,
}));

const ModeBadge = styled('span')(({ theme }) => ({
  padding: '2px 10px',
  borderRadius: 999,
  fontSize: '0.75rem',
  fontWeight: 500,
  lineHeight: 1.6,
  color: theme.palette.primary.main,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
}));

const OptionDescription = styled('span')(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 400,
  color: theme.palette.text.secondary,
  lineHeight: 1.5,
  display: 'block',
}));

const OptionFacts = styled('span')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  marginTop: 10,
  fontSize: '0.825rem',
  lineHeight: 1.4,
  color: theme.palette.text.primary,
  '& > span': {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
  },
  '& svg': {
    flexShrink: 0,
    fontSize: 18,
    color: theme.palette.primary.main,
  },
}));

const IconWrapper = styled('span')(({ theme }) => ({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  width: 50,
  height: 50,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main + '15',
  color: theme.palette.primary.main,
  '& svg': {
    fontSize: 24,
  },
  // Leaves the room to the text on small screens
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const LockedHint = styled('p')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  margin: 0,
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
  '& svg': {
    fontSize: 16,
  },
}));

const ListOfTitle = styled(Box)(({ theme }) => ({
  fontSize: '1.1rem',
  color: theme.palette.primary.main,
  lineHeight: 1.4,
}));

const mapState = (state: RootState) => state.userProfile;

export const CreateWishlistPage = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { firstName: userFirstName, pictureUrl: userPictureUrl } = useSelector(mapState);
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<WishlistMode | undefined>();
  const [ownerName, setOwnerName] = useState('');
  const [description, setDescription] = useState('');
  const [events, setEvents] = useState<SelectableEvent[]>([]);
  const [namePlaceholder, setNamePlaceholder] = useState<string>(getRandomPlaceholderName());
  const [logo, setLogo] = useState<File | undefined>();
  const logoUrl = useObjectUrl(logo);
  const hideItems = mode !== 'shared';

  useInterval(() => {
    setNamePlaceholder(getRandomPlaceholderName());
  }, 2000);

  const { data: availableEventsData, isLoading: availableEventsLoading } = useEventSelectAvailableEventsQuery(
    { filters: { limit: 100, onlyFuture: true } },
    { select: d => d.events },
  );
  const availableEvents = useMemo(
    () => (availableEventsData?.__typename === 'GetEventsPagedResponse' ? availableEventsData.data : []),
    [availableEventsData],
  );
  const availableEventsRejection =
    availableEventsData && isRejection(availableEventsData) ? availableEventsData : undefined;
  const { fromEvent } = useSearch({ from: '/_authenticated/_with-layout/wishlists/new' });
  const eventFromUrl = fromEvent ? availableEvents.find(e => e.id === fromEvent) : undefined;

  const nextStepEnabled = ownerName?.trim() !== '';
  const createEnabled = events.length > 0;

  useEffect(() => {
    if (eventFromUrl !== undefined) {
      setEvents(prev => {
        if (prev.some(e => e.id === eventFromUrl.id)) return prev;
        return [...prev, eventFromUrl];
      });
    }
  }, [eventFromUrl]);

  // Coming back to step 1 and picking the same mode keeps what was already typed
  const chooseMode = (newMode: WishlistMode) => {
    if (newMode !== mode) {
      setMode(newMode);
      setOwnerName(newMode === 'surprise' ? (userFirstName ?? '') : '');
      setLogo(undefined);
    }
    setStep(2);
  };

  const { mutateAsync: createWishlist, isPending: loading } = useMutation({
    mutationFn: () =>
      createWishlistMultipart(
        {
          title: `Liste de ${ownerName.trim()}`,
          description: description === '' ? undefined : description,
          hide_items: hideItems,
          event_ids: uniq(events.map(e => e.id)),
        },
        logo,
      ),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: wishlist => {
      addToast({ message: 'Liste créé avec succès', variant: 'success' });
      void navigate({
        to: '/wishlists/$wishlistId',
        params: { wishlistId: wishlist.id },
        search: fromEvent ? { fromEvent } : {},
      });
    },
  });

  return (
    <Box>
      <Title breadcrumbs={[{ label: 'Mes listes', to: '/wishlists' }, { label: 'Créer une liste' }]}>
        Créer une liste
      </Title>
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={step - 1} alternativeLabel>
          {(fromEvent ? steps.slice(0, -1) : steps).map((label, i) => (
            <Step key={label} completed={step > i + 1 || loading}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      <Loader loading={userFirstName === undefined}>
        <Container maxWidth="sm" sx={{ marginTop: '40px' }}>
          <Card>
            {step === 1 && (
              <Box>
                <Subtitle>Qui va recevoir les cadeaux ?</Subtitle>

                <Stack sx={{ gap: 2 }}>
                  <OptionCard
                    className={clsx(mode === 'surprise' && 'selected')}
                    onClick={() => chooseMode('surprise')}
                  >
                    <IconWrapper>
                      <AccountCircleTwoToneIcon />
                    </IconWrapper>
                    <OptionBody>
                      <OptionHeader>
                        <OptionTitle>Moi</OptionTitle>
                        <ModeBadge>{WISHLIST_MODE_LABELS.surprise}</ModeBadge>
                      </OptionHeader>
                      <OptionDescription>Votre liste de souhaits pour un anniversaire, Noël…</OptionDescription>
                      <OptionFacts>
                        <span>
                          <VisibilityOutlinedIcon />
                          Les participants de vos évènements voient vos souhaits et les réservent
                        </span>
                        <span>
                          <VisibilityOffOutlinedIcon />
                          Vous ne voyez pas qui offre quoi : la surprise reste entière
                        </span>
                      </OptionFacts>
                    </OptionBody>
                  </OptionCard>

                  <OptionCard className={clsx(mode === 'shared' && 'selected')} onClick={() => chooseMode('shared')}>
                    <IconWrapper>
                      <Diversity1TwoToneIcon />
                    </IconWrapper>
                    <OptionBody>
                      <OptionHeader>
                        <OptionTitle>Quelqu'un d'autre</OptionTitle>
                        <ModeBadge>{WISHLIST_MODE_LABELS.shared}</ModeBadge>
                      </OptionHeader>
                      <OptionDescription>
                        Un enfant, un proche sans compte… Vous gérez sa liste à sa place.
                      </OptionDescription>
                      <OptionFacts>
                        <span>
                          <VisibilityOutlinedIcon />
                          Vous voyez qui réserve quoi, pour coordonner les cadeaux
                        </span>
                        <span>
                          <PersonAddAltOutlinedIcon />
                          Vous pouvez ajouter un co-gestionnaire, l'autre parent par exemple
                        </span>
                      </OptionFacts>
                    </OptionBody>
                  </OptionCard>

                  <LockedHint>
                    <LockOutlinedIcon />
                    Ce choix ne pourra plus être modifié après la création.
                  </LockedHint>
                </Stack>
              </Box>
            )}

            {step === 2 && mode && (
              <Box component="form" noValidate>
                <Subtitle>Ajouter les informations</Subtitle>

                <Stack sx={{ gap: 3 }}>
                  <WishlistPreview
                    title={`Liste de ${ownerName.trim() || '…'}`}
                    logoUrl={logoUrl}
                    hideItems={hideItems}
                    ownerPictureUrl={userPictureUrl}
                    loading={loading}
                    onLogoChange={file => setLogo(file)}
                    onLogoRemove={() => setLogo(undefined)}
                  />

                  {/* In surprise mode the list takes the user's first name, shown in the preview (editable later) */}
                  {mode === 'shared' && (
                    <Stack direction="row" sx={{ gap: 3, alignItems: 'center' }}>
                      <ListOfTitle>Liste de</ListOfTitle>
                      <Box sx={{ flex: 1 }}>
                        <TextField
                          label="Prénom de la personne"
                          required
                          autoComplete="off"
                          disabled={loading}
                          fullWidth
                          value={ownerName}
                          slotProps={{ htmlInput: { maxLength: 90 } }}
                          placeholder={namePlaceholder}
                          onChange={e => setOwnerName(e.target.value)}
                        />
                      </Box>
                    </Stack>
                  )}

                  <Box>
                    <TextareaMarkdown
                      label="Description"
                      autoComplete="off"
                      disabled={loading}
                      fullWidth
                      value={description}
                      maxLength={2000}
                      placeholder="Une petite description (supporte le markdown) ..."
                      onChange={e => setDescription(e.target.value)}
                    />
                  </Box>

                  <WishlistModeNotice mode={mode} />
                </Stack>
              </Box>
            )}

            {step === 3 && (
              <Stack>
                <Subtitle>Gérer les évènements</Subtitle>

                {availableEventsRejection && (
                  <Alert severity="error" sx={{ marginBottom: '15px' }}>
                    {rejectionMessage(availableEventsRejection)}
                  </Alert>
                )}

                <Box>
                  <SearchEventSelect
                    label="Ajouter un évènement"
                    loading={availableEventsLoading}
                    disabled={loading || events.length === MAX_EVENTS_BY_LIST}
                    options={availableEvents}
                    excludedEventIds={events.map(e => e.id)}
                    onChange={val => setEvents(prevState => [...prevState, val])}
                  />
                </Box>
                {events.length > 0 && (
                  <>
                    <Divider sx={{ marginTop: '20px', marginBottom: '10px' }} />

                    <List>
                      {events.map(event => (
                        <ListItem
                          key={event.id}
                          disablePadding
                          className="animated zoomIn fast"
                          secondaryAction={
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => setEvents(prev => prev.filter(value => value.id !== event.id))}
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                        >
                          <ListItemButton>
                            <ListItemAvatar>
                              <EventIcon icon={event.icon ?? undefined} />
                            </ListItemAvatar>
                            <ListItemText
                              primary={<b>{event.title}</b>}
                              secondary={DateTime.fromISO(event.eventDate).toLocaleString(DateTime.DATE_MED)}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Stack>
            )}

            {step > 1 && (
              <Stack
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 3,
                }}
              >
                <Box>
                  {step > 1 && (
                    <Button
                      onClick={() => setStep(prev => prev - 1)}
                      disabled={step === 1}
                      startIcon={<KeyboardArrowLeftIcon />}
                    >
                      Précédent
                    </Button>
                  )}
                </Box>
                {step < 3 && !fromEvent && (
                  <Button
                    onClick={() => setStep(prev => prev + 1)}
                    disabled={!nextStepEnabled}
                    endIcon={<KeyboardArrowRightIcon />}
                  >
                    Suivant
                  </Button>
                )}
                {(step === 3 || (fromEvent && step === 2)) && (
                  <Button
                    variant="contained"
                    loading={loading}
                    loadingPosition="end"
                    disabled={!createEnabled || loading}
                    endIcon={<SaveIcon />}
                    onClick={() => createWishlist()}
                  >
                    Créer
                  </Button>
                )}
              </Stack>
            )}
          </Card>
        </Container>
      </Loader>
    </Box>
  );
};
