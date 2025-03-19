import { useAuth0 } from '@auth0/auth0-react'
import { Button, Stack } from '@mui/material'

export const UserTabSocial = () => {
  const { loginWithPopup } = useAuth0()

  return (
    <Stack>
      <Button
        onClick={() =>
          loginWithPopup({
            authorizationParams: {
              connection: 'google-oauth20',
            },
          })
        }
      >
        Google
      </Button>
    </Stack>
  )
}
