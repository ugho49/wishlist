import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';

export const Footer = () => {
  const [currentNavigation, setCurrentNavigation] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
    setCurrentNavigation(newValue);
  };

  useEffect(() => {
    const { pathname } = location;
    setCurrentNavigation(pathname);
  }, [location]);

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3} component="nav">
      <BottomNavigation showLabels value={currentNavigation} onChange={handleChange}>
        <BottomNavigationAction label="Évènements" value="/events" icon={<CalendarMonthIcon />} />
        <BottomNavigationAction label="Mes listes" value="/wishlists" icon={<FormatListBulletedIcon />} />
        <BottomNavigationAction label="Mon profil" value="/user/profile" icon={<PersonIcon />} />
      </BottomNavigation>
    </Paper>
  );
};
