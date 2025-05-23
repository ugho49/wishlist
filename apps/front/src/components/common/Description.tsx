import { Box, styled } from '@mui/material'

import { BreaklineText } from './BreaklineText'

const DescriptionBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: '12px',
  borderRadius: '4px',
  marginBottom: '20px',
  color: theme.palette.text.secondary,
  border: `2px solid ${theme.palette.secondary.main}`,
  backgroundColor: 'rgb(255 210 28 / 5%)',
}))

export const Description = ({ text }: { text: string }) => {
  return (
    <DescriptionBox>
      <BreaklineText text={text} />
    </DescriptionBox>
  )
}
