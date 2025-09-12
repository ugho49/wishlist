import type { BoxProps } from '@mui/material'
import type { PropsWithChildren } from 'react'

import { Box, styled } from '@mui/material'
import clsx from 'clsx'

export type CardV2Props = BoxProps & {
  hoverable?: boolean
}

const BoxStyled = styled(Box)(() => ({
  width: '100%',
  backgroundColor: 'white',
  borderRadius: 16,
  boxShadow: '0 5px 10px -3px rgba(0, 0, 0, 0.1),0 2px 4px -2px rgba(0, 0, 0, 0.05)',
  padding: 24,
  transition: 'all 0.3s ease',
  '&.hoverable:hover': {
    cursor: 'pointer',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.08)',
  },
}))

export const CardV2 = ({ children, hoverable = false, className, ...props }: PropsWithChildren<CardV2Props>) => {
  return (
    <BoxStyled className={clsx(hoverable && 'hoverable', className)} {...props}>
      {children}
    </BoxStyled>
  )
}
