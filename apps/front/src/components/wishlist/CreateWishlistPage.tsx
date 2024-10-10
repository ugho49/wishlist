import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import DeleteIcon from '@mui/icons-material/Delete'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import SaveIcon from '@mui/icons-material/Save'
import { LoadingButton } from '@mui/lab'
import {
  Avatar,
  Box,
  Button,
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
  TextField,
  useTheme,
} from '@mui/material'
import Collapse from '@mui/material/Collapse'
import Link from '@mui/material/Link'
import { useMutation } from '@tanstack/react-query'
import { MAX_EVENTS_BY_LIST, MiniEventDto } from '@wishlist/common-types'
import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { RootState } from '../../core'
import { useAvailableEvents } from '../../hooks/domain/useAvailableEvents'
import { useEventById } from '../../hooks/domain/useEventById'
import { useApi } from '../../hooks/useApi'
import { useCustomSearchParams } from '../../hooks/useCustomSearchParams'
import { useToast } from '../../hooks/useToast'
import { Card } from '../common/Card'
import { CharsRemaining } from '../common/CharsRemaining'
import { ConfirmCheckbox } from '../common/ConfirmCheckbox'
import { InputLabel } from '../common/InputLabel'
import { Title } from '../common/Title'
import { SearchEventSelect } from '../event/SearchEventSelect'
import { WishlistLogoActions } from './WishlistLogoActions'

type QueryParamType = { 'from-event'?: string }

const steps = ['Informations', 'Evènements']

const mapState = (state: RootState) => state.userProfile.firstName

export const CreateWishlistPage = () => {
  const theme = useTheme()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const userFirstName = useSelector(mapState)
  const [queryParams] = useCustomSearchParams<QueryParamType>()
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showAdvancedParams, setShowAdvancedParams] = useState(false)
  const [hideItems, setHideItems] = useState(true)
  const [events, setEvents] = useState<MiniEventDto[]>([])
  const [logo, setLogo] = useState<File | undefined>()
  const api = useApi()

  const { events: availableEvents, loading: availableEventsLoading } = useAvailableEvents()
  const { event: eventFromUrl } = useEventById(queryParams['from-event'])

  const nextStepEnabled = title?.trim() !== ''
  const createEnabled = events.length > 0

  useEffect(() => {
    setTitle(prev => {
      if (prev !== '' || !userFirstName) return prev
      return `Liste de ${userFirstName}`
    })
  }, [userFirstName])

  useEffect(() => {
    if (eventFromUrl !== undefined) {
      setEvents(prev => [...prev, eventFromUrl])
    }
  }, [eventFromUrl])

  const { mutateAsync: createWishlist, isPending: loading } = useMutation({
    mutationKey: ['wishlist.create'],
    mutationFn: () =>
      api.wishlist.create(
        {
          title,
          description: description === '' ? undefined : description,
          hide_items: hideItems,
          event_ids: events.map(e => e.id),
          items: [],
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
                  placeholder="Nom de ma liste"
                  helperText={<CharsRemaining max={100} value={title} />}
                  onChange={e => setTitle(e.target.value)}
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
                  onChange={e => setDescription(e.target.value)}
                />
              </Box>

              <Stack alignItems="center">
                <Link
                  variant="body2"
                  component="button"
                  onClick={e => {
                    e.preventDefault()
                    setShowAdvancedParams(!showAdvancedParams)
                  }}
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  {showAdvancedParams ? 'Masquer les paramètres avancés' : 'Afficher les paramètres avancés'}
                  {showAdvancedParams ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </Link>
              </Stack>

              <Collapse in={showAdvancedParams}>
                <Stack gap={3}>
                  <Box>
                    <InputLabel>Révéler les Sélections</InputLabel>
                    <FormControlLabel
                      control={
                        <ConfirmCheckbox
                          checked={!hideItems}
                          onChange={checked => setHideItems(!checked)}
                          disabled={loading}
                          confirmTitle="⚠️Préférez-vous garder la surprise ? ⚠️"
                          confirmText={
                            <>
                              <p>
                                Cette action a pour conséquence de vous montrer les souhaits de votre liste qui ont été
                                réservés par les autres. Cela enlève toute la surprise de la liste.
                              </p>
                              <p>Dans la majorité des cas ce paramètre ne vous est pas utile.</p>
                              <p>
                                <b>Exemple de cas d'utilisation:</b> Gérer la liste d'un enfant qui n'a pas de compte
                              </p>
                              <p>
                                <b>Attention</b> ce paramètre ne pourra pas être changé après la création.
                              </p>
                            </>
                          }
                        />
                      }
                      label="Cochez cette case pour découvrir qui a sélectionné des souhaits sur votre liste"
                    />
                  </Box>
                  {!hideItems && (
                    <WishlistLogoActions
                      logoUrl={logo ? URL.createObjectURL(logo) : undefined}
                      loading={loading}
                      onLogoChange={file => setLogo(file)}
                      onLogoRemove={() => setLogo(undefined)}
                    />
                  )}
                </Stack>
              </Collapse>
            </Stack>
          )}

          {step === 2 && (
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
                            <Avatar
                              sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.background.paper }}
                            >
                              <CalendarMonthIcon />
                            </Avatar>
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
            {step !== 2 && (
              <Button
                onClick={() => setStep(prev => prev + 1)}
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
                loadingPosition="end"
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
  )
}
