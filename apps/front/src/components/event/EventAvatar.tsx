import { Avatar, type SvgIconOwnProps, type SxProps, styled, type Theme } from '@mui/material'
import clsx from 'clsx'

import { EventIcon } from './EventIcon'

const AvatarStyled = styled(Avatar)(({ theme }) => ({
  width: '75px',
  height: '75px',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  fontSize: '1.6rem',
  fontWeight: 'bold',
  border: `3px solid ${theme.palette.background.paper}`,
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
  boxShadow: `0 4px 15px ${theme.palette.primary.main}25`,

  '&.no-background': {
    background: 'none',
    border: 'none',
    boxShadow: 'none',
  },
}))

export type EventAvatarProps = {
  icon?: string
  className?: string
  sx?: SxProps<Theme>
  iconSize?: SvgIconOwnProps['fontSize']
}

export const EventAvatar = ({ icon, className, sx, iconSize = 'large' }: EventAvatarProps) => {
  return (
    <AvatarStyled className={clsx(className, icon && 'no-background')} sx={sx}>
      <EventIcon icon={icon} size={iconSize} />
    </AvatarStyled>
  )
}
