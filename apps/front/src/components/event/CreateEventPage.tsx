import React, { useCallback, useMemo, useState } from 'react';
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
import { blue, orange } from '@mui/material/colors';
import { SearchUserSelect } from '../user/SearchUserSelect';
import { AttendeeRole, MiniUserDto } from '@wishlist/common-types';
import DeleteIcon from '@mui/icons-material/Delete';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import { useApi, useToast } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { useNavigate } from 'react-router-dom';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { RootState } from '../../core';
import { useSelector } from 'react-redux';
import { Card } from '../common/Card';

const steps = ['Informations', 'Participants'];

type Attendee = {
  user: string | MiniUserDto;
  role: AttendeeRole;
};

const mapState = (state: RootState) => ({ currentUserEmail: state.auth.user?.email });

export const CreateEventPage = () => {
  const api = useApi(wishlistApiRef);
  const { currentUserEmail } = useSelector(mapState);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState<DateTime | null>(DateTime.now());
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  const attendeeEmails = useMemo(
    () =>
      attendees.map((attendee) => {
        if (typeof attendee.user === 'string') return attendee.user;
        return attendee.user.email;
      }),
    [attendees]
  );

  const nextStepEnabled = title?.trim() !== '' && eventDate !== null;
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

      addToast({ message: 'Ev??nement cr???? avec succ??s', variant: 'success' });
      navigate(`/events/${event.id}`);
    } catch (e) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
      setLoading(false);
    }
  };

  return (
    <Box>
      <Title>Cr??er un ??v??nement</Title>
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
                  placeholder="La titre de votre ??v??nement"
                  helperText={<CharsRemaining max={100} value={title} />}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Box>

              <Stack>
                <InputLabel required>Date de l'??v??nement</InputLabel>
                <MobileDatePicker
                  inputFormat="DDDD"
                  value={eventDate}
                  disabled={loading}
                  onChange={(date) => setEventDate(date)}
                  disablePast={true}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Choisir une date pour votre ??v??nement" />
                  )}
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
              <Box>
                <InputLabel required>G??rer les participants</InputLabel>

                {/*TODO: add a way to add all attendees from a specific event
                - Open a dialog, select previous events
                - Get all attendees (add possibility to delete attendees if we don't want them)
                */}

                <SearchUserSelect
                  disabled={loading}
                  onChange={(val) => {
                    console.log('newval', val);
                    setAttendees((prevState) => [
                      {
                        user: val,
                        role: AttendeeRole.USER,
                      },
                      ...prevState,
                    ]);
                  }}
                  excludedEmails={[...attendeeEmails, currentUserEmail || '']}
                />
              </Box>
              <List sx={{ pt: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {attendees.map((attendee) => (
                  <Card
                    variant="outlined"
                    sx={{ padding: 0 }}
                    key={typeof attendee.user === 'string' ? attendee.user : attendee.user.id}
                  >
                    <ListItem
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
                        <Avatar
                          sx={{
                            bgcolor: typeof attendee.user === 'string' ? orange[100] : blue[100],
                            color: typeof attendee.user === 'string' ? orange[600] : blue[600],
                          }}
                          src={typeof attendee.user !== 'string' ? attendee.user.picture_url : undefined}
                        >
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <b>
                            {typeof attendee.user === 'string'
                              ? 'Inviter le participant'
                              : `${attendee.user.firstname} ${attendee.user.lastname}`}
                          </b>
                        }
                        secondary={typeof attendee.user === 'string' ? attendee.user : attendee.user.email}
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
                  Pr??c??dent
                </Button>
              )}
            </Box>
            {step === 1 && (
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
                loadingPosition="end"
                disabled={!createEnabled || loading}
                endIcon={<SaveIcon />}
                onClick={() => createEvent()}
              >
                Cr??er
              </LoadingButton>
            )}
          </Stack>
        </Card>
      </Container>
    </Box>
  );
};
