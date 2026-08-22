import { Skeleton, styled } from '@mui/material'

import { Card } from '../common/Card'

const WishlistCardContent = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100px',
  height: '100%',
  border: `1px solid ${theme.palette.divider}`,
  padding: 16,
}))

const WishlistHeader = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  marginBottom: '16px',
})

const WishlistTitleContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
  minWidth: 0,
})

const WishlistEvents = styled('div')(({ theme }) => ({
  marginTop: 'auto',
  paddingTop: '12px',
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
}))

const EventItem = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
})

export const WishlistCardWithEventsSkeleton = () => {
  return (
    <WishlistCardContent>
      <WishlistHeader>
        <Skeleton animation="wave" variant="circular" width={32} height={32} />
        <WishlistTitleContainer>
          <Skeleton animation="wave" variant="text" width="55%" sx={{ fontSize: '1rem' }} />
        </WishlistTitleContainer>
      </WishlistHeader>

      <WishlistEvents>
        <EventItem>
          <Skeleton animation="wave" variant="circular" width={19} height={19} />
          <Skeleton animation="wave" variant="text" width={160} sx={{ fontSize: '0.8rem' }} />
        </EventItem>
      </WishlistEvents>
    </WishlistCardContent>
  )
}
