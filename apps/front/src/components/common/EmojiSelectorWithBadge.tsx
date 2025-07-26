import type { EmojiSelectorProps } from './EmojiSelector'

import { Box, Chip, styled } from '@mui/material'

import { EmojiSelector } from './EmojiSelector'

const EmojiSelectorContainer = styled(Box)({
  position: 'relative',
  display: 'inline-block',
})

const NewFeatureBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: '-8px',
  left: '-8px',
  fontSize: '0.65rem',
  height: '16px',
  padding: '0 6px',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  border: `2px solid ${theme.palette.background.paper}`,
  fontWeight: 'bold',
  borderRadius: '9px',
  animation: 'pulse 2s infinite',
  zIndex: 1,
  '&.MuiChip-root': {
    fontSize: '0.65rem',
    fontWeight: 'bold',
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
    },
    '50%': {
      transform: 'scale(1.05)',
    },
    '100%': {
      transform: 'scale(1)',
    },
  },
}))

export type EmojiSelectorWithBadgeProps = EmojiSelectorProps & {
  showNewBadge?: boolean
}

export const EmojiSelectorWithBadge = ({ showNewBadge = true, value, ...props }: EmojiSelectorWithBadgeProps) => {
  // Cache le badge quand un emoji est sélectionné (l'utilisateur a découvert la feature)
  const shouldShowBadge = showNewBadge && !value

  return (
    <EmojiSelectorContainer>
      <EmojiSelector value={value} {...props} />
      {shouldShowBadge && <NewFeatureBadge label="NEW" size="small" />}
    </EmojiSelectorContainer>
  )
}
