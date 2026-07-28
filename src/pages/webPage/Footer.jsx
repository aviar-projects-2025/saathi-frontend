import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import {
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  YouTube as YouTubeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import SaathiLogo from '../../assets/saathilogo.png';

// ──────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────

const socialIcons = [
  {
    name: 'Instagram',
    icon: InstagramIcon,
    link: '#',
  },
  {
    name: 'Facebook',
    icon: FacebookIcon,
    link: '#',
  },
  {
    name: 'Twitter',
    icon: TwitterIcon,
    link: '#',
  },
  {
    name: 'YouTube',
    icon: YouTubeIcon,
    link: '#',
  },
];

const Footer = () => (
  <Box
    component="footer"
    sx={{
      bgcolor: '#0D1117',
      color: '#fff',
      pt: { xs: 7, md: 9 },
      pb: 4,
    }}
  >
    <Container maxWidth="lg">
      <Grid container spacing={{ xs: 5, md: 8 }}>
        {/* Brand Section */}
        <Grid item xs={12}>
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Box
              sx={{
                width: { xs: 64, md: 72 },
                height: { xs: 64, md: 72 },
                borderRadius: 3,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#fff", // optional
              }}
            >
              <Box
                component="img"
                src={SaathiLogo}// Replace with your image path
                alt="Saathi Logo"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover", // use "contain" if you don't want cropping
                }}
              />
            </Box>

            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Saathi
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  maxWidth: 600,
                  mx: 'auto',
                  color: 'rgba(255,255,255,.68)',
                  lineHeight: 1.8,
                }}
              >
                India's most trusted travel companion platform. Connect,
                share rides, split costs, and explore together with
                verified travelers.
              </Typography>
            </Box>

            {/* <Stack direction="row" spacing={1.5} justifyContent="center">
              {socialIcons.map(({ name, icon: Icon, link }) => (
                <IconButton
                  key={name}
                  component="a"
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  sx={{
                    width: 42,
                    height: 42,
                    border: '1px solid rgba(255,255,255,.12)',
                    color: 'rgba(255,255,255,.6)',
                    transition: '.3s',

                    '&:hover': {
                      color: '#FF6B35',
                      borderColor: '#FF6B35',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              ))}
            </Stack> */}
          </Stack>
        </Grid>

        {/* Contact Section */}
        <Grid item xs={12}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 3, md: 6 }}
            justifyContent="center"
            alignItems="center"
          >
            {[
              {
                Icon: PhoneIcon,
                text: '+91 - 86680 65758',
              },
              {
                Icon: EmailIcon,
                text: 'aviar@aviartechservices.com',
              },
              {
                Icon: LocationIcon,
                text: 'Thiruvannamalai, Tamil Nadu, India',
              },
            ].map(({ Icon, text }) => (
              <Stack key={text} direction="row" spacing={1.5} alignItems="center">
                <Icon
                  sx={{
                    color: '#FF6B35',
                    fontSize: 20,
                  }}
                />

                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,.68)',
                  }}
                >
                  {text}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Grid>
      </Grid>

      <Divider
        sx={{
          my: { xs: 5, md: 6 },
          bgcolor: 'rgba(255,255,255,.08)',
        }}
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        justifyContent="center"
        alignItems="center"
      >
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255,255,255,.45)',
            textAlign: 'center',
          }}
        >
          © 2026 AVIAR Technology Services
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255,255,255,.45)',
            textAlign: 'center',
          }}
        >
          Made in India
        </Typography>
      </Stack>
    </Container>
  </Box>
);

export default Footer;