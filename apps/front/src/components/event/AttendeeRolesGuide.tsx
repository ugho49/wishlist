import { Box, Stack, styled, Typography } from '@mui/material';

import { AttendeeRole } from '../../gql';
import { getAttendeeRoleDescription, getAttendeeRoleIcon, getAttendeeRoleLabel } from './attendee-role';
import { NewFeatureBadge } from './NewFeatureBadge';

const ROLES: AttendeeRole[] = [AttendeeRole.Creator, AttendeeRole.Admin, AttendeeRole.Participant];

const Guide = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 16,
  padding: theme.spacing(2.5),
  background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, #eef6fb 100%)`,
  border: `1px solid ${theme.palette.grey[200]}`,
}));

const RoleRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: theme.spacing(1.5),
}));

const RoleIconWrap = styled(Box)(({ theme }) => ({
  width: 36,
  height: 36,
  flexShrink: 0,
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.common.white,
  color: theme.palette.primary.main,
  boxShadow: '0 1px 3px rgba(37, 83, 118, 0.12)',
}));

const RoleTitle = styled(Typography)({
  fontWeight: 700,
  fontSize: '0.9rem',
  lineHeight: 1.3,
});

const RoleDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.8rem',
  lineHeight: 1.45,
}));

export const AttendeeRolesGuide = () => (
  <Guide>
    <Stack gap={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        gap={1}
      >
        <Box>
          <Typography fontWeight={700} fontSize="1rem">
            Les rôles des participants
          </Typography>
          <Typography color="text.secondary" fontSize="0.85rem">
            Chaque personne invitée a un rôle, qui définit ce qu’elle peut faire sur l’événement.
          </Typography>
        </Box>
        <NewFeatureBadge />
      </Stack>

      <Stack gap={1.5}>
        {ROLES.map(role => {
          const Icon = getAttendeeRoleIcon(role);
          return (
            <RoleRow key={role}>
              <RoleIconWrap>
                <Icon fontSize="small" />
              </RoleIconWrap>
              <Box>
                <RoleTitle>{getAttendeeRoleLabel(role)}</RoleTitle>
                <RoleDescription>{getAttendeeRoleDescription(role)}</RoleDescription>
              </Box>
            </RoleRow>
          );
        })}
      </Stack>
    </Stack>
  </Guide>
);
