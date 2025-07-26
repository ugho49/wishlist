import type { MiniEventDto } from '@wishlist/common'

import type { RootState } from '../../core'

import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone'
import DeleteIcon from '@mui/icons-material/Delete'
import Diversity1TwoToneIcon from '@mui/icons-material/Diversity1TwoTone'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import SaveIcon from '@mui/icons-material/Save'
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  OutlinedInput,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  useTheme,
} from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { MAX_EVENTS_BY_LIST } from '@wishlist/common'
import uniq from 'lodash/uniq'
import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useInterval } from 'usehooks-ts'

import { useApi, useAvailableEvents, useCustomSearchParams, useEventById, useToast } from '../../hooks'
import { getRandomPlaceholderName } from '../../utils/wishlist.utils'
import { Card } from '../common/Card'
import { CharsRemaining } from '../common/CharsRemaining'
import { InputLabel } from '../common/InputLabel'
import { Loader } from '../common/Loader'
import { Title } from '../common/Title'
import { EventIcon } from '../event/EventIcon'
import { SearchEventSelect } from '../event/SearchEventSelect'
import { WishlistLogoActions } from './WishlistLogoActions'

type QueryParamType = { 'from-event'?: string }

const steps = ['Type de liste', 'Informations', 'Evènements']

const mapState = (state: RootState) => state.userProfile.firstName

export const CreateWishlistPage = () => {
  const theme = useTheme()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const userFirstName = useSelector(mapState)
  const [queryParams] = useCustomSearchParams<QueryParamType>()
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
  const { event: eventFromUrl } = useEventById(queryParams['from-event'])

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
      navigate(`/wishlists/${wishlist.id}`)
    },
  })

  return (
    <Box>
      <Loader loading={userFirstName === undefined}>
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
              <Stack gap={2}>
                <InputLabel required>Pour qui créer la liste ?</InputLabel>

                <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <ListItem
                    disablePadding
                    onClick={() => {
                      setStep(2)
                      setOwnerName(userFirstName ?? '')
                      setHideItems(true)
                      setIsListForSomeoneElse(false)
                      setLogo(undefined)
                    }}
                  >
                    <Paper sx={{ width: '100%' }}>
                      <ListItemButton>
                        <ListItemAvatar>
                          <AccountCircleTwoToneIcon />
                        </ListItemAvatar>
                        <ListItemText
                          primary={<b>Pour moi</b>}
                          secondary="Je garde le secret et je fais ma liste pour moi-même"
                        />
                      </ListItemButton>
                    </Paper>
                  </ListItem>
                  <ListItem
                    disablePadding
                    onClick={() => {
                      setStep(2)
                      setOwnerName('')
                      setHideItems(false)
                      setIsListForSomeoneElse(true)
                    }}
                  >
                    <Paper sx={{ width: '100%' }}>
                      <ListItemButton>
                        <ListItemAvatar>
                          <Stack>
                            <Diversity1TwoToneIcon />
                          </Stack>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<b>Pour une autre personne (enfant, proche, ...)</b>}
                          secondary="Je créer la liste pour quelqu'un d'autre. Je peut choisir si je souhaite voir ou non les sélections faites par les autres participants"
                        />
                      </ListItemButton>
                    </Paper>
                  </ListItem>
                </List>
              </Stack>
            )}

            {step === 2 && (
              <Stack component="form" noValidate gap={3}>
                <Box>
                  <InputLabel required>Intitulé</InputLabel>
                  <FormControl fullWidth>
                    <OutlinedInput
                      autoComplete="off"
                      disabled={loading}
                      readOnly={!isListForSomeoneElse}
                      fullWidth
                      value={ownerName}
                      slotProps={{ input: { maxLength: 90 } }}
                      placeholder={namePlaceholder}
                      onChange={e => setOwnerName(e.target.value)}
                      startAdornment={<InputAdornment position="start">Liste de </InputAdornment>}
                    />
                  </FormControl>
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
                    onChange={e => setDescription(e.target.value)}
                  />
                </Box>

                {isListForSomeoneElse && (
                  <>
                    <Box>
                      <InputLabel>Révéler les Sélections</InputLabel>
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
            )}

            {step === 3 && (
              <Stack>
                <Box>
                  <InputLabel required>Gérer les évènements</InputLabel>

                  <SearchEventSelect
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
                              secondary={DateTime.fromISO(event.event_date).toLocaleString(DateTime.DATE_MED)}
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
                {step < 3 && (
                  <Button
                    onClick={() => setStep(prev => prev + 1)}
                    disabled={!nextStepEnabled}
                    endIcon={<KeyboardArrowRightIcon />}
                  >
                    Suivant
                  </Button>
                )}
                {step === 3 && (
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
