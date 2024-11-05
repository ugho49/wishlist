import type { EventId, UpdateSecretSantaInputDto } from '@wishlist/common-types'

import { LoadingButton } from '@mui/lab'
import { Box, Stack, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'

import SecretSanta from '../../assets/illustrations/secret_santa.png'
import { useApi, useToast } from '../../hooks'
import { EditSecretSantaFormDialog } from './EditSecretSantaFormDialog'

type NoSecretSantaProps = {
  eventId: EventId
}

export const NoSecretSanta = ({ eventId }: NoSecretSantaProps) => {
  const queryClient = useQueryClient()
  const api = useApi()
  const { addToast } = useToast()
  const [openModal, setOpenModal] = useState(false)

  const { mutateAsync: createSecretSanta, isPending: loading } = useMutation({
    mutationKey: ['secret-santa.create', { eventId }],
    mutationFn: (input: UpdateSecretSantaInputDto) => {
      return api.secretSanta.create({
        event_id: eventId,
        ...input,
      })
    },
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: output => {
      addToast({ message: 'Secret santa créé avec succès', variant: 'success' })
      queryClient.setQueryData(['secret-santa', { eventId }], output)
    },
  })

  return (
    <>
      <Stack flexDirection="row">
        <Stack justifyContent="center" gap={4}>
          <Box>
            <Typography variant="h5" color="primary">
              Aucun secret santa n'est en cours pour cet évènement
            </Typography>
          </Box>
          <Box>Vous pouvez en créer un en cliquant sur le bouton ci-dessous.</Box>
          <Box>
            <LoadingButton loading={loading} disabled={loading} onClick={() => setOpenModal(true)} variant="contained">
              Créer un secret santa
            </LoadingButton>
          </Box>
        </Stack>
        <Stack>
          <img src={SecretSanta} alt="secret santa" style={{ width: '35vw' }} />
        </Stack>
      </Stack>
      <EditSecretSantaFormDialog
        title="Créer un secret santa"
        open={openModal}
        saveButtonText="Créer"
        handleSubmit={input => {
          setOpenModal(false)
          void createSecretSanta(input)
        }}
        handleClose={() => setOpenModal(false)}
        input={{}}
      />
    </>
  )
}
