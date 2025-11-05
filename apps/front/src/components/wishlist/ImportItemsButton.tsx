import type { PropsWithChildren } from 'react'

import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import { Button, type ButtonProps, styled } from '@mui/material'
import clsx from 'clsx'

const ButtonStyled = styled(Button)({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },
  '&:disabled': {
    color: 'white',
    opacity: 0.5,
  },
  '&.rounded': {
    borderRadius: '24px',
  },
})

export type ImportButtonProps = PropsWithChildren<
  ButtonProps & {
    rounded?: boolean
  }
>

export const ImportItemsButton = ({
  children,
  size = 'small',
  rounded = false,
  className,
  ...props
}: ImportButtonProps) => {
  return (
    <ButtonStyled
      startIcon={<AutoFixHighIcon />}
      size={size}
      className={clsx(className, rounded && 'rounded')}
      {...props}
    >
      {children}
    </ButtonStyled>
  )
}
