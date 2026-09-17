import { styled, useTheme } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';
import { DateTime } from 'luxon';

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
  marginBottom: theme.spacing(0.25),
  fontSize: '0.75rem',
  fontWeight: 600,
  color: theme.palette.text.secondary,
}));

const formatMonthLabel = (month: string) =>
  DateTime.fromFormat(month, 'yyyy-MM', { zone: 'utc' }).setLocale('fr').toFormat('LLL');

export const AdminGrowthChart = ({ title, data }: AdminGrowthChartProps) => {
  const theme = useTheme();
  const labels = data.map(point => formatMonthLabel(point.month));
  const values = data.map(point => point.count);

  return (
    <>
      <ChartTitle>{title}</ChartTitle>
      <BarChart
        height={80}
        hideLegend
        margin={{ left: 2, right: 2, top: 4, bottom: 0 }}
        xAxis={[
          {
            scaleType: 'band',
            data: labels,
            height: 16,
            disableLine: true,
            disableTicks: true,
            tickLabelStyle: { fontSize: 9 },
          },
        ]}
        yAxis={[
          {
            min: 0,
            tickMinStep: 1,
            tickNumber: 3,
            width: 20,
            disableLine: true,
            disableTicks: true,
          },
        ]}
        series={[
          {
            data: values,
            color: theme.palette.primary.main,
            valueFormatter: value => (value ?? 0).toLocaleString('fr-FR'),
          },
        ]}
      />
    </>
  );
};
