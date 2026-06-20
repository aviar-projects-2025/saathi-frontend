
import { Outlet } from "react-router-dom";
import React, { useState } from "react";
// import OfferARide from "./OfferARide";
// import Community from "./Community";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Box,
  Typography,
  Tabs,
  Tab,
  Badge,
  Button,
  Avatar,
  Grid,
  Paper,
  Chip,
  IconButton,
  Stack,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AddIcon from "@mui/icons-material/Add";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import ChildFriendlyIcon from "@mui/icons-material/ChildFriendly";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PlaceIcon from "@mui/icons-material/Place";
import LuggageIcon from "@mui/icons-material/Luggage";
import GroupsIcon from "@mui/icons-material/Groups";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import HandshakeIcon from "@mui/icons-material/Handshake";
import SettingsIcon from "@mui/icons-material/Settings";
// import FindARide from "./FindARide";
// import MyRides from "./MyRides";

import { Link, useLocation } from "react-router-dom";

const userMenus = [
  { label: "Home", path: "/home" },
  { label: "Find Ride", path: "/find" },
  { label: "Offer Ride", path: "/offerRide" },
  { label: "My Rides", path: "/myRide" },
  { label: "Community", path: "/community" },
  { label: "Profile", path: "/profile" },
  { label: "Notifications", path: "/notification" },
];

/* ---------------------------------- THEME ---------------------------------- */

