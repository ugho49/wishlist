import { Chip, styled } from '@mui/material';

const Badge = styled(Chip)({
  height: 20,
  fontSize: '0.65rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  backgroundColor: '#dcfce7',
  color: '#15803d',
  border: '1px solid #86efac',
  animation: 'newFeaturePulse 2s ease-in-out infinite',
  '@keyframes newFeaturePulse': {
    '0%, 100%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.05)' },
  },
});

export const NewFeatureBadge = () => <Badge label="Nouveau" size="small" />;
