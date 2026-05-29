import type { FormEvent } from 'react'

import SaveIcon from '@mui/icons-material/Save'
import { Box, Button, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { useUpdateUserEmailSettingsMutation, useUserProfileEmailSettingsQuery } from '../../gql'
import { unwrapResult } from '../../gql/result'
import { useToast } from '../../hooks/useToast'
import { Card } from '../common/Card'
import { InputLabel } from '../common/InputLabel'
import { Loader } from '../common/Loader'
import { Subtitle } from '../common/Subtitle'

export const UserTabNotifications = () => {
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const [dailyNewItemNotification, setDailyNewItemNotification] = useState(true)

  const { data: emailSettings, isLoading: loadingNotificationSettings } = useUserProfileEmailSettingsQuery(undefined, {
    select: d => unwrapResult(d.currentUser, 'User').emailSettings,
  })

  const { mutateAsync: updateEmailSettings, isPending: loading } = useUpdateUserEmailSettingsMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
  })

  useEffect(() => {
    if (emailSettings) {
      setDailyNewItemNotification(emailSettings.dailyNewItemNotification)
    }
  }, [emailSettings])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const res = await updateEmailSettings({
      input: {
        dailyNewItemNotification,
      },
    })

    unwrapResult(res.updateUserEmailSettings, 'UserEmailSettings')

    addToast({ message: 'Préférences de notification mis à jour', variant: 'info' })
    void queryClient.invalidateQueries({ queryKey: ['UserProfileEmailSettings'] })
  }

  return (
    <Card>
      <Loader loading={loadingNotificationSettings}>
        <Subtitle>Gérer les notifications de mail</Subtitle>

        <Stack component="form" onSubmit={onSubmit} noValidate gap={3}>
          <Box>
            <InputLabel>Notifications de mail</InputLabel>
            <FormControlLabel
              control={
                <Checkbox
                  checked={dailyNewItemNotification}
                  onChange={e => setDailyNewItemNotification(e.target.checked)}
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

          <Stack direction="row" justifyContent="center">
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
          </Stack>
        </Stack>
      </Loader>
    </Card>
  )
}
