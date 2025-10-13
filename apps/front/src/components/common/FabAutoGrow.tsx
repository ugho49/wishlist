import type { FabProps } from '@mui/material/Fab'

import { Box, Fab, fabClasses, styled } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import { RouterLink } from './RouterLink'

const FabStyled = styled(Fab)(({ theme }) => ({
  [`&.${fabClasses.root}`]: {
    position: 'fixed',
    bottom: 35,
    right: 16,

    [theme.breakpoints.down('md')]: {
      bottom: 72,
    },
  },
}))

export type FabAutoGrowProps = {
  to?: string
  onClick?: () => void
  color?: FabProps['color']
  label: string
  icon: React.ReactNode
}

export const FabAutoGrow = ({ to, onClick, label, color, icon }: FabAutoGrowProps) => {
  const theme = useTheme()
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'))
  const BaseProps = { onClick, color }
  const Props = to ? { ...BaseProps, component: RouterLink, to } : BaseProps

  return (
    <FabStyled variant="extended" {...Props} size={smallScreen ? 'medium' : 'large'}>
      {icon}
      <Box sx={{ ml: 1 }}>{label}</Box>
    </FabStyled>
  )
}
