import type { ReactNode } from 'react';

import { Avatar, Skeleton, styled } from '@mui/material';

export type FriendRowUser = {
  firstName: string;
  lastName: string;
  email: string;
  pictureUrl?: string | null;
};

const Row = styled('li')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  paddingBlock: theme.spacing(1.25),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-of-type': {
    borderBottom: 'none',
  },
}));

const Identity = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
});

const Name = styled('span')(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const Email = styled('span')(({ theme }) => ({
  fontSize: '0.85rem',
  color: theme.palette.text.secondary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const Meta = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.spacing(0.75),
  marginTop: theme.spacing(0.5),
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
}));

export const fullName = (user: FriendRowUser) => `${user.firstName} ${user.lastName}`;

export type FriendRowProps = {
  user: FriendRowUser;
  meta?: ReactNode;
  action?: ReactNode;
};

export const FriendRow = ({ user, meta, action }: FriendRowProps) => (
  <Row>
    <Avatar src={user.pictureUrl ?? undefined} alt={fullName(user)}>
      {user.firstName.substring(0, 1).toUpperCase()}
    </Avatar>
    <Identity>
      <Name>{fullName(user)}</Name>
      <Email>{user.email}</Email>
      {meta ? <Meta>{meta}</Meta> : null}
    </Identity>
    {action}
  </Row>
);

export const FriendRowSkeleton = () => (
  <Row aria-hidden>
    <Skeleton variant="circular" width={40} height={40} />
    <Identity>
      <Skeleton width="40%" />
      <Skeleton width="60%" />
    </Identity>
  </Row>
);
