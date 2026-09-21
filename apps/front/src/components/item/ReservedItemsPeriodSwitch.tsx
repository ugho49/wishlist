import type { MouseEvent } from 'react';

import { alpha, styled } from '@mui/material';

const RESERVED_ITEMS_PERIODS = ['all', 'reserved', 'past'] as const;

export type ReservedItemsPeriod = (typeof RESERVED_ITEMS_PERIODS)[number];

const PERIOD_LABELS: Record<ReservedItemsPeriod, string> = {
  all: 'Tous',
  reserved: 'Réservés',
  past: 'Passés',
};

const Track = styled('div')(({ theme }) => ({
  display: 'flex',
  width: 'fit-content',
  maxWidth: '100%',
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(0.5),
  gap: theme.spacing(0.5),
  borderRadius: 999,
  backgroundColor: theme.palette.grey[100],
  boxShadow: `inset 0 0 0 1px ${theme.palette.divider}`,
}));

const Segment = styled('button')(({ theme }) => ({
  border: 'none',
  borderRadius: 999,
  padding: theme.spacing(0.875, 2),
  minWidth: 92,
  cursor: 'pointer',
  font: 'inherit',
  fontSize: '0.9rem',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  backgroundColor: 'transparent',
  transition: 'background-color 180ms ease, color 180ms ease, box-shadow 180ms ease',
  '&[aria-pressed="true"]': {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    boxShadow: `0 8px 18px ${alpha(theme.palette.primary.main, 0.35)}`,
  },
  '&:hover:not([aria-pressed="true"])': {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.action.hover,
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
}));

export type ReservedItemsPeriodSwitchProps = {
  value: ReservedItemsPeriod;
  onChange: (period: ReservedItemsPeriod) => void;
};

const isPeriod = (value: string | undefined): value is ReservedItemsPeriod =>
  value === 'all' || value === 'reserved' || value === 'past';

export const ReservedItemsPeriodSwitch = ({ value, onChange }: ReservedItemsPeriodSwitchProps) => {
  const onTrackClick = (event: MouseEvent<HTMLDivElement>) => {
    const period = (event.target as HTMLElement).closest('button')?.dataset.period;
    if (!isPeriod(period) || period === value) return;
    onChange(period);
  };

  return (
    <Track role="group" aria-label="Filtrer les cadeaux" onClick={onTrackClick}>
      {RESERVED_ITEMS_PERIODS.map(period => (
        <Segment key={period} type="button" data-period={period} aria-pressed={period === value}>
          {PERIOD_LABELS[period]}
        </Segment>
      ))}
    </Track>
  );
};
