import { Box, Stack, useTheme } from '@mui/material'
import { makeStyles } from '@mui/styles'
import React, { PropsWithChildren } from 'react'

export type StatusProps = {
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'
  colorGradient?: 'light' | 'main' | 'dark'
  text?: string
}

const useStyles = makeStyles(() => ({
  bullet: {
    display: 'inline-block',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    margin: 'auto',
  },
}))

export const Status = ({ color = 'primary', colorGradient = 'light', text }: PropsWithChildren<StatusProps>) => {
  const theme = useTheme()
  const classes = useStyles()

  return (
    <Stack flexDirection="row" alignItems="center" gap={1}>
      <Box className={classes.bullet} sx={{ backgroundColor: theme.palette[color][colorGradient] }} />
      {text && <Box>{text}</Box>}
    </Stack>
  )
}
