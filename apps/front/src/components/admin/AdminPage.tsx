import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import GroupsIcon from '@mui/icons-material/Groups'
import ManageHistoryIcon from '@mui/icons-material/ManageHistory'
import { Box, Grid, styled, Typography } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'

import { environment } from '../../environment'
import { Card } from '../common/Card'
import { Title } from '../common/Title'
import { SEO } from '../SEO'

const AdminCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  gap: theme.spacing(2),
}))

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 80,
  height: 80,
  borderRadius: '50%',
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.primary.main,
  '& svg': {
    fontSize: 40,
  },
}))

export const AdminPage = () => {
  const navigate = useNavigate()

  const adminSections = [
    {
      id: 'users',
      title: 'Utilisateurs',
      description: 'Gérer les utilisateurs de la plateforme',
      icon: <GroupsIcon />,
      onClick: () => navigate({ to: '/admin/users' }),
    },
    {
      id: 'events',
      title: 'Évènements',
      description: 'Gérer les évènements créés',
      icon: <CalendarMonthIcon />,
      onClick: () => navigate({ to: '/admin/events' }),
    },
    {
      id: 'queues',
      title: 'Gestion des queues',
      description: 'Accéder au dashboard de gestion des queues bullMQ',
      icon: <ManageHistoryIcon />,
      onClick: () => window.open(`${environment.baseUrl}/queues`, '_blank'),
    },
  ]

  return (
    <>
      <SEO title="Administration" description="Panneau d'administration de Wishlist." canonical="/admin" noindex />
      <Box>
        <Title>Administration</Title>

        <Grid container spacing={3}>
          {adminSections.map(section => (
            <Grid key={section.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <AdminCard hoverable onClick={() => section.onClick()}>
                <IconWrapper>{section.icon}</IconWrapper>
                <Typography variant="h6" align="center" fontWeight={600}>
                  {section.title}
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary">
                  {section.description}
                </Typography>
              </AdminCard>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  )
}
