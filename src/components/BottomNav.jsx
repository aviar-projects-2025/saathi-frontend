import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PersonIcon from '@mui/icons-material/Person';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Home', icon: <HomeIcon />, path: '/home' },
  { label: 'Find Rides', icon: <SearchIcon />, path: '/find' },
  { label: 'Post', icon: <AddCircleIcon sx={{ fontSize: 32 }} />, path: '/post' },
  { label: 'Invite', icon: <GroupAddIcon />, path: '/invite' },
  { label: 'Profile', icon: <PersonIcon />, path: '/profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const current = navItems.findIndex(n => n.path === location.pathname);

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        borderTop: '1px solid #F0E8E4',
        '& .MuiBottomNavigation-root': { bgcolor: '#fff' },
      }}
    >
      <BottomNavigation value={current === -1 ? false : current} showLabels>
        {navItems.map((item, i) => (
          <BottomNavigationAction
            key={item.label}
            label={item.label}
            icon={item.icon}
            onClick={() => navigate(item.path)}
            sx={{
              '&.Mui-selected .MuiBottomNavigationAction-label': { fontWeight: 700 },
              minWidth: 0,
              px: 0.5,
              '& .MuiSvgIcon-root': item.path === '/post' ? {
                color: current === i ? '#E85D26' : '#ccc',
              } : {},
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
