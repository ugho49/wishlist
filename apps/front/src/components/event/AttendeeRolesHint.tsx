import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Stack, styled, Typography } from '@mui/material';

const HintIcon = styled(InfoOutlinedIcon)(({ theme }) => ({
  fontSize: 18,
  marginTop: 1,
  color: theme.palette.primary.main,
}));

/** Short reminder of what each assignable role does; the role chip menu repeats it next to each option. */
export const AttendeeRolesHint = () => (
  <Stack direction="row" sx={{ gap: 1, alignItems: 'flex-start' }}>
    <HintIcon />
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      <b>Admin</b> : gère l'évènement comme le créateur. <b>Participant</b> : consulte l'évènement et y ajoute sa liste.
    </Typography>
  </Stack>
);
