import CheckroomIcon from '@mui/icons-material/Checkroom';
import { Alert, AlertTitle, alertClasses, styled, Typography } from '@mui/material';

import { getClothingSizeHintKind } from '../../utils/clothing.utils';

const ClothingSizeAlert = styled(Alert)(({ theme }) => ({
  border: `2px solid ${theme.palette.warning.main}`,
  [`& .${alertClasses.icon}`]: {
    fontSize: '2rem',
    alignItems: 'center',
  },
}));

const HINT_COPY = {
  shoe: {
    title: 'Pensez à indiquer la pointure',
    measurement: 'la pointure',
    example: 'Pointure 42',
  },
  garment: {
    title: 'Pensez à indiquer la taille',
    measurement: 'la taille',
    example: 'Taille M',
  },
} as const;

interface ClothingSizeHintProps {
  title: string;
  description: string;
}

export function ClothingSizeHint({ title, description }: ClothingSizeHintProps) {
  const kind = getClothingSizeHintKind(title, description);
  if (!kind) return null;

  const copy = HINT_COPY[kind];

  return (
    <ClothingSizeAlert
      severity="warning"
      icon={<CheckroomIcon fontSize="inherit" />}
      className="animated zoomIn faster"
    >
      <AlertTitle>{copy.title}</AlertTitle>
      <Typography variant="body2">
        Ce souhait a très peu de chances d'être pris si {copy.measurement} n'est pas renseignée dans le champ{' '}
        <strong>Détails</strong>. Ajoutez par exemple « {copy.example} ».
      </Typography>
    </ClothingSizeAlert>
  );
}
