import type { BoxProps } from '@mui/material'
import type { PropsWithChildren } from 'react'

import { Box, styled } from '@mui/material'
import clsx from 'clsx'

export type CardProps = BoxProps & {
  hoverable?: boolean
}

const BoxStyled = styled(Box)(({ theme }) => ({
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
  '&.hoverable:focus': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  },
  '&.hoverable:focus:not(:focus-visible)': {
    outline: 'none',
  },
}))

export const Card = ({ children, hoverable = false, className, onClick, ...props }: PropsWithChildren<CardProps>) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (onClick) {
        const mouseEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
        })
        Object.defineProperty(mouseEvent, 'target', { value: e.currentTarget, enumerable: true })
        onClick(mouseEvent as unknown as React.MouseEvent<HTMLDivElement>)
      }
    }
  }

  return (
    <BoxStyled
      className={clsx(hoverable && 'hoverable', className)}
      tabIndex={hoverable ? 0 : undefined}
      role={hoverable ? 'button' : undefined}
      aria-pressed={hoverable ? false : undefined}
      onClick={onClick}
      onKeyDown={hoverable ? handleKeyDown : undefined}
      {...props}
    >
      {children}
    </BoxStyled>
  )
}
