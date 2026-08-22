import type { MouseEvent } from 'react';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Chip, Menu, MenuItem, Stack, styled } from '@mui/material';
import { useState } from 'react';
import { match } from 'ts-pattern';

import { AttendeeRole } from '../../gql';
import { ASSIGNABLE_ATTENDEE_ROLES, getAttendeeRoleIcon, getAttendeeRoleLabel } from './attendee-role';

export type AttendeeRoleChipProps = {
  role: AttendeeRole;
  editable?: boolean;
  disabled?: boolean;
  onRoleChange?: (role: AttendeeRole) => void;
};

const RoleChip = styled(Chip, { shouldForwardProp: prop => prop !== 'roleVariant' })<{
  roleVariant: AttendeeRole;
}>(({ theme, roleVariant }) => ({
  height: 24,
  fontWeight: 600,
  fontSize: '0.75rem',
  maxWidth: '100%',
  alignSelf: 'center',
  ...match(roleVariant)
    .with(AttendeeRole.Creator, () => ({
      backgroundColor: '#fef3c7',
      color: '#b45309',
      border: '1px solid #fcd34d',
    }))
    .with(AttendeeRole.Admin, () => ({
      backgroundColor: '#e0f2fe',
      color: theme.palette.primary.main,
      border: '1px solid #7dd3fc',
    }))
    .with(AttendeeRole.Participant, () => ({
      backgroundColor: theme.palette.grey[100],
      color: theme.palette.text.secondary,
      border: `1px solid ${theme.palette.grey[300]}`,
    }))
    .exhaustive(),
  '& .MuiChip-label': {
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}));

const ChipLabel = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 2,
});

const DropdownIcon = styled(KeyboardArrowDownIcon)({
  fontSize: 16,
  display: 'block',
});

export const AttendeeRoleChip = ({ role, editable = false, disabled = false, onRoleChange }: AttendeeRoleChipProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const canOpenMenu = editable && !disabled && !!onRoleChange;

  const openMenu = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (canOpenMenu) setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <RoleChip
        roleVariant={role}
        size="small"
        label={
          <ChipLabel>
            {getAttendeeRoleLabel(role)}
            {canOpenMenu ? <DropdownIcon /> : null}
          </ChipLabel>
        }
        clickable={canOpenMenu}
        disabled={disabled}
        onClick={canOpenMenu ? openMenu : undefined}
      />
      {canOpenMenu ? (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          {ASSIGNABLE_ATTENDEE_ROLES.map(assignableRole => {
            const OptionIcon = getAttendeeRoleIcon(assignableRole);
            return (
              <MenuItem
                key={assignableRole}
                selected={assignableRole === role}
                onClick={() => {
                  setAnchorEl(null);
                  if (assignableRole !== role) onRoleChange?.(assignableRole);
                }}
              >
                <Stack direction="row" alignItems="center" gap={1}>
                  <OptionIcon fontSize="small" />
                  {getAttendeeRoleLabel(assignableRole)}
                </Stack>
              </MenuItem>
            );
          })}
        </Menu>
      ) : null}
    </>
  );
};
