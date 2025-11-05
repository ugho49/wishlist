import PersonIcon from '@mui/icons-material/Person'
import { Avatar, type SvgIconOwnProps, type SxProps, styled, type Theme } from '@mui/material'
import clsx from 'clsx'

const AvatarStyled = styled(Avatar)(({ theme }) => ({
  width: '65px',
  height: '65px',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  fontSize: '1.4rem',
  fontWeight: 'bold',
  border: `3px solid ${theme.palette.background.paper}`,
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
  boxShadow: `0 4px 15px ${theme.palette.primary.main}25`,

  '&.no-background': {
    background: 'none',
  },
}))

export type WishlistAvatarProps = {
  src?: string
  className?: string
  sx?: SxProps<Theme>
  iconSize?: SvgIconOwnProps['fontSize']
}

export const WishlistAvatar = ({ src, className, sx, iconSize = 'medium' }: WishlistAvatarProps) => {
  return (
    <AvatarStyled src={src} className={clsx(className, src && 'no-background')} sx={sx}>
      <PersonIcon fontSize={iconSize} />
    </AvatarStyled>
  )
}
