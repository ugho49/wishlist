import type { MiniUserDto } from '@wishlist/common'
import type { RootState } from '../../core'

import { zodResolver } from '@hookform/resolvers/zod'
import DeleteIcon from '@mui/icons-material/Delete'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import SaveIcon from '@mui/icons-material/Save'
import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
} from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AttendeeRole } from '@wishlist/common'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { z } from 'zod'

import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { Card } from '../common/Card'
import { CharsRemaining } from '../common/CharsRemaining'
import { WishlistDatePicker } from '../common/DatePicker'
import { EmojiSelectorWithBadge } from '../common/EmojiSelectorWithBadge'
import { Subtitle } from '../common/Subtitle'
import { Title } from '../common/Title'
import { SearchUserSelect } from '../user/SearchUserSelect'
import { ListItemAttendee } from './ListItemAttendee'

const steps = ['Informations', 'Participants']

type Attendee = {
  user: string | MiniUserDto
  role: AttendeeRole
}

const schema = z.object({
  icon: z.string().optional(),
  title: z.string().min(1, 'Le titre est requis').max(100, '100 caractères maximum'),
  description: z.string().max(2000, '2000 caractères maximum').optional(),
  eventDate: z
    .custom<Date>()
    .nullable()
    .refine(date => date !== null, "La date de l'événement est requise"),
})

type FormFields = z.infer<typeof schema>

const mapState = (state: RootState) => state.auth.user?.email

export const CreateEventPage = () => {
  const api = useApi()
  const currentUserEmail = useSelector(mapState)
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [attendees, setAttendees] = useState<Attendee[]>([])

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      eventDate: null,
      icon: undefined,
    },
  })

  const formValues = watch()

  const attendeeEmails = useMemo(
    () =>
      attendees.map(attendee => {
        if (typeof attendee.user === 'string') return attendee.user
        return attendee.user.email
      }),
    [attendees],
  )

  const { mutateAsync: createEvent, isPending: loading } = useMutation({
    mutationKey: ['event.create'],
    mutationFn: () => {
      return api.event.create({
        title: formValues.title,
        description: formValues.description === '' ? undefined : formValues.description,
        icon: formValues.icon,
        event_date: formValues.eventDate!,
        attendees: attendees.map(attendee => ({
          email: typeof attendee.user === 'string' ? attendee.user : attendee.user.email,
          role: attendee.role,
        })),
      })
    },
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: output => {
      addToast({ message: 'Evènement créé avec succès', variant: 'success' })

      void navigate({ to: '/events/$eventId', params: { eventId: output.id } })
    },
  })

  return (
    <Box>
      <Title>Créer un évènement</Title>
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={step - 1} alternativeLabel>
          {steps.map((label, i) => (
            <Step key={label} completed={step > i + 1 || loading}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      <Container
        maxWidth={step === 1 ? 'md' : 'sm'}
        sx={{ marginTop: '40px', transition: 'max-width 0.3s ease-in-out' }}
      >
        <Card>
          {step === 1 && (
            <Stack component="form" noValidate gap={3}>
              <Subtitle sx={{ marginBottom: '16px' }}>Informations</Subtitle>

              <Stack direction="row" gap={2} alignItems="flex-start">
                <Controller
                  control={control}
                  name="icon"
                  render={({ field }) => (
                    <EmojiSelectorWithBadge value={field.value} onChange={value => field.onChange(value)} />
                  )}
                />

                <Box sx={{ flex: 1 }}>
                  <TextField
                    {...register('title')}
                    label="Titre"
                    autoComplete="off"
                    fullWidth
                    placeholder="Le titre de votre évènement"
                    error={!!errors.title}
                    helperText={errors.title?.message || <CharsRemaining max={100} value={formValues.title || ''} />}
                  />
                </Box>
              </Stack>

              <Stack>
                <Controller
                  control={control}
                  name="eventDate"
                  render={({ field }) => (
                    <WishlistDatePicker
                      label="Date de l'évènement"
                      format="DDDD"
                      value={field.value}
                      inputRef={field.ref}
                      onChange={date => field.onChange(date)}
                      disablePast
                      fullWidth
                      error={!!errors.eventDate}
                      helperText={errors.eventDate?.message}
                    />
                  )}
                />
              </Stack>

              <Box>
                <TextField
                  {...register('description')}
                  label="Description"
                  autoComplete="off"
                  fullWidth
                  multiline
                  minRows={4}
                  placeholder="Une petite description ..."
                  error={!!errors.description}
                  helperText={
                    errors.description?.message || <CharsRemaining max={2000} value={formValues.description || ''} />
                  }
                />
              </Box>
            </Stack>
          )}

          {step === 2 && (
            <Stack>
              <Subtitle>Gérer les participants</Subtitle>

              <Box>
                {/*TODO: add a way to add all attendees from a specific event
                - Open a dialog, select previous events
                - Get all attendees (add possibility to delete attendees if we don't want them)
                */}

                <SearchUserSelect
                  label="Rechercher un participant"
                  disabled={loading}
                  onChange={val => {
                    setAttendees(prevState => [
                      {
                        user: val,
                        role: AttendeeRole.USER,
                      },
                      ...prevState,
                    ])
                  }}
                  excludedEmails={[...attendeeEmails, currentUserEmail || '']}
                />
              </Box>

              {attendees.length > 0 && (
                <>
                  <Divider sx={{ marginTop: '20px', marginBottom: '10px' }} />

                  <List sx={{ maxHeight: '250px', overflow: 'auto' }}>
                    {attendees.map(attendee => (
                      <ListItem
                        className="animated zoomIn fast"
                        key={typeof attendee.user === 'string' ? attendee.user : attendee.user.id}
                        disablePadding
                        secondaryAction={
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => setAttendees(prev => prev.filter(value => value !== attendee))}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemButton>
                          <ListItemAttendee
                            role={attendee.role}
                            userName={
                              typeof attendee.user !== 'string'
                                ? `${attendee.user?.firstname} ${attendee.user?.lastname}`
                                : ''
                            }
                            isPending={typeof attendee.user === 'string'}
                            email={typeof attendee.user === 'string' ? attendee.user : attendee.user.email}
                            pictureUrl={typeof attendee.user !== 'string' ? attendee.user.picture_url : undefined}
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
            {step === 1 && (
              <Button onClick={handleSubmit(() => setStep(prev => prev + 1))} endIcon={<KeyboardArrowRightIcon />}>
                Suivant
              </Button>
            )}
            {step === 2 && (
              <Button
                variant="contained"
                loading={loading}
                loadingPosition="end"
                disabled={loading}
                endIcon={<SaveIcon />}
                onClick={() => createEvent()}
              >
                Créer
              </Button>
            )}
          </Stack>
        </Card>
      </Container>
    </Box>
  )
}
