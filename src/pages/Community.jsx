import React from 'react';
import {
  Box, Typography, Grid, Paper, Chip, Avatar, Button,
  Divider, Stack, LinearProgress
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FavoriteIcon from '@mui/icons-material/Favorite';

import UserAvatar from '../components/UserAvatar.jsx';
import PageLayout from '../components/PageLayout.jsx';

const topMembers = [
  { name: 'Vijay Patel', initials: 'VP', rides: 67, city: 'Frisco', badge: '🏅 Founding member', verified: true },
  { name: 'Deepa Iyer', initials: 'DI', rides: 42, city: 'Plano', badge: '⭐ Community elder', verified: true },
  { name: 'Rahul Sharma', initials: 'RS', rides: 34, city: 'Dallas', badge: null, verified: true },
  { name: 'Ananya Krishnan', initials: 'AK', rides: 18, city: 'Houston', badge: null, verified: true },
  { name: 'Sunita Mehta', initials: 'SM', rides: 12, city: 'Chicago', badge: null, verified: false },
];

const activities = [
  { text: 'Vijay P. gave a free temple ride to 4 members', time: '2h ago', icon: '🛕' },
  { text: 'Deepa I. helped Neel K.\'s parents from the airport', time: '5h ago', icon: '✈️' },
  { text: 'Rahul S. completed his 34th community ride!', time: '1d ago', icon: '🎉' },
  { text: '3 new members joined from Houston', time: '2d ago', icon: '👋' },
  { text: 'Sunita M. got 5 ride offers for her family trip', time: '3d ago', icon: '🙏' },
];

export default function Community() {
  return (
    // <Box sx={{ maxWidth: 1000, mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
    <PageLayout>
      <Typography variant="h5" fontWeight={800} mb={0.5}>
        Saathi <span style={{ color: '#E8650A' }}>Community</span>
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Built on trust, referrals, and shared roots 🙏
      </Typography>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          // { icon: '👥', value: communityStats.members.toLocaleString(), label: 'Members', color: '#E8650A' },
          // { icon: '🚗', value: communityStats.ridesGiven.toLocaleString(), label: 'Rides given', color: '#4361EE' },
          // { icon: '🏙️', value: communityStats.cities, label: 'Cities', color: '#2D6A4F' },
          // { icon: '⭐', value: communityStats.avgRating, label: 'Avg rating', color: '#F4A261' },
        ].map(stat => (
          <Grid item xs={6} sm={3} key={stat.label}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, border: '1px solid #F0E6DC' }} elevation={0}>
              <Typography fontSize="1.8rem">{stat.icon}</Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color: stat.color }}>{stat.value}</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>{stat.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Top members */}
        <Grid xs={12} md={7}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #F0E6DC' }} elevation={0}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <EmojiEventsIcon sx={{ color: '#F4A261' }} />
              <Typography fontWeight={700}>Top Community Members</Typography>
            </Box>
            {topMembers.map((member, i) => (
              <Box key={member.name}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25 }}>
                  <Typography fontWeight={800} color="text.secondary" fontSize="0.9rem" sx={{ width: 20, textAlign: 'center' }}>
                    {i + 1}
                  </Typography>
                  <UserAvatar name={member.name} initials={member.initials} size={40} verified={member.verified} />
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={600} fontSize="0.9rem">{member.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{member.city}</Typography>
                    {member.badge && (
                      <Typography variant="caption" sx={{ display: 'block', color: '#E8650A', fontWeight: 600 }}>
                        {member.badge}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography fontWeight={700} color="primary.main" fontSize="0.9rem">{member.rides}</Typography>
                    <Typography variant="caption" color="text.secondary">rides</Typography>
                  </Box>
                </Box>
                {i < topMembers.length - 1 && <Divider />}
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Activity feed + invite */}
        <Grid xs={12} md={5}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #F0E6DC', mb: 2 }} elevation={0}>
            <Typography fontWeight={700} mb={1.5}>Recent Activity</Typography>
            {activities.map((a, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1.25, mb: 1.5 }}>
                <Typography fontSize="1.1rem">{a.icon}</Typography>
                <Box>
                  <Typography variant="body2" lineHeight={1.4}>{a.text}</Typography>
                  <Typography variant="caption" color="text.secondary">{a.time}</Typography>
                </Box>
              </Box>
            ))}
          </Paper>

          {/* Invite card */}
          <Paper
            sx={{
              p: 2.5, borderRadius: 3,
              background: 'linear-gradient(135deg, #E8650A 0%, #FF8C42 100%)',
              color: '#fff',
            }}
            elevation={0}
          >
            <Typography fontWeight={800} fontSize="1.05rem" mb={0.5}>Invite a friend 🙏</Typography>
            <Typography variant="body2" mb={2} sx={{ opacity: 0.9 }}>
              Saathi grows through trust. Invite someone from your community to join — your referral builds their credibility.
            </Typography>
            <Button
              variant="contained"
              size="small"
              sx={{ bgcolor: '#fff', color: '#E8650A', fontWeight: 700, '&:hover': { bgcolor: '#FFF8F2' } }}
            >
              Share invite link
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </PageLayout>
    // </Box>
  );
}
