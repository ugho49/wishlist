import type { EventId, UpdateSecretSantaInputDto } from '@wishlist/common'

import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Stack, styled, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import EmptySecretSantaIllustration from '../../assets/illustrations/secret-santa.png'
import { useApi, useToast } from '../../hooks'
import { EditSecretSantaFormDialog } from './EditSecretSantaFormDialog'

const EmptyStateContainer = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  gap: theme.spacing(2),
}))

const IllustrationWrapper = styled(Box)(() => ({
  animation: 'fadeInUp 0.6s ease-out',
  '@keyframes fadeInUp': {
    from: {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}))

const Illustration = styled('img')(({ theme }) => ({
  width: '150px',
  height: '150px',
  [theme.breakpoints.down('sm')]: {
    width: '100px',
    height: '100px',
  },
}))

const EmptyStateTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 500,
  color: theme.palette.text.primary,
  textAlign: 'center',
}))

const EmptyStateSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.95rem',
  color: theme.palette.text.secondary,
  textAlign: 'center',
  maxWidth: '400px',
}))

const AddListButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  borderRadius: '24px',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  boxShadow: `0 4px 12px ${theme.palette.primary.main}30`,
  '&:hover': {
    boxShadow: `0 6px 20px ${theme.palette.primary.main}40`,
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease',
}))

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
      <EmptyStateContainer>
        <IllustrationWrapper>
          <Illustration src={EmptySecretSantaIllustration} alt="Empty Secret Santa" />
        </IllustrationWrapper>

        <Box textAlign="center">
          <EmptyStateTitle>Aucun secret santa n'est en cours pour cet évènement</EmptyStateTitle>
          <EmptyStateSubtitle>Vous pouvez en créer un en cliquant sur le bouton ci-dessous.</EmptyStateSubtitle>
        </Box>

        <AddListButton
          variant="contained"
          color="primary"
          loading={loading}
          disabled={loading}
          onClick={() => setOpenModal(true)}
          startIcon={<AddIcon />}
        >
          Créer un secret santa
        </AddListButton>
      </EmptyStateContainer>
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
