import React, { useState } from 'react';
import {
  AppBar, Toolbar, Box, Typography, Button, IconButton,
  Badge, Drawer, List, ListItem, ListItemText, Divider,
  Avatar, Popover, Stack
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import UserAvatar from './UserAvatar.jsx';

export default function Navbar() {
  const { user, notifications, markNotificationsRead } = useApp();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const unread = notifications.filter(n => !n.read).length;

  const navLinks = [
    { label: 'Find a Ride', path: '/' },
    { label: 'Offer a Ride', path: '/offer' },
    { label: 'Community', path: '/community' },
    { label: 'My Rides', path: '/my-rides' },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: '#fff',
        borderBottom: '1px solid #F0E6DC',
        top: 0,
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ gap: 1, px: { xs: 2, md: 4 } }}>
        {/* Logo */}
        <Box component={Link} to="/" sx={{ textDecoration: 'none', mr: 3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="h5" fontWeight={900} sx={{
            background: 'linear-gradient(135deg, #E8650A, #FF8C42)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Saathi
          </Typography>
        </Box>

        {/* Desktop nav */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flex: 1 }}>
          {navLinks.map(link => (
            <Button
              key={link.path}
              component={Link}
              to={link.path}
              size="small"
              sx={{
                color: location.pathname === link.path ? 'primary.main' : 'text.secondary',
                fontWeight: location.pathname === link.path ? 700 : 500,
                borderBottom: location.pathname === link.path ? '2px solid' : '2px solid transparent',
                borderRadius: 0,
                borderColor: 'primary.main',
                pb: 0.25,
                '&:hover': { bgcolor: 'transparent', color: 'primary.main' },
              }}
            >
              {link.label}
            </Button>
          ))}
        </Box>

        {/* Post a ride CTA */}
        <Button
          component={Link}
          to="/offer"
          variant="contained"
          size="small"
          startIcon={<AddCircleOutlineIcon />}
          sx={{ display: { xs: 'none', sm: 'flex' }, mr: 1 }}
        >
          Post a ride
        </Button>

        {/* Notifications */}
        <IconButton
          onClick={e => { setNotifAnchor(e.currentTarget); markNotificationsRead(); }}
          size="small"
        >
          <Badge badgeContent={unread} color="error">
            <NotificationsIcon sx={{ color: 'text.secondary' }} />
          </Badge>
        </IconButton>

        <Popover
          open={Boolean(notifAnchor)}
          anchorEl={notifAnchor}
          onClose={() => setNotifAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { width: 320, borderRadius: 2, mt: 1 } }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #F0E6DC' }}>
            <Typography fontWeight={700}>Notifications</Typography>
          </Box>
          {notifications.map(n => (
            <Box key={n.id} sx={{ px: 2, py: 1.5, bgcolor: n.read ? 'transparent' : '#FFF8F2', borderBottom: '1px solid #F0E6DC' }}>
              <Typography variant="body2">{n.text}</Typography>
              <Typography variant="caption" color="text.secondary">{n.time}</Typography>
            </Box>
          ))}
        </Popover>

        {/* User avatar */}
        <Box component={Link} to="/profile" sx={{ textDecoration: 'none' }}>
          <UserAvatar name={user.name} initials={user.initials} size={34} verified={user.verified} />
        </Box>

        {/* Mobile menu */}
        <IconButton
          sx={{ display: { xs: 'flex', md: 'none' } }}
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 240, pt: 2 }}>
          <Box sx={{ px: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <UserAvatar name={user.name} initials={user.initials} size={40} />
            <Box>
              <Typography fontWeight={700}>{user.name}</Typography>
              <Typography variant="caption" color="text.secondary">{user.city}</Typography>
            </Box>
          </Box>
          <Divider />
          <List>
            {navLinks.map(link => (
              <ListItem
                key={link.path}
                component={Link}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                sx={{
                  color: location.pathname === link.path ? 'primary.main' : 'text.primary',
                  fontWeight: location.pathname === link.path ? 700 : 400,
                  textDecoration: 'none',
                }}
              >
                <ListItemText primary={link.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
