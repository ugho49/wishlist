import { Box, Button, Stack } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'

type EditSecretSantaProps = { eventId: string }

export const EditSecretSanta = ({ eventId }: EditSecretSantaProps) => {
  const navigate = useNavigate()

  return (
    <Stack gap={3} alignItems="center" marginTop={5}>
      <Box>Cliquer sur le bouton ci-dessous pour gérer le Secret Santa</Box>
      <Box>
        <Button variant="contained" onClick={() => navigate(`/events/${eventId}/secret-santa`)}>
          Gérer le Secret Santa
        </Button>
      </Box>
    </Stack>
  )
}
