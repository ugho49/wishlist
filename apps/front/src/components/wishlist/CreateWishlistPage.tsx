import type { MiniEventDto } from '@wishlist/common'
import type { RootState } from '../../core'

import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone'
import DeleteIcon from '@mui/icons-material/Delete'
import Diversity1TwoToneIcon from '@mui/icons-material/Diversity1TwoTone'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import SaveIcon from '@mui/icons-material/Save'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
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
} from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { MAX_EVENTS_BY_LIST, parseISO } from '@wishlist/common'
import uniq from 'lodash/uniq'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale/fr'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useInterval } from 'usehooks-ts'

import { useApi, useAvailableEvents, useEventById, useToast } from '../../hooks'
import { getRandomPlaceholderName } from '../../utils/wishlist.utils'
import { Card } from '../common/Card'
import { CharsRemaining } from '../common/CharsRemaining'
import { InputLabel } from '../common/InputLabel'
import { Loader } from '../common/Loader'
import { Subtitle } from '../common/Subtitle'
import { Title } from '../common/Title'
import { EventIcon } from '../event/EventIcon'
import { SearchEventSelect } from '../event/SearchEventSelect'
import { WishlistLogoActions } from './WishlistLogoActions'

const steps = ['Type de liste', 'Informations', 'Evènements']

