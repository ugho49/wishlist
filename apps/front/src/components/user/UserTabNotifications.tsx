import type { FormEvent, ReactNode } from 'react';

import CakeIcon from '@mui/icons-material/Cake';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import SaveIcon from '@mui/icons-material/Save';
import { Alert, Box, Button, Switch, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { match } from 'ts-pattern';

import {
  isRejection,
  rejectionMessage,
  rejectionPattern,
  useUpdateUserEmailSettingsMutation,
  useUserProfileEmailSettingsQuery,
} from '../../gql';
import { useToast } from '../../hooks/useToast';
import { Card } from '../common/Card';
import { Loader } from '../common/Loader';
import { Subtitle } from '../common/Subtitle';

const Intro = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  color: theme.palette.text.secondary,
}));

const Form = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}));

const Preference = styled('label')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  margin: 0,
  padding: theme.spacing(1.75, 2),
  borderRadius: 12,
  backgroundColor: theme.palette.grey[50],
  cursor: 'pointer',
}));

const IconBadge = styled(Box, { shouldForwardProp: prop => prop !== 'active' })<{ active: boolean }>(
  ({ theme, active }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: 40,
    height: 40,
    borderRadius: theme.shape.borderRadius,
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
    backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : theme.palette.grey[200],
  }),
);

const PreferenceText = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
});

const PreferenceTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  lineHeight: 1.3,
  color: theme.palette.text.primary,
}));

const PreferenceDescription = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(0.25),
  lineHeight: 1.4,
  color: theme.palette.text.secondary,
}));

const Actions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  paddingTop: theme.spacing(2),
}));

type PreferenceRowProps = {
  icon: ReactNode;
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
};

const PreferenceRow = ({ icon, title, description, checked, disabled, onChange }: PreferenceRowProps) => (
  <Preference>
    <IconBadge active={checked}>{icon}</IconBadge>
    <PreferenceText>
      <PreferenceTitle variant="body1">{title}</PreferenceTitle>
      <PreferenceDescription variant="body2">{description}</PreferenceDescription>
    </PreferenceText>
    <Switch
      checked={checked}
      disabled={disabled}
      edge="end"
      onChange={event => onChange(event.target.checked)}
      slotProps={{ input: { 'aria-label': title } }}
    />
  </Preference>
);

export const UserTabNotifications = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [dailyNewItemNotification, setDailyNewItemNotification] = useState(true);
  const [birthdayReminder, setBirthdayReminder] = useState(true);

  const { data, isLoading: loadingNotificationSettings } = useUserProfileEmailSettingsQuery(undefined, {
    select: d => d.currentUser,
  });
  const emailSettings = data?.__typename === 'User' ? data.emailSettings : undefined;
  const queryRejection = data && isRejection(data) ? data : undefined;

  const { mutateAsync: updateEmailSettings, isPending: loading } = useUpdateUserEmailSettingsMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
  });

  useEffect(() => {
    if (emailSettings) {
      setDailyNewItemNotification(emailSettings.dailyNewItemNotification);
      setBirthdayReminder(emailSettings.birthdayReminder);
    }
  }, [emailSettings]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const res = await updateEmailSettings({
      input: {
        dailyNewItemNotification,
        birthdayReminder,
      },
    });

    match(res.updateUserEmailSettings)
      .with({ __typename: 'UserEmailSettings' }, () => {
        addToast({ message: 'Préférences de notification mis à jour', variant: 'info' });
        void queryClient.invalidateQueries({ queryKey: ['UserProfileEmailSettings'] });
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  return (
    <Card>
      <Loader loading={loadingNotificationSettings}>
        <Subtitle sx={{ mb: 3 }}>Notifications par e-mail</Subtitle>
        <Intro variant="body2">Choisissez les e-mails que vous souhaitez recevoir.</Intro>

        {queryRejection ? <Alert severity="error">{rejectionMessage(queryRejection)}</Alert> : null}

        <Form onSubmit={onSubmit} noValidate>
          <PreferenceRow
            icon={<CardGiftcardIcon fontSize="small" />}
            title="Nouveaux souhaits"
            description="Un e-mail quotidien lorsqu'un participant ajoute un souhait."
            checked={dailyNewItemNotification}
            disabled={loading}
            onChange={setDailyNewItemNotification}
          />
          <PreferenceRow
            icon={<CakeIcon fontSize="small" />}
            title="Rappel d'anniversaire"
            description="30 jours avant, pour créer l'événement et votre liste."
            checked={birthdayReminder}
            disabled={loading}
            onChange={setBirthdayReminder}
          />
          <Actions>
            <Button
              type="submit"
              variant="contained"
              size="medium"
              loading={loading}
              loadingPosition="start"
              disabled={loading}
              startIcon={<SaveIcon />}
            >
              Mettre à jour
            </Button>
          </Actions>
        </Form>
      </Loader>
    </Card>
  );
};
