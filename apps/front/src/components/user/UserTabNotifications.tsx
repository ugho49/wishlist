import type { UpdateUserEmailSettingsInputDto } from '@wishlist/common-types'

import SaveIcon from '@mui/icons-material/Save'
import { LoadingButton } from '@mui/lab'
import { Box, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { FormEvent, useEffect, useState } from 'react'

import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { InputLabel } from '../common/InputLabel'
import { Loader } from '../common/Loader'

export const UserTabNotifications = () => {
  const { addToast } = useToast()
  const api = useApi()
  const queryClient = useQueryClient()
  const [dailyNewItemNotification, setDailyNewItemNotification] = useState(true)

  const { data: value, isLoading: loadingNotificationSettings } = useQuery({
    queryKey: ['user.getEmailSettings'],
    queryFn: () => api.user.getEmailSettings(),
  })

  const { mutateAsync: updateEmailSettings, isPending: loading } = useMutation({
    mutationKey: ['user.updateEmailSettings'],
    mutationFn: (data: UpdateUserEmailSettingsInputDto) => api.user.updateUserEmailSettings(data),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: output => {
      addToast({ message: 'Préférences de notification mis à jour', variant: 'info' })
      queryClient.setQueryData(['user.getEmailSettings'], output)
    },
  })

  useEffect(() => {
    if (value) {
      setDailyNewItemNotification(value.daily_new_item_notification)
    }
  }, [value])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()

    await updateEmailSettings({
      daily_new_item_notification: dailyNewItemNotification,
    })
  }

  return (
    <Loader loading={loadingNotificationSettings}>
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
          <LoadingButton
            type="submit"
            variant="contained"
            size="large"
            color="secondary"
            loading={loading}
            loadingPosition="start"
            disabled={loading}
            startIcon={<SaveIcon />}
          >
            Mettre à jour
          </LoadingButton>
        </Stack>
      </Stack>
    </Loader>
  )
}
