import type { UpdateSecretSantaInputDto } from '@wishlist/common-types'

import { LoadingButton } from '@mui/lab'
import { Box, Stack } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'

import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { EditSecretSantaFormDialog } from './EditSecretSantaFormDialog'

type NoSecretSantaProps = {
  eventId: string
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
    <Stack>
      <Box>
        Aucun secret santa n'est en cours pour cet évènement. Vous pouvez en créer un en cliquant sur le bouton
        ci-dessous.
      </Box>
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
      <LoadingButton loading={loading} disabled={loading} onClick={() => setOpenModal(true)}>
        Créer un secret santa
      </LoadingButton>
    </Stack>
  )
}
