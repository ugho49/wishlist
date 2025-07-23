import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { alpha, Box, styled } from '@mui/material'

import { BreaklineText } from './BreaklineText'

const DescriptionBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: '20px 24px 20px 56px',
  borderRadius: '12px',
  marginBottom: '24px',
  color: theme.palette.text.primary,
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
  fontSize: '16px',
  lineHeight: 1.6,
  fontWeight: 400,
  textAlign: 'left',
  borderLeft: `8px solid ${theme.palette.primary.main}`,

  '& p': {
    margin: 0,
  },
}))

const IconWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: '16px',
  top: '20px',
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
}))

export const Description = ({ text }: { text: string }) => {
  return (
    <DescriptionBox>
      <IconWrapper>
        <InfoOutlinedIcon fontSize="small" />
      </IconWrapper>
      <BreaklineText text={text} />
    </DescriptionBox>
  )
}
