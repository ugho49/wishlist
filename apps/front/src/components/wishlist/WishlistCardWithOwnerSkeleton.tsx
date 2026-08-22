import { Skeleton, styled } from '@mui/material'

import { Card } from '../common/Card'

const WishlistCardContent = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  height: '5.5rem',
  padding: 12,
  gap: '16px',
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'hidden',
}))

const ContentContainer = styled('div')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minWidth: 0,
  gap: '4px',
})

export const WishlistCardWithOwnerSkeleton = () => {
  return (
    <WishlistCardContent>
      <Skeleton animation="wave" variant="circular" width={65} height={65} />
      <ContentContainer>
        <Skeleton animation="wave" variant="text" width="70%" sx={{ fontSize: '1rem' }} />
        <Skeleton animation="wave" variant="text" width="40%" sx={{ fontSize: '0.85rem' }} />
      </ContentContainer>
    </WishlistCardContent>
  )
}
