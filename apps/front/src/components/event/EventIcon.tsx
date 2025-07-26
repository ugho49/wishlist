import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { styled } from '@mui/material'

const EmojiIcon = styled('span')({
  fontSize: '1.8rem',
  lineHeight: 1,
  flexShrink: 0,
  alignSelf: 'center',
})

const CalendarMonthIconStyled = styled(CalendarMonthIcon)(({ theme }) => ({
  color: theme.palette.primary.light,
}))

export type EventIconProps = {
  icon?: string
  className?: string
}

export const EventIcon = ({ icon, className }: EventIconProps) => {
  if (!icon) {
    return <CalendarMonthIconStyled className={className} />
  }

  return <EmojiIcon className={className}>{icon}</EmojiIcon>
}
