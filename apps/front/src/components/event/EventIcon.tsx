import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { styled } from '@mui/material'

type SizeVariant = 'small' | 'medium' | 'large'

const sizeMap = {
  small: '1.2rem',
  medium: '1.8rem',
  large: '3rem',
}

const EmojiIcon = styled('span')<{ size: SizeVariant }>(({ size }) => ({
  fontSize: sizeMap[size],
  lineHeight: 1,
  flexShrink: 0,
  alignSelf: 'center',
}))

const CalendarMonthIconStyled = styled(CalendarMonthIcon)<{ size: SizeVariant }>(({ theme, size }) => ({
  color: theme.palette.primary.light,
  fontSize: sizeMap[size],
}))

export type EventIconProps = {
  icon?: string
  className?: string
  size?: SizeVariant
}

export const EventIcon = ({ icon, className, size = 'medium' }: EventIconProps) => {
  if (!icon) {
    return <CalendarMonthIconStyled size={size} className={className} />
  }

  return (
    <EmojiIcon size={size} className={className}>
      {icon}
    </EmojiIcon>
  )
}