const OptionCard = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${theme.palette.grey[200]}`,
  padding: 16,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 24,
  textTransform: 'none',
  minHeight: 'auto',
  width: '100%',
  textAlign: 'left',
  '&:hover, &:focus': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.main + '08',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
}))

const OptionTitle = styled('span')(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  lineHeight: 1.4,
  display: 'block',
  marginBottom: '4px',
}))

const OptionDescription = styled('span')(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 400,
  color: theme.palette.text.secondary,
  lineHeight: 1.5,
  display: 'block',
}))

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
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
}))

const ListOfTitle = styled(Box)(({ theme }) => ({
  fontSize: '1.1rem',
  color: theme.palette.primary.main,
  lineHeight: 1.4,
}))

const mapState = (state: RootState) => state.userProfile.firstName

export const CreateWishlistPage = () => {
  const { addToast } = useToast()
  const navigate = useNavigate()
  const userFirstName = useSelector(mapState)
  const [step, setStep] = useState(1)
  const [ownerName, setOwnerName] = useState('')
  const [description, setDescription] = useState('')
  const [isListForSomeoneElse, setIsListForSomeoneElse] = useState(false)
  const [hideItems, setHideItems] = useState(true)
  const [events, setEvents] = useState<MiniEventDto[]>([])
  const [namePlaceholder, setNamePlaceholder] = useState<string>(getRandomPlaceholderName())
  const [logo, setLogo] = useState<File | undefined>()
  const api = useApi()

  useInterval(() => {
    setNamePlaceholder(getRandomPlaceholderName())
  }, 2000)

  const { events: availableEvents, loading: availableEventsLoading } = useAvailableEvents()
  const { fromEvent } = useSearch({ from: '/_authenticated/_with-layout/wishlists/new' })
  const { event: eventFromUrl } = useEventById(fromEvent)

  const nextStepEnabled = ownerName?.trim() !== ''
  const createEnabled = events.length > 0

  useEffect(() => {
    if (eventFromUrl !== undefined) {
      setEvents(prev => {
        if (prev.some(e => e.id === eventFromUrl.id)) return prev
        return [...prev, eventFromUrl]
      })
    }
  }, [eventFromUrl])

  const { mutateAsync: createWishlist, isPending: loading } = useMutation({
    mutationKey: ['wishlist.create'],
    mutationFn: () =>
      api.wishlist.create(
        {
          title: `Liste de ${ownerName}`,
          description: description === '' ? undefined : description,
          hide_items: hideItems,
          event_ids: uniq(events.map(e => e.id)),
        },
        logo,
      ),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: wishlist => {
      addToast({ message: 'Liste créé avec succès', variant: 'success' })
      void navigate({ to: '/wishlists/$wishlistId', params: { wishlistId: wishlist.id } })
    },
  })

  return (
    <Box>
      <Title>Créer une liste</Title>
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
                <Subtitle>Pour qui créer la liste ?</Subtitle>

                <Stack gap={2}>
                  <OptionCard
                    onClick={() => {
                      setStep(2)
                      setOwnerName(userFirstName!)
                      setHideItems(true)
                      setIsListForSomeoneElse(false)
                      setLogo(undefined)
                    }}
                  >
                    <IconWrapper>
                      <AccountCircleTwoToneIcon />
                    </IconWrapper>
                    <Box sx={{ flex: 1 }}>
                      <OptionTitle>Pour moi</OptionTitle>
                      <OptionDescription>Je garde le secret et je fais ma liste pour moi-même</OptionDescription>
                    </Box>
                  </OptionCard>

                  <OptionCard
                    onClick={() => {
                      setStep(2)
                      setOwnerName('')
                      setHideItems(false)
                      setIsListForSomeoneElse(true)
                    }}
                  >
                    <IconWrapper>
                      <Diversity1TwoToneIcon />
                    </IconWrapper>
                    <Box sx={{ flex: 1 }}>
                      <OptionTitle>Pour une autre personne</OptionTitle>
                      <OptionDescription>
                        Je crée la liste pour quelqu'un d'autre. Je peux choisir si je souhaite voir ou non les
                        sélections faites par les autres participants
                      </OptionDescription>
                    </Box>
                  </OptionCard>
                </Stack>
              </Box>
            )}

            {step === 2 && (
              <Box component="form" noValidate>
                <Subtitle>Ajouter les informations</Subtitle>

                <Stack gap={3}>
                  <Stack direction="row" gap={3} alignItems="center">
                    <ListOfTitle>Liste de</ListOfTitle>
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        label="Nom de la personne"
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

                  <Box>
                    <TextField
                      label="Description"
                      autoComplete="off"
                      disabled={loading}
                      fullWidth
                      multiline
                      minRows={4}
                      value={description}
                      slotProps={{ htmlInput: { maxLength: 2000 } }}
                      placeholder="Une petite description ..."
                      helperText={<CharsRemaining max={2000} value={description} />}
                      onChange={e => setDescription(e.target.value)}
                    />
                  </Box>

                  {isListForSomeoneElse && (
                    <>
                      <Box>
                        <InputLabel>Révéler les Sélections</InputLabel>
                        {!hideItems && (
                          <Alert severity="warning" icon={false} sx={{ marginBlock: '15px' }}>
                            En activant cette option, vous et tous les participants pourrez voir qui a coché quoi sur
                            cette liste.
                          </Alert>
                        )}
                        <FormControlLabel
                          label="Je veux voir ce que les gens cochent sur cette liste"
                          control={
                            <Checkbox
                              checked={!hideItems}
                              onChange={() => setHideItems(prev => !prev)}
                              disabled={loading}
                            />
                          }
                        />
                      </Box>
                      <WishlistLogoActions
                        logoUrl={logo ? URL.createObjectURL(logo) : undefined}
                        loading={loading}
                        onLogoChange={file => setLogo(file)}
                        onLogoRemove={() => setLogo(undefined)}
                      />
                    </>
                  )}
                </Stack>
              </Box>
            )}

            {step === 3 && (
              <Stack>
                <Subtitle>Gérer les évènements</Subtitle>

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
                              <EventIcon icon={event.icon} />
                            </ListItemAvatar>
                            <ListItemText
                              primary={<b>{event.title}</b>}
                              secondary={format(parseISO(event.event_date), 'PPP', { locale: fr })}
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
              <Stack direction="row" justifyContent="space-between" alignItems="center" marginTop={3}>
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
  )
}
