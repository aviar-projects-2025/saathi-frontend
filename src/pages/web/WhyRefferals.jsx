import React from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    Stack,
} from '@mui/material';

import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';

import { colors } from './theme';

// --- Static data -----------------------------------------------------------

const PILLARS = [
    { icon: GroupRoundedIcon, label: 'Stronger\nConnections' },
    { icon: ShieldRoundedIcon, label: 'More\nAccountability' },
    { icon: LockRoundedIcon, label: 'Safer\nJourneys' },
    { icon: FavoriteBorderRoundedIcon, label: 'Peace of Mind\nfor Families' },
];

const SECTION_COPY = {
    title: 'Why Referral Only?',
    body: `Every Saathi member starts with a connection to someone already
        in the community. Combined with real profiles, referrer approval,
        and complete information, this creates greater accountability and
        helps us build a more trusted community.`,
};

// --- Style helpers -----------------------------------------------------------

const dividerColor = 'rgba(255,255,255,0.2)';

/**
 * Returns the responsive border rules for a pillar cell so the 2x2 (mobile)
 * / 1x4 (desktop) grid gets dividers only where needed.
 */
function getPillarBorders(index, total) {
    const isLastColumnMobile = index % 2 === 1;
    const isLastColumnDesktop = index === total - 1;
    const isLastRowMobile = index >= total - 2;

    return {
        borderRight: {
            xs: isLastColumnMobile ? 'none' : `1px solid ${dividerColor}`,
            sm: isLastColumnDesktop ? 'none' : `1px solid ${dividerColor}`,
        },
        borderBottom: {
            xs: isLastRowMobile ? 'none' : `1px solid ${dividerColor}`,
            sm: 'none',
        },
    };
}

// --- Subcomponents -----------------------------------------------------------

function PillarItem({ icon: Icon, label, index, total }) {
    return (
        <Box
            sx={{
                minWidth: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                px: { xs: 1, sm: 1.2, md: 1.5 },
                py: { xs: 1.5, sm: 1 },
                ...getPillarBorders(index, total),
            }}
        >
            <Stack
                spacing={{ xs: 1.2, sm: 1.5 }}

                sx={{
                    width: '100%', display: "flex", alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <Icon
                    sx={{
                        fontSize: { xs: 23, sm: 25, md: 28 },
                        flexShrink: 0,
                    }}
                />
                <Typography
                    sx={{
                        fontSize: { xs: 11, sm: 12, md: 13 },
                        fontWeight: 600,
                        lineHeight: 1.3,
                        letterSpacing: '0.1px',
                        whiteSpace: { xs: 'normal', md: 'pre-line' },
                        textAlign: 'center',
                        color: 'inherit',
                        width: '100%',
                    }}
                >
                    {label}
                </Typography>
            </Stack>
        </Box>
    );
}

function SectionIntro() {
    return (
        <>
            <Typography
                sx={{
                    fontSize: { xs: 21, sm: 23, md: 26 },
                    fontWeight: 700,
                    lineHeight: 1.2,
                    mb: { xs: 1.2, md: 1.5 },
                    textAlign: 'center',
                }}
            >
                {SECTION_COPY.title}
            </Typography>

            <Typography
                sx={{
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: { xs: 12.5, sm: 14, md: 16 },
                    lineHeight: 1.7,
                    mx: { xs: 'auto', md: 0 },
                    textAlign: 'center',
                }}
            >
                {SECTION_COPY.body}
            </Typography>
        </>
    );
}

function PillarGrid() {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(4, 1fr)',
                },
                width: '100%',
            }}
        >
            {PILLARS.map((pillar, index) => (
                <PillarItem
                    key={pillar.label}
                    icon={pillar.icon}
                    label={pillar.label}
                    index={index}
                    total={PILLARS.length}
                />
            ))}
        </Box>
    );
}

// --- Main component -----------------------------------------------------------

export default function WhyReferrals() {
    return (
        <Box sx={{ bgcolor: '#F7FAFD', py: { xs: 3, sm: 4, md: 5 } }}>
            <Container maxWidth="lg">
                <Box
                    sx={{
                        bgcolor: colors.navy || '#0B1F44',
                        color: '#fff',
                        borderRadius: { xs: 2.5, sm: 3 },
                        px: { xs: 2.5, sm: 3.5, md: 5 },
                        py: { xs: 3, sm: 4, md: 4 },
                    }}
                >
                    <Grid spacing={{ xs: 3.5, md: 3 }} sx={{ display: 'grid', gap: 4 }}>
                        <Grid item xs={12} md={5} sx={{ textAlign: 'center' }}>
                            <SectionIntro />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <PillarGrid />
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
}