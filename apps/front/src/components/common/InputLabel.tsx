import { inputLabelClasses, InputLabel as MuiInputLabel } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { makeStyles } from '@mui/styles'
import { SxProps } from '@mui/system'
import React, { PropsWithChildren } from 'react'

export type InputLabelProps = {
  required?: boolean
  sx?: SxProps<Theme>
}

const useStyles = makeStyles((theme: Theme) => ({
  label: {
    [`&.${inputLabelClasses.root}`]: {
      display: 'flex',
      alignItems: 'center',
      color: theme.palette.primary.main,
      fontWeight: '500',
      marginBottom: '8px',
      fontSize: '1rem',
      [`& .${inputLabelClasses.asterisk}`]: {
        color: theme.palette.error.main,
        marginLeft: '2px',
      },
    },
  },
}))

export const InputLabel = ({ required = false, children, sx }: PropsWithChildren<InputLabelProps>) => {
  const classes = useStyles()

  return (
    <MuiInputLabel required={required} sx={sx} className={classes.label}>
      {children}
    </MuiInputLabel>
  )
}
