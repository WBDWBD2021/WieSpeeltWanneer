import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';

export const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Wedstrijden', icon: <SportsTennisIcon />, path: '/wedstrijden' },
  { text: 'Spelers', icon: <PeopleIcon />, path: '/spelers' },
  { text: 'Clubs', icon: <BusinessIcon />, path: '/clubs' },
  { text: 'Teams', icon: <PeopleIcon />, path: '/teams' },
  { text: 'Competities', icon: <SportsTennisIcon />, path: '/competities' },
];

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <List sx={{ width: 240, bgcolor: 'background.paper', p: 2, borderRight: '1px solid rgba(0,0,0,0.05)' }}>
      {menuItems.slice(0, 3).map((item) => { // Standard items: Dashboard, Wedstrijden, Spelers
        const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));

        return (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                color: active ? 'primary.main' : 'text.secondary',
                bgcolor: active ? 'rgba(21, 101, 192, 0.08)' : 'transparent',
                '&:hover': {
                  bgcolor: active ? 'rgba(21, 101, 192, 0.12)' : 'rgba(0,0,0,0.04)',
                },
              }}
            >
              <ListItemIcon sx={{ color: active ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: active ? 600 : 400,
                  fontSize: '0.95rem'
                }}
              />
            </ListItemButton>
          </ListItem>
        );
      })}

      {/* Beheer Sectie */}
      <Box sx={{ mt: 2, mb: 1, pl: 2 }}>
        <Typography variant="overline" color="text.secondary" fontWeight="bold">
          Beheer
        </Typography>
      </Box>

      {/* Clubs Link (was Clubs & Teams) */}
      <ListItem disablePadding sx={{ mb: 1 }}>
        <ListItemButton
          selected={location.pathname === '/clubs'}
          onClick={() => navigate('/clubs')}
          sx={{
            borderRadius: 2,
            color: location.pathname === '/clubs' ? 'primary.main' : 'text.secondary',
            bgcolor: location.pathname === '/clubs' ? 'rgba(21, 101, 192, 0.08)' : 'transparent',
            '&:hover': { bgcolor: location.pathname === '/clubs' ? 'rgba(21, 101, 192, 0.12)' : 'rgba(0,0,0,0.04)' }
          }}
        >
          <ListItemIcon sx={{ color: location.pathname === '/clubs' ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
            <BusinessIcon />
          </ListItemIcon>
          <ListItemText primary="Clubs" primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: location.pathname === '/clubs' ? 600 : 400 }} />
        </ListItemButton>
      </ListItem>

      {/* Teams Link */}
      <ListItem disablePadding sx={{ mb: 1 }}>
        <ListItemButton
          selected={location.pathname === '/teams'}
          onClick={() => navigate('/teams')}
          sx={{
            borderRadius: 2,
            color: location.pathname === '/teams' ? 'primary.main' : 'text.secondary',
            bgcolor: location.pathname === '/teams' ? 'rgba(21, 101, 192, 0.08)' : 'transparent',
            '&:hover': { bgcolor: location.pathname === '/teams' ? 'rgba(21, 101, 192, 0.12)' : 'rgba(0,0,0,0.04)' }
          }}
        >
          <ListItemIcon sx={{ color: location.pathname === '/teams' ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Teams" primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: location.pathname === '/teams' ? 600 : 400 }} />
        </ListItemButton>
      </ListItem>

      {/* Competities Link */}
      <ListItem disablePadding sx={{ mb: 1 }}>
        <ListItemButton
          selected={location.pathname === '/competities'}
          onClick={() => navigate('/competities')}
          sx={{
            borderRadius: 2,
            color: location.pathname === '/competities' ? 'primary.main' : 'text.secondary',
            bgcolor: location.pathname === '/competities' ? 'rgba(21, 101, 192, 0.08)' : 'transparent',
            '&:hover': { bgcolor: location.pathname === '/competities' ? 'rgba(21, 101, 192, 0.12)' : 'rgba(0,0,0,0.04)' }
          }}
        >
          <ListItemIcon sx={{ color: location.pathname === '/competities' ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
            <SportsTennisIcon />
          </ListItemIcon>
          <ListItemText primary="Competities" primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: location.pathname === '/competities' ? 600 : 400 }} />
        </ListItemButton>
      </ListItem>

    </List>
  );
};

export default Navigation;
