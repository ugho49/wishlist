import type { SxProps, Theme } from '@mui/material/styles'
import type { PropsWithChildren } from 'react'

import { inputLabelClasses, InputLabel as MuiInputLabel, styled } from '@mui/material'

export type InputLabelProps = {
  required?: boolean
  sx?: SxProps<Theme>
}

const InputLabelStyled = styled(MuiInputLabel)(({ theme }) => ({
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
}))

export const InputLabel = ({ required = false, children, sx }: PropsWithChildren<InputLabelProps>) => {
  return (
    <InputLabelStyled required={required} sx={sx}>
      {children}
    </InputLabelStyled>
  )
}
