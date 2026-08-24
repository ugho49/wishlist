import CheckroomIcon from '@mui/icons-material/Checkroom';
import { Alert, AlertTitle, alertClasses, styled, Typography } from '@mui/material';

import { shouldShowClothingSizeHint } from '../../utils/clothing.utils';

const ClothingSizeAlert = styled(Alert)(({ theme }) => ({
  border: `2px solid ${theme.palette.warning.main}`,
  [`& .${alertClasses.icon}`]: {
    fontSize: '2rem',
    alignItems: 'center',
  },
}));

interface ClothingSizeHintProps {
  title: string;
  description: string;
}

export function ClothingSizeHint({ title, description }: ClothingSizeHintProps) {
  if (!shouldShowClothingSizeHint(title, description)) return null;

  return (
    <ClothingSizeAlert
      severity="warning"
      icon={<CheckroomIcon fontSize="inherit" />}
      className="animated zoomIn faster"
    >
      <AlertTitle>Pensez à indiquer la taille</AlertTitle>
      <Typography variant="body2">
        Ce souhait a très peu de chances d'être pris si la taille n'est pas renseignée dans le champ{' '}
        <strong>Détails</strong>. Ajoutez par exemple « Taille M » ou « Pointure 42 ».
      </Typography>
    </ClothingSizeAlert>
  );
}
