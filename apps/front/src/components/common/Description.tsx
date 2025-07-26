import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { alpha, Box, Stack, styled } from '@mui/material'

import { BreaklineText } from './BreaklineText'

const DescriptionContainer = styled(Stack)(({ theme }) => ({
  padding: '12px',
  borderRadius: '12px',
  color: theme.palette.text.primary,
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
  fontSize: '16px',
  lineHeight: 1.6,
  fontWeight: 400,
  textAlign: 'left',
  borderLeft: `8px solid ${theme.palette.primary.main}`,
  gap: '16px', // Utilise gap au lieu de spacing pour éviter les marges automatiques
}))

const IconWrapper = styled('div')(({ theme }) => ({
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  flexShrink: 0,
}))

export const Description = ({ text }: { text: string }) => {
  return (
    <DescriptionContainer direction="row" alignItems="center">
      <IconWrapper>
        <InfoOutlinedIcon fontSize="small" />
      </IconWrapper>
      <Box sx={{ flex: 1 }}>
        <BreaklineText text={text} />
      </Box>
    </DescriptionContainer>
  )
}
