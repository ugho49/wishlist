import { Box, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import React, { FormEvent, useEffect, useState } from 'react';
import { useApi, useToast } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { useAsync } from 'react-use';
import { Loader } from '../common/Loader';
import { InputLabel } from '../common/InputLabel';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';

export const UserTabNotifications = () => {
  const { addToast } = useToast();
  const api = useApi(wishlistApiRef);
  const [loading, setLoading] = useState(false);
  const [dailyNewItemNotification, setDailyNewItemNotification] = useState(true);

  const { value, loading: loadingNotificationSettings } = useAsync(() => api.user.getEmailSettings(), []);

  useEffect(() => {
    if (value) {
      setDailyNewItemNotification(value.daily_new_item_notification);
    }
  }, [value]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.user.updateUserEmailSettings({
        daily_new_item_notification: dailyNewItemNotification,
      });

      addToast({ message: 'Préférences de notification mis à jour', variant: 'info' });
    } catch (e) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Loader loading={loadingNotificationSettings}>
      <Stack component="form" onSubmit={onSubmit} noValidate gap={3}>
        <Box>
          <InputLabel>Notifications de mail</InputLabel>
          <FormControlLabel
            control={
              <Checkbox
                checked={dailyNewItemNotification}
                onChange={(e) => setDailyNewItemNotification(e.target.checked)}
                disabled={loading}
              />
            }
            label={
              <Stack>
                <Typography variant="body1">Recevoir les mails quotidien d'ajout de nouveaux souhaits</Typography>
                <Typography variant="caption">
                  Utile pour ne pas avoir à se connecter tous les jours si rien ne change
                </Typography>
              </Stack>
            }
          />
        </Box>

        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          color="secondary"
          loading={loading}
          loadingPosition="start"
          disabled={loading}
          startIcon={<SaveIcon />}
        >
          Changer les paramètres de notifications
        </LoadingButton>
      </Stack>
    </Loader>
  );
};
