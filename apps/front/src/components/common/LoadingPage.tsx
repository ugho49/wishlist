import { CircularProgress, Stack } from '@mui/material'

export const LoadingPage = () => {
  return (
    <Stack sx={{ alignItems: 'center', justifyContent: 'center', marginTop: '100px', marginBottom: '100px' }}>
      <CircularProgress />
    </Stack>
  )
}