const theme = createTheme({
  palette: {
    primary: { main: "#F2762E" }, // Saathi orange
    secondary: { main: "#1E8E73" }, // Saathi teal
    success: { main: "#2E9E5B" },
    background: { default: "#FAFAFA", paper: "#FFFFFF" },
    text: { primary: "#1F2430", secondary: "#7C8493" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: `"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
    h1: { fontWeight: 800 },
  },
});

/* ---------------------------------- DATA ---------------------------------- */

export const RIDE_TYPES = [
  { key: "airport", label: "Airport pickups", icon: <FlightTakeoffIcon fontSize="small" />, count: 4 },
  { key: "carpool", label: "City carpools", icon: <DirectionsCarIcon fontSize="small" />, count: null },
  { key: "temple", label: "Temple & events", icon: <AccountBalanceIcon fontSize="small" />, count: null },
  { key: "parents", label: "Parents visiting", icon: <FamilyRestroomIcon fontSize="small" />, count: null },
];

export const CITIES = ["Dallas, TX", "Chicago, IL", "Houston, TX"];

export const FILTER_CHIPS = [
  { key: "all", label: "All rides", icon: null },
  { key: "airport", label: "Airport", icon: <FlightTakeoffIcon sx={{ fontSize: 16 }} /> },
  { key: "intercity", label: "Intercity", icon: <DirectionsBusIcon sx={{ fontSize: 16 }} /> },
  { key: "local", label: "Local", icon: <LocationOnIcon sx={{ fontSize: 16 }} /> },
  { key: "free", label: "Free rides", icon: <CardGiftcardIcon sx={{ fontSize: 16 }} /> },
  { key: "kid", label: "Kid-friendly", icon: <ChildFriendlyIcon sx={{ fontSize: 16 }} /> },
];

export const RIDES = [
  {
    id: 1,
    name: "Rahul Sharma",
    initials: "RS",
    rating: 4.8,
    rideCount: 34,
    homeCity: "Dallas",
    referredBy: "Meena R.",
    referralNote: "in your network",
    status: "Offering",
    tag: "airport",
    tagLabel: "Airport",
    from: "Plano, TX",
    to: "DFW Airport — Terminal D",
    distance: "~35 min drive",
    note: "Returning from ORD pickup, have 2 spare seats on the way back. Parents with luggage welcome. Hindi & English spoken. 🙏",
    date: "Dec 18, 6:00 AM",
    seats: "2 seats left",
    luggage: "Luggage ok",
    price: "$15",
    priceUnit: "/person",
    free: false,
    section: "main",
  },
  {
    id: 2,
    name: "Sunita Mehta",
    initials: "SM",
    rating: 5.0,
    rideCount: 12,
    homeCity: "Chicago",
    referredBy: "Ananya K.",
    referralNote: "2nd degree",
    status: "Needs ride",
    tag: "intercity",
    tagLabel: "Intercity",
    from: "Chicago, IL",
    to: "Dallas, TX",
    distance: "~14 hr drive",
    note: "3 family members (2 adults + 1 child age 8). Visiting for cousin's wedding Dec 20–22. Flexible on timing. Will share gas + tolls generously. Hindi speaking preferred 🙏",
    date: "Dec 20, flexible",
    familySize: "Family of 3",
    costShare: "Gas + tolls",
    free: false,
    section: "main",
  },
  {
    id: 3,
    name: "Vijay Patel",
    initials: "VP",
    rating: 4.9,
    rideCount: 67,
    homeCity: "Frisco",
    referredBy: "Founding member",
    referralNote: "highest trust",
    status: "Offering",
    tag: "temple",
    tagLabel: "Temple run",
    from: "Frisco Costco parking lot",
    to: "BAPS Swaminarayan Mandir",
    distance: "~20 min drive",
    note: "Weekly Darshan carpool every Sunday morning. Departing 9:00 AM sharp from Frisco. Gujarati & Hindi spoken. No charge — seva 🙏",
    date: "Every Sunday, 9:00 AM",
    free: true,
    section: "free",
  },
  {
    id: 4,
    name: "Anjali Rao",
    initials: "AR",
    rating: 4.7,
    rideCount: 21,
    homeCity: "Irving",
    referredBy: "Rahul S.",
    referralNote: "in your network",
    status: "Offering",
    tag: "local",
    tagLabel: "Local",
    from: "Irving, TX",
    to: "Dallas Galleria Mall",
    distance: "~20 min drive",
    note: "Weekend shopping run, happy to swing by nearby apartments. 3 seats open, kids welcome with car seats provided.",
    date: "Dec 19, 11:00 AM",
    seats: "3 seats left",
    price: "$8",
    priceUnit: "/person",
    free: false,
    section: "main",
  },
  {
    id: 5,
    name: "Karan Singh",
    initials: "KS",
    rating: 4.6,
    rideCount: 9,
    homeCity: "Dallas",
    referredBy: "Sunita M.",
    referralNote: "2nd degree",
    status: "Needs ride",
    tag: "airport",
    tagLabel: "Airport",
    from: "Dallas, TX",
    to: "DFW Airport — Terminal A",
    distance: "~30 min drive",
    note: "Parents flying in for the holidays, need a kid-friendly ride with space for 2 large suitcases.",
    date: "Dec 22, 7:30 PM",
    seats: "1 seat needed",
    free: false,
    section: "main",
  },
  {
    id: 6,
    name: "Meena Reddy",
    initials: "MR",
    rating: 5.0,
    rideCount: 45,
    homeCity: "Plano",
    referredBy: "Community elder",
    referralNote: "highest trust",
    status: "Offering",
    tag: "kid",
    tagLabel: "Kid-friendly",
    from: "Plano, TX",
    to: "Frisco Library",
    distance: "~15 min drive",
    note: "Daily school carpool seva for the weekend Telugu classes. Booster seats available. No charge.",
    date: "Dec 21, 9:00 AM",
    free: true,
    section: "free",
  },
];

/* -------------------------------- SUB PARTS -------------------------------- */

const NAV_ITEMS = [
  {
    label: "Find a Ride",
    icon: <LocationOnIcon fontSize="small" />,
    path: "/find-ride",
  },
  {
    label: "Offer a Ride",
    icon: <DirectionsCarIcon fontSize="small" />,
    path: "/offer-ride",
  },
  {
    label: "Community",
    icon: <GroupsIcon fontSize="small" />,
    path: "/community",
  },
  {
    label: "My Rides",
    icon: <EventSeatIcon fontSize="small" />,
    path: "/myride",
  },
  {
    label: "My Referrals",
    icon: <HandshakeIcon fontSize="small" />,
    path: "/my-referalls",
  },
  {
    label: "Settings",
    icon: <SettingsIcon fontSize="small" />,
    path: "/settings",
  },
];

function TopNav({ tab, onTabChange }) {
  const theme = useTheme();
  const isDesktopNav = useMediaQuery(theme.breakpoints.up("md"));
  const showPostLabel = useMediaQuery(theme.breakpoints.up("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();

  const currentTab = NAV_ITEMS.findIndex(
    (item) => item.path === location.pathname
  );

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: "1px solid #ECECEC",
        top: 0,
        zIndex: (t) => t.zIndex.appBar,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 56, md: 64 },
          px: { xs: 1, sm: 2, md: 3 },
          display: "flex",
          justifyContent: "space-between",
          position: "relative",
        }}
      >

        {/* LEFT - Mobile Menu + Logo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flex: 1,
          }}
        >
          {/* Mobile Hamburger */}
          <IconButton
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              mr: 1,
            }}
          >
            <MenuIcon />
          </IconButton>
          {/* Logo */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              letterSpacing: 0.2,
              flexShrink: 0,
            }}
          >
            <Box component="span" sx={{ color: "primary.main" }}>
              Saa
            </Box>

            <Box component="span" sx={{ color: "secondary.main" }}>
              thi
            </Box>
          </Typography>
        </Box>

        {/* CENTER NAVIGATION */}
        {isDesktopNav && (
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <Tabs
              value={currentTab === -1 ? false : currentTab}
              textColor="inherit"
              variant="scrollable"
              scrollButtons={false}
              TabIndicatorProps={{
                style: {
                  backgroundColor: "#F2762E",
                },
              }}
              sx={{
                minHeight: 64,
                "& .MuiTab-root": {
                  minHeight: 64,
                  textTransform: "none",
                  fontWeight: 500,
                  color: "#5A6170",
                },
                "& .Mui-selected": {
                  color: "#F2762E !important",
                  fontWeight: 700,
                },
              }}
            >
              {NAV_ITEMS.map((item) => (
                <Tab
                  key={item.label}
                  label={item.label}
                  icon={item.icon}
                  component={Link}
                  to={item.path}
                />
              ))}
            </Tabs>
          </Box>
        )}

        {/* RIGHT ACTIONS */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, md: 2 },
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          {/* Notification */}
          <IconButton size="small">
            <Badge
              badgeContent={2}
              color="error"
            >
              <Link to="/notification" >
                <NotificationsNoneIcon />
              </Link>
            </Badge>
          </IconButton>

          {/* Post Ride */}
          {showPostLabel ? (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                borderColor: "#E2E2E2",
                color: "text.primary",
                fontWeight: 600,
                display: { xs: "none", sm: "flex" },
              }}
            >
              <Link
                to="/offer-ride"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                Post a ride
              </Link>
            </Button>

          ) : (

            <IconButton
              sx={{
                border: "1px solid #E2E2E2",
                borderRadius: 2,
              }}
              color="primary"
            >
              <AddIcon fontSize="small" />

            </IconButton>
          )}

          {/* Avatar */}

          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: { xs: 30, md: 34 },
              height: { xs: 30, md: 34 },
              fontSize: 14,
            }}
          >
            PS
          </Avatar>
        </Box>
      </Toolbar>

      {/* MOBILE DRAWER */}

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      >

        <Box sx={{ width: 260 }}>
          {/* Drawer Logo */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #ECECEC"
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800
              }}
            >
              <Box
                component="span"
                sx={{
                  color: "primary.main"
                }}
              >
                Saa
              </Box>
              <Box
                component="span"
                sx={{
                  color: "secondary.main"
                }}
              >
                thi
              </Box>
            </Typography>
          </Box>

          <List>

            {NAV_ITEMS.map((item, i) => (
              <ListItemButton
                key={item.label}
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
                onClick={() => {
                  onTabChange(i);
                  setMobileOpen(false);
                }}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1.5,
                  "&.Mui-selected": {
                    bgcolor: "#FBEAE0",
                    color: "primary.main",
                  },
                  "&.Mui-selected .MuiListItemIcon-root": {
                    color: "primary.main"
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: tab === i ? 700 : 500
                  }}
                />

              </ListItemButton>

            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}

export const ProfileCard = () => {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, textAlign: "center" }}>
      <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56, mx: "auto", mb: 1, fontWeight: 700 }}>PS</Avatar>
      <Typography fontWeight={700}>Priya Sharma</Typography>
      <Typography variant="body2" color="text.secondary" mb={1.5}>
        Dallas · Verified member
      </Typography>

      <Grid container sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography fontWeight={700} color="primary.main">23</Typography>
          <Typography variant="caption" color="text.secondary">Rides</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography fontWeight={700} color="primary.main">4.9</Typography>
          <Typography variant="caption" color="text.secondary">Rating</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography fontWeight={700} color="primary.main">7</Typography>
          <Typography variant="caption" color="text.secondary">Referred</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 1.5 }} />

      <Stack spacing={0.75} alignItems="flex-start" sx={{ pl: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
          <Typography variant="caption">Phone verified</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography variant="caption">Meena R.</Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

/* RideTypesCard — vertical list on md+, horizontal scroll-chips on mobile/tablet
   to save vertical space above the fold. */
export const RideTypesCard = ({ active, onSelect }) => {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("md"));

  if (isCompact) {
    return (
      <Box>
        <Typography variant="overline" color="text.secondary" sx={{ pl: 0.5, letterSpacing: 1 }}>
          Ride types
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          className="no-scrollbar"
          sx={{ overflowX: "auto", pb: 0.5, mt: 0.5 }}
        >
          {RIDE_TYPES.map((r) => (
            <Chip
              key={r.key}
              icon={r.icon}
              label={r.count != null ? `${r.label} (${r.count})` : r.label}
              clickable
              onClick={() => onSelect(r.key === active ? null : r.key)}
              color={active === r.key ? "primary" : "default"}
              variant={active === r.key ? "filled" : "outlined"}
              sx={{ fontWeight: 600, flexShrink: 0 }}
            />
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="overline" color="text.secondary" sx={{ pl: 1, letterSpacing: 1 }}>
        Ride types
      </Typography>
      <List dense disablePadding>
        {RIDE_TYPES.map((r) => (
          <ListItemButton
            key={r.key}
            selected={active === r.key}
            onClick={() => onSelect(r.key === active ? null : r.key)}
            sx={{
              borderRadius: 1.5,
              mb: 0.25,
              "&.Mui-selected": { bgcolor: "#FBEAE0", color: "primary.main" },
              "&.Mui-selected .MuiListItemIcon-root": { color: "primary.main" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: active === r.key ? "primary.main" : "text.secondary" }}>
              {r.icon}
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{ fontSize: 14, fontWeight: active === r.key ? 700 : 500 }}
              primary={r.label}
            />
            {r.count != null && (
              <Chip size="small" label={r.count} sx={{ height: 20, fontSize: 11 }} />
            )}
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

/* CitiesCard — same compact/full split as RideTypesCard. */
export const CitiesCard = ({ activeCity, onSelect }) => {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("md"));

  if (isCompact) {
    return (
      <Box>
        <Typography variant="overline" color="text.secondary" sx={{ pl: 0.5, letterSpacing: 1 }}>
          Cities
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          className="no-scrollbar"
          sx={{ overflowX: "auto", pb: 0.5, mt: 0.5 }}
        >
          {CITIES.map((c) => (
            <Chip
              key={c}
              icon={<PlaceIcon sx={{ fontSize: 16 }} />}
              label={c}
              clickable
              onClick={() => onSelect(c === activeCity ? null : c)}
              color={activeCity === c ? "primary" : "default"}
              variant={activeCity === c ? "filled" : "outlined"}
              sx={{ fontWeight: 600, flexShrink: 0 }}
            />
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="overline" color="text.secondary" sx={{ pl: 1, letterSpacing: 1 }}>
        Cities
      </Typography>
      <List dense disablePadding>
        {CITIES.map((c) => (
          <ListItemButton
            key={c}
            selected={activeCity === c}
            onClick={() => onSelect(c === activeCity ? null : c)}
            sx={{
              borderRadius: 1.5,
              mb: 0.25,
              "&.Mui-selected": { bgcolor: "#FBEAE0" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 28, color: "primary.main" }}>
              <PlaceIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 14, color: "primary.main", fontWeight: 600 }} primary={c} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export const RideCard = ({ ride }) => {
  const offering = ride.status === "Offering";
  return (
    <Card variant="outlined" className="hover-lift" sx={{ mb: 2 }}>
      <CardContent sx={{ p: { xs: 1.75, sm: 2 }, pb: { xs: "14px !important", sm: "16px !important" } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          flexWrap="wrap"
          rowGap={1}
          mb={1}
        >
          <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ minWidth: 0 }}>
            <Avatar sx={{ bgcolor: "secondary.main", width: { xs: 34, sm: 38 }, height: { xs: 34, sm: 38 }, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
              {ride.initials}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={700} noWrap>{ride.name}</Typography>
              <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                <StarIcon sx={{ fontSize: 14, color: "#F2A93B" }} />
                <Typography variant="caption" color="text.secondary">
                  {ride.rating.toFixed(1)} · {ride.rideCount} rides · {ride.homeCity}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center" mt={0.25} flexWrap="wrap">
                <PersonIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  Referred by {ride.referredBy} · {ride.referralNote}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Stack alignItems="flex-end" spacing={0.5} sx={{ flexShrink: 0 }}>
            <Typography
              variant="caption"
              fontWeight={700}
              color={offering ? "success.main" : "primary.main"}
            >
              {ride.status}
            </Typography>
            <Chip
              size="small"
              icon={
                ride.tag === "airport" ? <FlightTakeoffIcon sx={{ fontSize: 14 }} /> :
                  ride.tag === "intercity" ? <DirectionsBusIcon sx={{ fontSize: 14 }} /> :
                    ride.tag === "temple" ? <AccountBalanceIcon sx={{ fontSize: 14 }} /> :
                      ride.tag === "kid" ? <ChildFriendlyIcon sx={{ fontSize: 14 }} /> :
                        <LocationOnIcon sx={{ fontSize: 14 }} />
              }
              label={ride.tagLabel}
              sx={{ bgcolor: "#EFF7F1", color: "secondary.main", fontWeight: 600 }}
            />
          </Stack>
        </Stack>

        <Stack spacing={0.25} sx={{ pl: { xs: 0, sm: 6.25 }, mb: 1 }}>
          <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-word" }}>{ride.from}</Typography>
          <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-word" }}>{ride.to}</Typography>
          <Typography variant="caption" color="text.secondary">{ride.distance}</Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ pl: { xs: 0, sm: 6.25 }, mb: 1.5, fontSize: { xs: "0.83rem", sm: "0.875rem" } }}>
          {ride.note}
        </Typography>

        <Divider sx={{ mb: 1.5 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" rowGap={1.25}>
          <Stack direction="row" spacing={2} flexWrap="wrap" rowGap={1}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <EventSeatIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">{ride.date}</Typography>
            </Stack>
            {ride.seats && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <GroupsIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">{ride.seats}</Typography>
              </Stack>
            )}
            {ride.familySize && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <GroupsIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">{ride.familySize}</Typography>
              </Stack>
            )}
            {ride.luggage && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <LuggageIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">{ride.luggage}</Typography>
              </Stack>
            )}
            {ride.costShare && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <LocalAtmIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">{ride.costShare}</Typography>
              </Stack>
            )}
          </Stack>

          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            justifyContent={{ xs: "space-between", sm: "flex-end" }}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {ride.free ? (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "secondary.main" }}>
                <VolunteerActivismIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2" fontWeight={700}>Free · Seva</Typography>
              </Stack>
            ) : ride.price ? (
              <Typography fontWeight={800} color="primary.main">
                {ride.price}
                <Typography component="span" variant="caption" color="text.secondary"> {ride.priceUnit}</Typography>
              </Typography>
            ) : <Box />}

            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <Button
                variant="outlined"
                size="small"
                sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
              >
                Message
              </Button>

              <Button
                size="small"
                sx={{ textTransform: "none", fontWeight: 600, color: "text.secondary" }}
              >
                {offering ? "Request ride" : "Offer ride"}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

/* --------------------------------- MAIN PAGE -------------------------------- */

export default function UserLayout() {
  const [tab, setTab] = useState(NAV_ITEMS.path); // 0=Find a Ride, 1=Offer a Ride, 2=Community, 3=My Rides

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
        <TopNav tab={tab} onTabChange={setTab} />

        {/* {tab === 0 && <FindARide />}
        {tab === 1 && <OfferARide />}
        {tab === 2 && <Community />}
        {tab === 3 && <MyRides />} */}

        <Outlet />

      </Box>
    </ThemeProvider>
  );
}