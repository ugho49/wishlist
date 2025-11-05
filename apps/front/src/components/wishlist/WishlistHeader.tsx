import type { DetailedWishlistDto } from '@wishlist/common'
import type { FilterType, SortType } from './WishlistFilterAndSortItems'

import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import EditIcon from '@mui/icons-material/Edit'
import FilterListIcon from '@mui/icons-material/FilterList'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PersonIcon from '@mui/icons-material/Person'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import PublicIcon from '@mui/icons-material/Public'
import SortIcon from '@mui/icons-material/Sort'
import {
  Avatar,
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
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { grey } from '@mui/material/colors'
import { useState } from 'react'

import { Card } from '../common/Card'
import { filterOptions, sortOptions } from './WishlistFilterAndSortItems'

const HeaderStack = styled(Stack)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(3),
  },
}))

const LeftSection = styled(Box)({
  flex: 1,
  minWidth: 0,
})

const AvatarTitleContainer = styled(Stack)({
  flexDirection: 'row',
  gap: '16px',
  alignItems: 'center',
})

const AvatarWrapper = styled(Box)({
  flexShrink: 0,
})

const TitleContainer = styled(Box)({
  flex: 1,
  minWidth: 0,
})

const WishlistTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 400,
  color: theme.palette.primary.main,
  marginTop: 0,
  marginBottom: theme.spacing(0.5),
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

const MetadataStack = styled(Stack)({
  flexDirection: 'row',
  gap: '8px',
  flexWrap: 'wrap',
  alignItems: 'center',
})

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

const MainActionButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.875rem',
  padding: theme.spacing(1, 2),
  [theme.breakpoints.down('md')]: {
    flex: 1,
  },
}))

const CompactIconButton = styled(IconButton)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  height: '40px',
  width: '40px',
}))

const ImportButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.875rem',
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  border: 'none',
  height: '40px',
  '&:hover': {
    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
    transform: 'translateY(-1px)',
  },
  '& .MuiButton-startIcon': {
    animation: 'sparkle 2s ease-in-out infinite',
  },
  '@keyframes sparkle': {
    '0%, 100%': {
      transform: 'scale(1) rotate(0deg)',
      opacity: 1,
    },
    '50%': {
      transform: 'scale(1.2) rotate(180deg)',
      opacity: 0.8,
    },
  },
  transition: 'all 0.3s ease',
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
  onNavigateToEdit: () => void
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
  onNavigateToEdit,
}: WishlistHeaderProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [actionsAnchorEl, setActionsAnchorEl] = useState<null | HTMLElement>(null)
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null)
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null)

  const actionsMenuOpen = Boolean(actionsAnchorEl)
  const sortMenuOpen = Boolean(sortAnchorEl)
  const filterMenuOpen = Boolean(filterAnchorEl)

  const handleOpenActionsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setActionsAnchorEl(event.currentTarget)
  }

  const handleCloseActionsMenu = () => {
    setActionsAnchorEl(null)
  }

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

  const handleEdit = () => {
    handleCloseActionsMenu()
    onNavigateToEdit()
  }

  const hasActiveFilter = filter !== ''

  return (
    <Container maxWidth="lg" sx={{ paddingTop: 3 }}>
      <Card>
        <HeaderStack>
          {/* Left section - Avatar, Title and Metadata */}
          <LeftSection>
            <AvatarTitleContainer>
              <AvatarWrapper>
                <Avatar
                  src={wishlist.logo_url ?? wishlist.owner.picture_url}
                  sx={{ width: 56, height: 56, bgcolor: grey[200], color: grey[400] }}
                >
                  <PersonIcon fontSize="medium" />
                </Avatar>
              </AvatarWrapper>
              <TitleContainer>
                <WishlistTitle variant="h5" as="h1">
                  {wishlist.title}
                </WishlistTitle>

                {/* Metadata */}
                <MetadataStack>
                  {/* Show owner info only for public lists */}
                  {isPublic && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Avatar
                        src={wishlist.owner.picture_url}
                        sx={{ width: 20, height: 20, bgcolor: grey[200], color: grey[400] }}
                      >
                        <PersonOutlineOutlinedIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body2" color="text.secondary">
                        Créé par {wishlist.owner.firstname} {wishlist.owner.lastname}
                      </Typography>
                    </Box>
                  )}

                  {/* Event info as clickable text with icon */}
                  <Box
                    onClick={onOpenEventDialog}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      cursor: 'pointer',
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                      },
                      transition: 'color 0.2s',
                    }}
                  >
                    <CalendarMonthIcon fontSize="small" />
                    <Typography variant="body2">
                      {wishlist.events.length} {wishlist.events.length > 1 ? 'évènements' : 'évènement'}
                    </Typography>
                  </Box>

                  {/* Public indicator */}
                  {isPublic && (
                    <Tooltip title="Tout le monde peut ajouter, cocher ou voir les souhaits cochés, même le créateur de la liste">
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          color: 'primary.main',
                        }}
                      >
                        <PublicIcon fontSize="small" />
                        <Typography variant="body2" fontWeight={500}>
                          Liste publique
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                </MetadataStack>
              </TitleContainer>
            </AvatarTitleContainer>
          </LeftSection>

          {/* Right section - Filter, Sort and Actions */}
          <RightSection>
            {/* Import Button (only for owner with importable items) */}
            {currentUserCanEdit && hasImportableItems && (
              <Tooltip title="Importer des souhaits d'anciennes listes">
                <ImportButton startIcon={<AutoFixHighIcon />} onClick={onOpenImportDialog} size="small">
                  Importer
                </ImportButton>
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
            {currentUserCanEdit &&
              (isMobile ? (
                // Mobile: Single button with dropdown
                <CompactIconButton size="small" onClick={handleOpenActionsMenu}>
                  <MoreVertIcon fontSize="small" />
                </CompactIconButton>
              ) : (
                // Desktop: Edit button
                <MainActionButton
                  variant="outlined"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={onNavigateToEdit}
                  sx={{ height: '40px' }}
                >
                  Modifier
                </MainActionButton>
              ))}
          </RightSection>
        </HeaderStack>
      </Card>

      {/* Actions Menu (Mobile only) */}
      <Menu
        id="wishlist-actions-menu"
        anchorEl={actionsAnchorEl}
        open={actionsMenuOpen}
        onClose={handleCloseActionsMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Modifier</ListItemText>
        </MenuItem>
      </Menu>

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
