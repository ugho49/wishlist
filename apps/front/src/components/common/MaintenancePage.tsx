import ConstructionIcon from '@mui/icons-material/Construction'
import { styled, Typography } from '@mui/material'

const MaintenancePageRoot = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
})

const MaintenancePageMessage = styled('div')({
  textAlign: 'center',
})

const ConstructionIconStyled = styled(ConstructionIcon)({
  marginBottom: '16px',
  fontSize: '72px',
})

export const MaintenancePage = () => {
  return (
    <MaintenancePageRoot>
      <ConstructionIconStyled />
      <MaintenancePageMessage>
        <Typography variant="h4" gutterBottom>
          Site en maintenance
        </Typography>
        <Typography variant="body1">Nous sommes désolés pour le dérangement. Veuillez réessayer plus tard.</Typography>
      </MaintenancePageMessage>
    </MaintenancePageRoot>
  )
}
