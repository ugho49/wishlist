import { styled, useTheme } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';
import { DateTime } from 'luxon';

import { AdminSection } from './AdminSection';

export type AdminGrowthPoint = {
  month: string;
  count: number;
};

type AdminGrowthChartProps = {
  title: string;
  data: AdminGrowthPoint[];
};

const ChartTitle = styled('h2')(({ theme }) => ({
  margin: 0,
  marginBottom: theme.spacing(1),
  fontSize: '0.95rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const formatMonthLabel = (month: string) =>
  DateTime.fromFormat(month, 'yyyy-MM', { zone: 'utc' }).setLocale('fr').toFormat('LLL');

export const AdminGrowthChart = ({ title, data }: AdminGrowthChartProps) => {
  const theme = useTheme();
  const labels = data.map(point => formatMonthLabel(point.month));
  const values = data.map(point => point.count);

  return (
    <AdminSection>
      <ChartTitle>{title}</ChartTitle>
      <BarChart
        height={260}
        hideLegend
        grid={{ horizontal: true }}
        margin={{ left: 8, right: 8, top: 12, bottom: 4 }}
        xAxis={[
          {
            scaleType: 'band',
            data: labels,
            height: 32,
            tickLabelStyle: { fontSize: 11 },
          },
        ]}
        yAxis={[{ min: 0, tickMinStep: 1, width: 36 }]}
        series={[
          {
            data: values,
            color: theme.palette.primary.main,
            valueFormatter: value => (value ?? 0).toLocaleString('fr-FR'),
          },
        ]}
      />
    </AdminSection>
  );
};
