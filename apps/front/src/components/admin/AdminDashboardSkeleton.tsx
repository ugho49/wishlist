import { Box, Skeleton, styled } from '@mui/material';

const DomainBody = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  minWidth: 0,
}));

const StatsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
}));

const StatItem = styled(Box)({
  flex: '1 1 0',
  minWidth: 0,
});

const ValueSkeleton = styled(Skeleton)({
  width: 48,
  height: 28,
  transform: 'none',
});

const LabelSkeleton = styled(Skeleton)(({ theme }) => ({
  width: 72,
  height: 14,
  marginTop: theme.spacing(0.5),
  transform: 'none',
}));

const ChartTitleSkeleton = styled(Skeleton)({
  width: 148,
  height: 14,
  transform: 'none',
});

const ChartSkeleton = styled(Skeleton)(({ theme }) => ({
  height: 80,
  marginTop: theme.spacing(0.25),
  transform: 'none',
}));

export const AdminDashboardSkeleton = () => (
  <DomainBody>
    <StatsRow>
      {['a', 'b', 'c'].map(key => (
        <StatItem key={key}>
          <ValueSkeleton animation="wave" variant="rounded" />
          <LabelSkeleton animation="wave" variant="rounded" />
        </StatItem>
      ))}
    </StatsRow>
    <Box>
      <ChartTitleSkeleton animation="wave" variant="rounded" />
      <ChartSkeleton animation="wave" variant="rounded" />
    </Box>
  </DomainBody>
);
