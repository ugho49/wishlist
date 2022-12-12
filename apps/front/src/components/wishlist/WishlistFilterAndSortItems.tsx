import React, { useEffect } from 'react';
import { Box, Grid, inputBaseClasses, MenuItem, menuItemClasses, Select } from '@mui/material';
import { InputLabel } from '../common/InputLabel';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { ItemDto } from '@wishlist/common-types';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';

type SelectOption<T> = {
  value: T;
  label: string | React.ReactNode;
  icon?: React.ReactNode;
};

export enum FilterType {
  NONE = '',
  CHECKED = 'checked',
  UNCHECKED = 'unchecked',
  SUGGESTED = 'suggested',
  NOT_SUGGESTED = 'not_suggested',
}

export enum SortType {
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  CREATED_AT_DESC = 'created_at_desc',
  CREATED_AT_ASC = 'created_at_asc',
  SCORE_DESC = 'score_desc',
  SCORE_ASC = 'score_asc',
}

const filterOptions: SelectOption<FilterType>[] = [
  {
    value: FilterType.NONE,
    label: <em>Aucun filtre</em>,
  },
  {
    value: FilterType.CHECKED,
    label: 'Souhaits cochés',
    icon: <CheckBoxIcon fontSize="small" />,
  },
  {
    value: FilterType.UNCHECKED,
    label: 'Souhaits décochés',
    icon: <CheckBoxOutlineBlankIcon fontSize="small" />,
  },
  {
    value: FilterType.SUGGESTED,
    label: 'Souhaits suggérés',
    icon: <Diversity3Icon fontSize="small" />,
  },
  {
    value: FilterType.NOT_SUGGESTED,
    label: 'Souhaits non suggérés',
    icon: <PersonOutlineIcon fontSize="small" />,
  },
];

const sortOptions: SelectOption<SortType>[] = [
  {
    value: SortType.NAME_ASC,
    label: 'Ordre alphabétique',
    icon: <SortByAlphaIcon fontSize="small" />,
  },
  {
    value: SortType.CREATED_AT_DESC,
    label: 'Du plus récent au plus ancien',
    icon: <WatchLaterIcon fontSize="small" />,
  },
  {
    value: SortType.CREATED_AT_ASC,
    label: 'Du plus ancien au plus récent',
    icon: <AccessTimeIcon fontSize="small" />,
  },
  {
    value: SortType.SCORE_DESC,
    label: "Le plus grand nombre d'étoiles",
    icon: <StarIcon fontSize="small" />,
  },
  {
    value: SortType.SCORE_ASC,
    label: "Le plus petit nombre d'étoiles",
    icon: <StarBorderIcon fontSize="small" />,
  },
];

export const applyFilter = (item: ItemDto, filter: FilterType): boolean => {
  const checked = item.taken_by?.id !== undefined;

  if (filter === FilterType.CHECKED && checked) {
    return true;
  }

  if (filter === FilterType.UNCHECKED && !checked) {
    return true;
  }

  if (filter === FilterType.SUGGESTED && item.is_suggested) {
    return true;
  }

  if (filter === FilterType.NOT_SUGGESTED && !item.is_suggested) {
    return true;
  }

  return filter === FilterType.NONE;
};

export const applySort = (a: ItemDto, b: ItemDto, sort: SortType): number => {
  if (sort === SortType.NAME_DESC) {
    return b.name.localeCompare(a.name);
  }

  if (sort === SortType.SCORE_ASC) {
    return (a.score || 0) - (b.score || 0);
  }

  if (sort === SortType.SCORE_DESC) {
    return (b.score || 0) - (a.score || 0);
  }

  if (sort === SortType.CREATED_AT_ASC) {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  }

  if (sort === SortType.CREATED_AT_DESC) {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }

  // Default sort by name ASC
  return a.name.localeCompare(b.name);
};

export type WishFilterSortSelectProps = {
  sort: SortType;
  onSortChange: (sort: SortType) => void;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  items: ItemDto[];
  onChange: (items: ItemDto[]) => void;
  displayFilterSelect?: boolean;
  displaySortSelect?: boolean;
};

const useStyles = makeStyles((theme: Theme) => ({
  select: {
    [`&.${inputBaseClasses.root}`]: {
      width: '100%',
      height: '28px',
    },
  },
  menuItem: {
    [`&, &.${menuItemClasses.root}`]: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
  },
}));

export const WishlistFilterAndSortItems = ({
  items,
  onChange,
  sort,
  onSortChange,
  filter,
  onFilterChange,
  displayFilterSelect = true,
  displaySortSelect = true,
}: WishFilterSortSelectProps) => {
  const classes = useStyles();

  useEffect(() => {
    const newItems = items.filter((item) => applyFilter(item, filter)).sort((a, b) => applySort(a, b, sort));
    onChange(newItems);
  }, [items, sort, filter]);

  return (
    <Grid container spacing={2} sx={{ marginBottom: '30px' }}>
      {displaySortSelect && (
        <Grid item xs={12} md={6}>
          <InputLabel sx={{ gap: '6px' }}>
            <SortIcon fontSize="small" />
            <span>Trier par</span>
          </InputLabel>

          <Select
            className={classes.select}
            displayEmpty
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortType)}
            renderValue={(value) => {
              const option = sortOptions.find((opt) => opt.value === value);
              return (
                <Box className={classes.menuItem}>
                  {option?.icon}
                  {option?.label}
                </Box>
              );
            }}
          >
            {sortOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} className={classes.menuItem}>
                {opt.icon}
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      )}
      {displayFilterSelect && (
        <Grid item xs={12} md={6}>
          <InputLabel sx={{ gap: '6px' }}>
            <FilterListIcon fontSize="small" />
            <span>Filtrer par</span>
          </InputLabel>
          <Select
            className={classes.select}
            displayEmpty
            value={filter}
            onChange={(e) => onFilterChange(e.target.value as FilterType)}
            renderValue={(value) => {
              const option = filterOptions.find((opt) => opt.value === value);
              return (
                <Box className={classes.menuItem}>
                  {option?.icon}
                  {option?.label}
                </Box>
              );
            }}
          >
            {filterOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} className={classes.menuItem}>
                {opt.icon}
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      )}
    </Grid>
  );
};
