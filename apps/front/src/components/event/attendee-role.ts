import LocalPoliceOutlinedIcon from '@mui/icons-material/LocalPoliceOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { match } from 'ts-pattern';

import { AttendeeRole } from '../../gql';

export const ASSIGNABLE_ATTENDEE_ROLES = [AttendeeRole.Admin, AttendeeRole.Participant] as const;

export function getAttendeeRoleLabel(role: AttendeeRole): string {
  return match(role)
    .with(AttendeeRole.Creator, () => 'Créateur')
    .with(AttendeeRole.Admin, () => 'Admin')
    .with(AttendeeRole.Participant, () => 'Participant')
    .exhaustive();
}

export function getAttendeeRoleDescription(role: AttendeeRole): string {
  return match(role)
    .with(
      AttendeeRole.Creator,
      () => 'Unique. Peut tout gérer, y compris supprimer l’événement. Ne peut pas être retiré.',
    )
    .with(AttendeeRole.Admin, () => 'Peut tout gérer comme le créateur, sauf retirer ou modifier le créateur.')
    .with(AttendeeRole.Participant, () => 'Peut consulter l’événement et y ajouter sa liste.')
    .exhaustive();
}

export function getAttendeeRoleIcon(role: AttendeeRole) {
  return match(role)
    .with(AttendeeRole.Creator, () => WorkspacePremiumOutlinedIcon)
    .with(AttendeeRole.Admin, () => LocalPoliceOutlinedIcon)
    .with(AttendeeRole.Participant, () => PersonOutlineOutlinedIcon)
    .exhaustive();
}
