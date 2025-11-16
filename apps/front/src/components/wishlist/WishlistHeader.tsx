import type { DetailedWishlistDto } from '@wishlist/common'
import type { FilterType, SortType } from './WishlistFilterAndSortItems'

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import EditIcon from '@mui/icons-material/Edit'
import FilterListIcon from '@mui/icons-material/FilterList'
import PublicIcon from '@mui/icons-material/Public'
import SortIcon from '@mui/icons-material/Sort'
import {
  Box,
  Button,
  Container,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  styled,
  Tooltip,
  Typography,
} from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'

import { getAvatarUrl } from '../../utils/wishlist.utils'
import { ImportItemsButton } from './ImportItemsButton'
import { WishlistAvatar } from './WishlistAvatar'
import { filterOptions, sortOptions } from './WishlistFilterAndSortItems'

const HeaderContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(3),

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}))

const LeftSection = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.spacing(3),
  alignItems: 'center',
  flex: 1,
}))

const TitleContainer = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1),
  flex: 1,
  minWidth: 0,
}))

const WishlistTitle = styled(Box)(({ theme }) => ({
  fontWeight: 400,
  color: theme.palette.primary.main,
  marginTop: 0,
  lineHeight: 1.2,
  wordBreak: 'break-word',
  overflow: 'hidden',

  [theme.breakpoints.down('md')]: {
    fontSize: '1.25rem',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '1.5rem',
  },
}))

const EventInfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  cursor: 'pointer',
  '&:hover': {
    color: theme.palette.primary.main,
  },
}))

const PublicIndicatorBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  color: theme.palette.text.secondary,
}))

const MetadataStack = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.spacing(3),
  flexWrap: 'wrap',
  alignItems: 'flex-start',

  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
}))

const RightSection = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    justifyContent: 'center',
  },
}))

const UpdateButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.875rem',
  padding: theme.spacing(1, 2),
  border: `1px solid ${theme.palette.divider}`,
}))

const CompactIconButton = styled(IconButton)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  height: '40px',
  width: '40px',
}))

export type WishlistHeaderProps = {
  wishlist: DetailedWishlistDto
  currentUserCanEdit: boolean
  isPublic: boolean
  hasImportableItems: boolean
  sort: SortType
  filter: FilterType
  onSortChange: (sort: SortType) => void
  onFilterChange: (filter: FilterType) => void
  onOpenEventDialog: () => void
  onOpenImportDialog: () => void
}

export const WishlistHeader = ({
  wishlist,
  currentUserCanEdit,
  isPublic,
  hasImportableItems,
  sort,
  filter,
  onSortChange,
  onFilterChange,
  onOpenEventDialog,
  onOpenImportDialog,
}: WishlistHeaderProps) => {
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null)
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null)
  const navigate = useNavigate()
  const handleNavigateToEdit = useCallback(() => {
    void navigate({ to: '/wishlists/$wishlistId/edit', params: { wishlistId: wishlist.id } })
  }, [navigate, wishlist])

  const sortMenuOpen = Boolean(sortAnchorEl)
  const filterMenuOpen = Boolean(filterAnchorEl)

  const handleOpenSortMenu = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget)
  }

  const handleCloseSortMenu = () => {
    setSortAnchorEl(null)
  }

  const handleOpenFilterMenu = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget)
  }

  const handleCloseFilterMenu = () => {
    setFilterAnchorEl(null)
  }

  const handleSortChange = (newSort: SortType) => {
    onSortChange(newSort)
    handleCloseSortMenu()
  }

  const handleFilterChange = (newFilter: FilterType) => {
    onFilterChange(newFilter)
    handleCloseFilterMenu()
  }

  const hasActiveFilter = filter !== ''

  return (
    <Container maxWidth="lg">
      <HeaderContent>
        {/* Left section - Avatar, Title and Metadata */}
        <LeftSection>
          <WishlistAvatar
            src={getAvatarUrl({ wishlist, ownerPictureUrl: wishlist.owner.picture_url })}
            sx={{ width: 75, height: 75 }}
            iconSize="medium"
          />

          <TitleContainer>
            <WishlistTitle>{wishlist.title}</WishlistTitle>

            {/* Metadata */}
            <MetadataStack>
              {/* Event info as clickable text with icon */}
              <EventInfoBox onClick={onOpenEventDialog}>
                <CalendarMonthIcon fontSize="small" />
                <Typography variant="body2">
                  {wishlist.events.length} {wishlist.events.length > 1 ? 'évènements' : 'évènement'}
                </Typography>
              </EventInfoBox>

              {/* Public indicator */}
              {isPublic && (
                <Tooltip title="Tout le monde peut ajouter, cocher ou voir les souhaits cochés, même le créateur de la liste">
                  <PublicIndicatorBox>
                    <PublicIcon fontSize="small" />
                    <Typography variant="body2" fontWeight={500}>
                      Liste publique créée par {wishlist.owner.firstname} {wishlist.owner.lastname}
                      {wishlist.co_owner && (
                        <> et co-gérée par {wishlist.co_owner.firstname} {wishlist.co_owner.lastname}</>
                      )}
                    </Typography>
                  </PublicIndicatorBox>
                </Tooltip>
              )}
            </MetadataStack>
          </TitleContainer>
        </LeftSection>

        {/* Right section - Filter, Sort and Actions */}
        <RightSection>
          {/* Import Button (only for owner with importable items) */}
          {currentUserCanEdit && hasImportableItems && (
            <Tooltip title="Importer des souhaits d'anciennes listes">
              <ImportItemsButton onClick={onOpenImportDialog} sx={theme => ({ padding: theme.spacing(1, 2) })}>
                Importer
              </ImportItemsButton>
            </Tooltip>
          )}

          {/* Sort Button */}
          <Tooltip title="Trier">
            <CompactIconButton
              size="small"
              onClick={handleOpenSortMenu}
              color={sort !== 'name_asc' ? 'primary' : 'default'}
            >
              <SortIcon fontSize="small" />
            </CompactIconButton>
          </Tooltip>

          {/* Filter Button (only if not owner) */}
          {!currentUserCanEdit && (
            <Tooltip title="Filtrer">
              <CompactIconButton
                size="small"
                onClick={handleOpenFilterMenu}
                color={hasActiveFilter ? 'primary' : 'default'}
              >
                <FilterListIcon fontSize="small" />
              </CompactIconButton>
            </Tooltip>
          )}

          {/* Edit Actions (only for owner) */}
          {currentUserCanEdit && (
            // Desktop: Edit button
            <UpdateButton
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleNavigateToEdit}
              sx={{ height: '40px' }}
            >
              Modifier
            </UpdateButton>
          )}
        </RightSection>
      </HeaderContent>

      {/* Sort Menu */}
      <Menu
        id="sort-menu"
        anchorEl={sortAnchorEl}
        open={sortMenuOpen}
        onClose={handleCloseSortMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {sortOptions.map(opt => (
          <MenuItem key={opt.value} onClick={() => handleSortChange(opt.value)} selected={sort === opt.value}>
            <ListItemIcon>{opt.icon}</ListItemIcon>
            <ListItemText>{opt.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      {/* Filter Menu */}
      <Menu
        id="filter-menu"
        anchorEl={filterAnchorEl}
        open={filterMenuOpen}
        onClose={handleCloseFilterMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {filterOptions.map(opt => (
          <MenuItem key={opt.value} onClick={() => handleFilterChange(opt.value)} selected={filter === opt.value}>
            <ListItemIcon>{opt.icon}</ListItemIcon>
            <ListItemText>{opt.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Container>
  )
}
