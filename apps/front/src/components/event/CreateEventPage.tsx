import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Container,
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
} from '@mui/material';
import { Title } from '../common/Title';
import { InputLabel } from '../common/InputLabel';
import { CharsRemaining } from '../common/CharsRemaining';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';
import PersonIcon from '@mui/icons-material/Person';
import { blue } from '@mui/material/colors';
import { SearchUserSelect } from '../user/SearchUserSelect';
import { AttendeeRole, MiniUserDto } from '@wishlist/common-types';
import DeleteIcon from '@mui/icons-material/Delete';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import { useSnackbar } from 'notistack';
import { useApi } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { useNavigate } from 'react-router-dom';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';

const steps = ['Informations', 'Participants'];

type Attendee = {
  user: string | MiniUserDto;
  role: AttendeeRole;
};

export const CreateEventPage = () => {
  const api = useApi(wishlistApiRef);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState<DateTime | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  const attendeeEmails = useMemo(
    () =>
      attendees.map((attendee) => {
        if (typeof attendee.user === 'string') return attendee.user;
        return attendee.user.email;
      }),
    [attendees]
  );

  const step2Enabled = title?.trim() !== '' && eventDate !== null;
  const createEnabled = attendees.length > 0;

  const createEvent = async () => {
    setLoading(true);
    try {
      const event = await api.event.create({
        title,
        description: description === '' ? undefined : description,
        event_date: eventDate?.toJSDate() || DateTime.now().toJSDate(),
        attendees: attendees.map((attendee) => ({
          email: typeof attendee.user === 'string' ? attendee.user : attendee.user.email,
          role: attendee.role,
        })),
      });

      enqueueSnackbar('Evènement créé avec succès', { variant: 'success' });
      navigate(`/events/${event.id}`);
    } catch (e) {
      enqueueSnackbar("Une erreur s'est produite", { variant: 'error' });
      setLoading(false);
    }
  };

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
      <Container maxWidth="sm" sx={{ marginTop: '40px' }}>
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
                placeholder="La titre de votre évènement"
                helperText={<CharsRemaining max={100} value={title} />}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Box>

            <Stack>
              <InputLabel required>Date de l'évènement</InputLabel>
              <MobileDatePicker
                inputFormat="DDDD"
                value={eventDate}
                disabled={loading}
                onChange={(date) => setEventDate(date)}
                disablePast={true}
                renderInput={(params) => <TextField {...params} placeholder="Choisir une date pour votre évènement" />}
              />
            </Stack>

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
          </Stack>
        )}

        {step === 2 && (
          <Stack gap={3}>
            <SearchUserSelect
              onChange={(val) =>
                setAttendees((prevState) => [
                  ...prevState,
                  {
                    user: val,
                    role: AttendeeRole.USER,
                  },
                ])
              }
              excludedEmails={attendeeEmails}
            />
            <List sx={{ pt: 0 }}>
              {attendees.map((attendee) => (
                <ListItem
                  key={typeof attendee.user === 'string' ? attendee.user : attendee.user.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => setAttendees((prev) => prev.filter((value) => value !== attendee))}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      typeof attendee.user === 'string'
                        ? attendee.user
                        : `${attendee.user.firstname} ${attendee.user.lastname}`
                    }
                    secondary={typeof attendee.user === 'string' ? '' : attendee.user.email}
                  />
                </ListItem>
              ))}
            </List>
          </Stack>
        )}

        <Stack direction="row" justifyContent="space-between" alignItems="center" marginTop={3}>
          <Button
            onClick={() => setStep((prev) => prev - 1)}
            disabled={step === 1}
            startIcon={<KeyboardArrowLeftIcon />}
          >
            Précédent
          </Button>
          {step === 1 && (
            <Button
              onClick={() => setStep((prev) => prev + 1)}
              disabled={!step2Enabled}
              endIcon={<KeyboardArrowRightIcon />}
            >
              Suivant
            </Button>
          )}
          {step === 2 && (
            <LoadingButton
              loading={loading}
              loadingPosition="start"
              disabled={!createEnabled}
              startIcon={<SaveIcon />}
              onClick={() => createEvent()}
            >
              Créer
            </LoadingButton>
          )}
        </Stack>
      </Container>
    </Box>
  );
};
