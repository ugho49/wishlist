import React, { FormEvent, useState } from 'react';
import { DetailedEventDto, UpdateEventInputDto } from '@wishlist/common-types';
import { useApi, useToast } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { DateTime } from 'luxon';
import { Box, Stack, TextField } from '@mui/material';
import { InputLabel } from '../common/InputLabel';
import { CharsRemaining } from '../common/CharsRemaining';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import { MobileDatePicker } from '@mui/x-date-pickers';

export type EditEventInformationsProps = {
  event: DetailedEventDto;
  onChange: (updatedValues: Omit<UpdateEventInputDto, 'event_date'> & { event_date: string }) => void;
};

export const EditEventInformations = ({ event, onChange }: EditEventInformationsProps) => {
  const [loading, setLoading] = useState(false);
  const api = useApi(wishlistApiRef);
  const { addToast } = useToast();
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [eventDate, setEventDate] = useState<DateTime | null>(DateTime.fromISO(event.event_date));

  const updateEnabled = title.trim() !== '' && eventDate !== null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isoDate = eventDate?.toISODate() || DateTime.now().toISODate() || '';
      const body: UpdateEventInputDto = {
        title,
        description: description === '' ? undefined : description,
        event_date: new Date(isoDate),
      };
      await api.event.update(event.id, body);
      onChange({ ...body, event_date: body.event_date.toISOString() });
      addToast({ message: 'Évènement mis à jour', variant: 'info' });
    } catch (e) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack component="form" onSubmit={onSubmit} gap={3}>
      <Box>
        <InputLabel required>Titre</InputLabel>
        <TextField
          autoComplete="off"
          disabled={loading}
          fullWidth
          required
          value={title}
          inputProps={{ maxLength: 100 }}
          placeholder="La titre de votre évènement"
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

      <Stack>
        <InputLabel required>Date de l'évènement</InputLabel>
        <MobileDatePicker
          format="DDDD"
          value={eventDate}
          disabled={loading}
          onChange={(date) => setEventDate(date)}
          disablePast={true}
        />
      </Stack>

      <LoadingButton
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        color="secondary"
        loading={loading}
        loadingPosition="start"
        disabled={loading || !updateEnabled}
        startIcon={<SaveIcon />}
      >
        Mettre à jour
      </LoadingButton>
    </Stack>
  );
};
