import { Box, styled } from '@mui/material';

export type AdminStatItem = {
  label: string;
  value: number;
};

const StatsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}));

const StatItem = styled(Box)({
  flex: '1 1 0',
  minWidth: 0,
});

const StatValue = styled('p')(({ theme }) => ({
  margin: 0,
  fontSize: '1.25rem',
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
      <StatItem key={item.label}>
        <StatValue>{item.value.toLocaleString('fr-FR')}</StatValue>
        <StatLabel>{item.label}</StatLabel>
      </StatItem>
    ))}
  </StatsRow>
);
