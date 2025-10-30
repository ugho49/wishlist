import { CircularProgress, Stack, type StackProps } from '@mui/material'

export type LoadingProps = StackProps & {}

export const Loading = ({ sx, ...props }: LoadingProps) => {
  return (
    <Stack
      sx={{ alignItems: 'center', justifyContent: 'center', marginTop: '100px', marginBottom: '100px', ...sx }}
      {...props}
    >
      <CircularProgress />
    </Stack>
  )
}
