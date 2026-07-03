import React from 'react';
import { Avatar, Box, Tooltip } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';

const colorMap = {
  A: '#E8650A', B: '#4361EE', C: '#2D6A4F', D: '#9B2226', E: '#AE2012',
  F: '#CA6702', G: '#0077B6', H: '#7B2D8B', I: '#E76F51', J: '#264653',
  K: '#457B9D', L: '#E63946', M: '#F4A261', N: '#2A9D8F', O: '#6D6875',
  P: '#E8650A', Q: '#3A86FF', R: '#FB5607', S: '#8338EC', T: '#06D6A0',
  U: '#EF476F', V: '#118AB2', W: '#073B4C', X: '#B5179E', Y: '#7209B7',
  Z: '#3A0CA3',
};

export default function UserAvatar({ name, profile, firstName, lastName, initials, size = 40, currentUser, verified, sx = {} }) {
  const letter = (initials || name || 'U')[0].toUpperCase();
  const bg = colorMap[letter] || '#E8650A';
  const user = JSON.parse(localStorage.getItem('user'))

  const SAFFRON = "#E8650A";
  const SAFFRON_LIGHT = "#FDF0E8";
  const CARD_BORDER = "1px solid #F0E6DC";


  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', ...sx }}>
      {/* <Avatar
        sx={{
          width: size,
          height: size,
          bgcolor: bg,
          fontSize: size * 0.38,
          fontWeight: 700,
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          color: '#fff',
          border: '2px solid #fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        }}
      >
      </Avatar> */}


      <Avatar
        src={ profile || currentUser?.profileImage || ""}
        sx={{
          width: { xs: 30, sm: 50, md: 50 },
          height: { xs: 30, sm: 50, md: 50 },
          bgcolor: SAFFRON,
          color: "#fff",
          fontWeight: 800,
          fontSize: { xs: "0.85rem", sm: "1rem", md: "1.15rem" },
          flexShrink: 0,
        }}
      >
        {!currentUser?.profileImage &&
          `${currentUser?.firstName?.[0] || ""}${currentUser?.lastName?.[0] || ""}`}
      </Avatar>


      {verified && (
        <Tooltip title="Verified member">
          <VerifiedIcon
            sx={{
              position: 'absolute',
              bottom: -2,
              right: -4,
              fontSize: size * 0.42,
              color: '#4361EE',
              bgcolor: '#fff',
              borderRadius: '50%',
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
}
