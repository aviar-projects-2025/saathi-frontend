import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Stack,
} from "@mui/material";

import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import FlightRoundedIcon from "@mui/icons-material/FlightRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";

import { colors } from "./theme";

// ---------------------------------------------------------------------------
// Static content
// ---------------------------------------------------------------------------

const HERO_IMAGE = {
  src: "https://media.istockphoto.com/id/1483218108/photo/happy-smiling-family-with-sibling-kids-standing-in-front-of-car-for-picnic-by-looking-camera.webp?a=1&b=1&s=612x612&w=0&k=20&c=900CglVOb91WAlexrkG1rKnVlHXLnVU7v4HJYz_OqdM=",
  alt: "An Indian family together outdoors, smiling",
};

const COPY = {
  heading: "For you. For your loved ones.",
  body: "Saathi helps you share rides with trusted community members and find reliable travel companions for your parents and family between the USA and India.",
};

const LOCATIONS = [
  {
    id: "india",
    label: "Delhi, IN",
    pinColor: "#2C5FAE",
    position: {
      top: { xs: -8, sm: -10, md: -14 },
      left: { xs: -6, sm: -16, md: -20 },
    },
  },
  {
    id: "usa",
    label: "Dallas, USA",
    pinColor: colors.orange,
    position: {
      bottom: { xs: -8, sm: -10, md: -14 },
      right: { xs: -10, sm: -26, md: -32 },
    },
  },
];

// ---------------------------------------------------------------------------
// Responsive tokens
// ---------------------------------------------------------------------------

const GLOBE_SIZE = {
  xs: 84,
  sm: 100,
  md: 150,
};

const PIN_ICON_SIZE = {
  xs: 24,
  sm: 30,
  md: 32,
};

const PIN_LABEL_SIZE = {
  xs: 8.5,
  sm: 10,
  md: 11.5,
};

// ---------------------------------------------------------------------------
// Hero Image
// ---------------------------------------------------------------------------

function HeroImage({ src, alt }) {
  return (
    <Box
      sx={{
        width: {
          xs: "100%",
          sm: "42%",
          md: "40%",
        },
        flexShrink: 0,
      }}
    >
      <Box
        component="img"
        src={src}
        alt={alt}
        sx={{
          display: "block",
          width: "100%",
          height: {
            xs: 200,
            sm: 260,
            md: "100%",
          },
          minHeight: {
            md: 260,
          },
          objectFit: "cover",
        }}
      />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Hero Copy
// ---------------------------------------------------------------------------

function HeroCopy({ heading, body }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,

        px: {
          xs: 3,
          sm: 4,
          md: 4.5,
        },

        py: {
          xs: 3,
          sm: 3.5,
          md: 3,
        },

        display: "flex",
        flexDirection: "column",
        // justifyContent: "center",

        textAlign: {
          xs: "center",
          sm: "left",
        },
      }}
    >
      <Typography
        component="h2"
        sx={{
          color: colors.navy,
          fontWeight: 700,
          lineHeight: 1.3,

          fontSize: {
            xs: "1.2rem",
            sm: "1.35rem",
            md: "1.5rem",
            lg: "1.65rem",
          },
        }}
      >
        {heading}
      </Typography>

      <Typography
        sx={{
          mt: {
            xs: 1.5,
            sm: 1.5,
            md: 1.25,
          },

          color: colors.textSecondary,

          fontSize: {
            xs: "0.8rem",
            sm: "0.9rem",
            md: "1rem",
            lg: "1.05rem",
          },

          lineHeight: 1.65,

          maxWidth: {
            xs: "100%",
            sm: 500,
            md: 560,
          },

          mx: {
            xs: "auto",
            sm: 0,
          },
        }}
      >
        {body}
      </Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Image + Text
// ---------------------------------------------------------------------------

function ImageTextPanel({ image, copy }) {
  return (
    <Stack
      direction={{
        xs: "column",
        sm: "row",
      }}
      sx={{
        width: "100%",
        height: "100%",
      }}
    >
      <HeroImage
        src={image.src}
        alt={image.alt}
      />

      <HeroCopy
        heading={copy.heading}
        body={copy.body}
      />
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Location Pin
// ---------------------------------------------------------------------------

function LocationPin({
  label,
  pinColor,
  position,
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        ...position,

        display: "flex",
        flexDirection: "column",
        alignItems: "center",

        zIndex: 2,
      }}
    >
      <LocationOnRoundedIcon
        sx={{
          fontSize: PIN_ICON_SIZE,
          color: pinColor,
        }}
      />

      <Typography
        sx={{
          mt: 0.5,

          fontSize: PIN_LABEL_SIZE,
          fontWeight: 700,
          lineHeight: 1,

          color: colors.navy,

          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Globe
// ---------------------------------------------------------------------------

function GlobeWithPins({ locations }) {
  return (
    <Box
      sx={{
        position: "relative",

        width: GLOBE_SIZE,
        height: GLOBE_SIZE,

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        flexShrink: 0,
      }}
    >
      <PublicRoundedIcon
        sx={{
          fontSize: GLOBE_SIZE,
          color: "#8FB6DD",
        }}
      />

      {locations.map(({ id, ...location }) => (
        <LocationPin
          key={id}
          {...location}
        />
      ))}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Flight Route
// ---------------------------------------------------------------------------

function FlightRouteGraphic({ locations }) {
  return (
    <Stack
      direction="row"
      sx={{
        width: "100%",

        minHeight: {
          xs: 150,
          sm: 180,
          md: 260,
        },

        px: {
          xs: 3,
          sm: 4,
          md: 4,
        },

        py: {
          xs: 3,
          sm: 3.5,
          md: 4,
        },

        gap: {
          xs: 1.5,
          sm: 2.5,
          md: 3,
        },

        alignItems: "center",
        justifyContent: "center",

        overflow: "visible",
      }}
    >
      <FlightRoundedIcon
        sx={{
          flexShrink: 0,

          fontSize: {
            xs: 28,
            sm: 36,
            md: 40,
          },

          color: colors.navy,

          transform: "rotate(45deg)",
        }}
      />

      <GlobeWithPins
        locations={locations}
      />
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function Family() {
  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        bgcolor: "#fff",

        py: {
          xs: 4,
          sm: 5,
          md: 7,
          lg: 8,
        },
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          px: {
            xs: 2,
            sm: 3,
            md: 4,
          },
        }}
      >
        <Box
          sx={{
            width: "100%",

            bgcolor: colors.skyLight,

            borderRadius: {
              xs: 3,
              sm: 3,
              md: 4,
            },

            overflow: "hidden",
          }}
        >
          <Grid
            container
            alignItems="stretch"
          >
            {/* -----------------------------------------------------------
                Left section
            ----------------------------------------------------------- */}
            <Grid
              size={{
                xs: 12,
                md: 8,
              }}
            >
              <ImageTextPanel
                image={HERO_IMAGE}
                copy={COPY}
              />
            </Grid>

            {/* -----------------------------------------------------------
                Right section
            ----------------------------------------------------------- */}
            <Grid
              size={{
                xs: 11,
                md: 4,
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign:'center',
                minWidth: 0,
                overflow: "hidden",
              }}
            >
              <FlightRouteGraphic
                locations={LOCATIONS}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}