import type { FilterType, SortType } from './WishlistFilterAndSortItems';

import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack, styled, Tooltip } from '@mui/material';
import clsx from 'clsx';
import { useState } from 'react';

import { SectionHeader, SectionTitle } from '../common/PageHero';
import { filterOptions, sortOptions } from './WishlistFilterAndSortItems';

const ToolbarButton = styled(IconButton)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
  '&.active': {
    borderColor: theme.palette.primary.main,
  },
}));

export type WishlistItemsToolbarProps = {
  itemsCount: number;
  canFilter: boolean;
  sort: SortType;
  filter: FilterType;
  onSortChange: (sort: SortType) => void;
  onFilterChange: (filter: FilterType) => void;
};

export const WishlistItemsToolbar = ({
  itemsCount,
  canFilter,
  sort,
  filter,
  onSortChange,
  onFilterChange,
}: WishlistItemsToolbarProps) => {
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const sortIsActive = sort !== 'name_asc';
  const filterIsActive = filter !== '';

  return (
    <SectionHeader>
      <SectionTitle>
        Souhaits
        <span className="count">{itemsCount}</span>
      </SectionTitle>

      {itemsCount > 0 && (
        <Stack direction="row" sx={{ gap: 1 }}>
          <Tooltip title="Trier">
            <ToolbarButton
              size="small"
              className={clsx(sortIsActive && 'active')}
              color={sortIsActive ? 'primary' : 'default'}
              onClick={e => setSortAnchorEl(e.currentTarget)}
            >
              <SortIcon fontSize="small" />
            </ToolbarButton>
          </Tooltip>

          {canFilter && (
            <Tooltip title="Filtrer">
              <ToolbarButton
                size="small"
                className={clsx(filterIsActive && 'active')}
                color={filterIsActive ? 'primary' : 'default'}
                onClick={e => setFilterAnchorEl(e.currentTarget)}
              >
                <FilterListIcon fontSize="small" />
              </ToolbarButton>
            </Tooltip>
          )}
        </Stack>
      )}

      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => setSortAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {sortOptions.map(opt => (
          <MenuItem
            key={opt.value}
            selected={sort === opt.value}
            onClick={() => {
              onSortChange(opt.value);
              setSortAnchorEl(null);
            }}
          >
            <ListItemIcon>{opt.icon}</ListItemIcon>
            <ListItemText>{opt.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {filterOptions.map(opt => (
          <MenuItem
            key={opt.value}
            selected={filter === opt.value}
            onClick={() => {
              onFilterChange(opt.value);
              setFilterAnchorEl(null);
            }}
          >
            <ListItemIcon>{opt.icon}</ListItemIcon>
            <ListItemText>{opt.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </SectionHeader>
  );
};
