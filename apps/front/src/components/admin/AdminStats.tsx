import { Box, styled } from '@mui/material';

export type AdminStatItem = {
  label: string;
  value: number;
};

const StatsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
}));

const StatCard = styled(Box)(({ theme }) => ({
  flex: '1 1 140px',
  minWidth: 140,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.5, 2),
}));

const StatValue = styled('p')(({ theme }) => ({
  margin: 0,
  fontSize: '1.375rem',
  fontWeight: 600,
  lineHeight: 1.2,
  color: theme.palette.text.primary,
}));

const StatLabel = styled('p')(({ theme }) => ({
  margin: 0,
  marginTop: theme.spacing(0.25),
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
}));

type AdminStatsProps = {
  items: AdminStatItem[];
};

export const AdminStats = ({ items }: AdminStatsProps) => (
  <StatsRow>
    {items.map(item => (
      <StatCard key={item.label}>
        <StatValue>{item.value.toLocaleString('fr-FR')}</StatValue>
        <StatLabel>{item.label}</StatLabel>
      </StatCard>
    ))}
  </StatsRow>
);
