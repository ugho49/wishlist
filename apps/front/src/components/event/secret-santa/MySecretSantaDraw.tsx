import { Box, Stack, Theme } from '@mui/material'
import { makeStyles } from '@mui/styles'
import React from 'react'

import { useMySecretSantaDraw } from '../../../hooks/domain/useMySecretSantaDraw'

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    textAlign: 'center',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    color: theme.palette.text.secondary,
    border: `2px solid #2f7d31`,
    backgroundColor: 'rgb(47 125 49 / 5%)',
  },
  drawName: {
    fontWeight: 'bold',
  },
}))

type MySecretSantaDrawProps = {
  eventId: string
}

export const MySecretSantaDraw = ({ eventId }: MySecretSantaDrawProps) => {
  const classes = useStyles()
  const { mySecretSantaDraw } = useMySecretSantaDraw(eventId)

  if (!mySecretSantaDraw) {
    return
  }

  return (
    <Stack direction="column" alignItems="center" gap={1} className={classes.container}>
      <Box>Votre Secret Santa est</Box>
      <Box className={classes.drawName}>Ugho STEPHAN</Box>
    </Stack>
  )
}