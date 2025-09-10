import type { PropsWithChildren } from 'react'

import { Button, styled } from '@mui/material'
import { useGoogleLogin } from '@react-oauth/google'

import { CustomIcon } from '../common/CustomIcon'

const StyledButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.grey[200]}`,
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
  },
}))

export type SocialButtonProps = {
  loading?: boolean
  disabled?: boolean
  onStart?: () => void
  onSuccess: (code: string) => void
  onError: () => void
  iconSize?: number
}

export const GoogleButton = ({
  loading,
  disabled,
  onSuccess,
  onError,
  onStart,
  iconSize,
  children,
}: PropsWithChildren<SocialButtonProps>) => {
  const size = iconSize ?? 23
  const loginWithGoogle = useGoogleLogin({
    onSuccess: response => onSuccess(response.code),
    onError: () => onError(),
    flow: 'auth-code',
  })

  const handleClick = () => {
    onStart?.()
    loginWithGoogle()
  }

  return (
    <StyledButton
      loading={loading}
      disabled={disabled}
      variant="contained"
      onClick={() => handleClick()}
      startIcon={<CustomIcon name="google" style={{ width: size, height: size }} />}
    >
      {children}
    </StyledButton>
  )
}
