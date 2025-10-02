import { Box, Button, Stack } from '@mui/material'
import React from 'react'
import { useNavigate } from '@tanstack/react-router'

type EditSecretSantaProps = { eventId: string }

export const EditSecretSanta = ({ eventId }: EditSecretSantaProps) => {
  const navigate = useNavigate()

  return (
    <Stack gap={3} alignItems="center" marginTop={5}>
      <Box>Cliquer sur le bouton ci-dessous pour gérer le Secret Santa</Box>
      <Box>
        <Button variant="contained" onClick={() => navigate({ to: '/events/$eventId/secret-santa', params: { eventId } })}>
          Gérer le Secret Santa
        </Button>
      </Box>
    </Stack>
  )
}
