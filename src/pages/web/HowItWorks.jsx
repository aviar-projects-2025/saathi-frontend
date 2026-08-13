import React, { useRef, useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Stack, Avatar, LinearProgress, Button, Chip } from '@mui/material';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import Person2RoundedIcon from '@mui/icons-material/Person2Rounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import { colors } from './theme';
import { useTheme, useMediaQuery } from '@mui/material';

const steps = [
    {
        icon: PersonAddAlt1RoundedIcon,
        title: 'Get Referred',
        body: 'You need a referral code from an existing Saathi member.',
        footer: 'note',
        footerText: 'No referral code = No registration.',
    },
    {
        icon: Person2RoundedIcon,
        title: 'Create Your Profile',
        body: 'Register using your referral code and create your profile with real info and a clear photo.',
        footer: 'avatar',
    },
    {
        icon: VerifiedUserRoundedIcon,
        title: 'Get Approved by Your Referrer',
        body: 'Your referrer reviews your details and approves your membership.',
        footer: 'chip',
        footerText: 'Approved',
    },
    {
        icon: FactCheckRoundedIcon,
        title: 'Complete 100% of Your Profile',
        body: 'Complete all required details to 100% to unlock the ability to post or request a ride.',
        footer: 'progress',
    },
    {
        icon: SpeedRoundedIcon,
        title: 'Post or Find a Ride',
        body: 'Post your trip with all details or browse rides posted by other members.',
        footer: 'routes',
    },
    {
        icon: GroupRoundedIcon,
        title: 'Receive a Ride Request',
        body: 'Your ride is visible to members. Interested members send you a request to join.',
        footer: 'badge',
        badge: 3,
    },
    {
        icon: HowToRegRoundedIcon,
        title: 'Review & Approve',
        body: "Review the member's profile and trip details. Approve the request if you're comfortable.",
        footer: 'button',
        footerText: 'Approve',
    },
    {
        icon: ChatBubbleOutlineRoundedIcon,
        title: 'Connect Through Saathi',
        body: 'Once approved, coordinate directly in-app. Discuss pickups, timing, luggage & more.',
    },
    {
        icon: DirectionsCarFilledRoundedIcon,
        title: 'Travel Together',
        body: 'Meet your travel companion and enjoy a safe, comfortable journey together.',
    },
];

const CARD_WIDTH = 235;
const CARD_GAP = 25;

// Marquee speed in pixels/second — lower = slower, higher = faster. This is the single knob to tune.
const MARQUEE_SPEED = 35;
// Fallback duration (seconds) used before the track's real width has been measured on mount.
const FALLBACK_DURATION = 50;
// How long a manual touch-hold pause lasts before the marquee resumes on mobile.
const RESUME_AFTER_TOUCH = 2000;

function StepFooter({ step }) {
    switch (step.footer) {
        case 'note':
            return (
                <Box sx={{ mt: 1.2, bgcolor: '#FDECE1', color: colors.orange, fontSize: 10.5, fontWeight: 600, borderRadius: 1.5, px: 1, py: 0.6, lineHeight: 1.3 }}>
                    {step.footerText}
                </Box>
            );
        case 'avatar':
            return (
                <Avatar sx={{ width: 36, height: 36, mt: 1.2, bgcolor: '#F6B78E' }}>
                    <Person2RoundedIcon sx={{ fontSize: 18 }} />
                </Avatar>
            );
        case 'chip':
            return (
                <Chip
                    size="small"
                    icon={<VerifiedUserRoundedIcon sx={{ fontSize: 12 }} />}
                    label={step.footerText}
                    sx={{ mt: 1.2, bgcolor: '#E9F7EC', color: '#2E9E4C', fontWeight: 700, fontSize: 10.5, height: 22 }}
                />
            );
        case 'progress':
            return (
                <Box sx={{ mt: 1.4, width: '100%' }}>
                    <LinearProgress
                        variant="determinate"
                        value={100}
                        sx={{
                            height: 6,
                            borderRadius: 5,
                            bgcolor: '#E9EEF3',
                            '& .MuiLinearProgress-bar': { bgcolor: '#2E9E4C', borderRadius: 5 },
                        }}
                    />
                    <Typography sx={{ fontSize: 10, color: colors.textSecondary, mt: 0.4 }}>100%</Typography>
                </Box>
            );
        case 'routes':
            return (
                <Stack spacing={0.5} sx={{ mt: 1.2 }}>
                    {['Dallas → Austin', 'Dallas → Houston', 'USA ↔ India'].map((r) => (
                        <Box
                            key={r}
                            sx={{ bgcolor: '#EAF2FB', color: colors.navy, fontSize: 9.5, fontWeight: 600, borderRadius: 1.2, px: 0.8, py: 0.4 }}
                        >
                            {r}
                        </Box>
                    ))}
                </Stack>
            );
        case 'button':
            return (
                <Button
                    size="small"
                    variant="contained"
                    sx={{ mt: 1.2, bgcolor: '#2E9E4C', fontSize: 11, borderRadius: 2, py: 0.3, '&:hover': { bgcolor: '#268040' } }}
                >
                    Approve
                </Button>
            );
        default:
            return null;
    }
}

function StepCard({ step, idx }) {
    const Icon = step.icon;
    return (
        <Box
            sx={{
                position: 'relative',
                bgcolor: '#fff',
                border: `1px solid ${colors.border}`,
                borderRadius: 3,
                p: 3,
                pt: 4,
                height: '100%',
                minHeight: 350,
                width: CARD_WIDTH,
                flex: `0 0 ${CARD_WIDTH}px`,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Step number badge — centered on the card's top edge */}
            <Avatar
                sx={{
                    position: 'absolute',
                    top: -15,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 28,
                    height: 28,
                    bgcolor: colors.navy,
                    fontSize: 13,
                    fontWeight: 700,
                    border: '2px solid #fff',
                    boxShadow: '0 2px 6px rgba(16,38,73,0.2)',
                }}
            >
                {idx + 1}
            </Avatar>

            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    mt: 0.5,
                }}
            >
                <Icon sx={{ fontSize: 60, color: idx % 2 === 0 ? colors.orange : colors.navy }} />
                {step.badge && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -4,
                            right: 'calc(50% - 26px)',
                            bgcolor: '#E24444',
                            color: '#fff',
                            fontSize: 9,
                            fontWeight: 700,
                            width: 17,
                            height: 16,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {step.badge}
                    </Box>
                )}
            </Box>

            <Typography sx={{ fontWeight: 700, fontSize: 18.5, color: colors.navy, mt: 2, textAlign: 'center' }}>
                {step.title}
            </Typography>
            <Typography sx={{ fontSize: 17.5, color: colors.textSecondary, mt: 2.5, flexGrow: 1, lineHeight: 1.75, textAlign: 'center' }}>
                {step.body}
            </Typography>

            <StepFooter step={step} />
        </Box>
    );
}

function StepCards({ step, idx }) {
    const Icon = step.icon;
    return (
        <Box
            sx={{
                position: 'relative',
                bgcolor: '#fff',
                border: `1px solid ${colors.border}`,
                borderRadius: 3,
                p: 3,
                pt: 4,
                height: '100%',
                minHeight: 350,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Step number badge — centered on the card's top edge */}
            <Avatar
                sx={{
                    position: 'absolute',
                    top: -15,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 28,
                    height: 28,
                    bgcolor: colors.navy,
                    fontSize: 13,
                    fontWeight: 700,
                    border: '2px solid #fff',
                    boxShadow: '0 2px 6px rgba(16,38,73,0.2)',
                }}
            >
                {idx + 1}
            </Avatar>

            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    mt: 0.5,
                }}
            >
                <Icon sx={{ fontSize: 60, color: idx % 2 === 0 ? colors.orange : colors.navy }} />
                {step.badge && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -4,
                            right: 'calc(50% - 26px)',
                            bgcolor: '#E24444',
                            color: '#fff',
                            fontSize: 9,
                            fontWeight: 700,
                            width: 17,
                            height: 16,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {step.badge}
                    </Box>
                )}
            </Box>

            <Typography sx={{ fontWeight: 700, fontSize: 18, color: colors.navy, mt: 2, textAlign: 'center' }}>
                {step.title}
            </Typography>
            <Typography sx={{ fontSize: 16, color: colors.textSecondary, mt: 2.5, flexGrow: 1, lineHeight: 1.75, textAlign: 'center' }}>
                {step.body}
            </Typography>

            <StepFooter step={step} />
        </Box>
    );
}
export default function HowItWorks() {
    const trackRef = useRef(null);
    const [duration, setDuration] = useState(FALLBACK_DURATION);
    const [isPaused, setIsPaused] = useState(false);
    const resumeTimeoutRef = useRef(null);

    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;

        const singleLoopWidth = el.scrollWidth / 2;

        if (singleLoopWidth > 0) {
            setDuration(singleLoopWidth / MARQUEE_SPEED);
        }
    }, []);

    useEffect(() => {
        return () => {
            if (resumeTimeoutRef.current) {
                clearTimeout(resumeTimeoutRef.current);
            }
        };
    }, []);

    const handleTouchStart = () => {
        setIsPaused(true);

        if (resumeTimeoutRef.current) {
            clearTimeout(resumeTimeoutRef.current);
        }

        resumeTimeoutRef.current = setTimeout(() => {
            setIsPaused(false);
        }, RESUME_AFTER_TOUCH);
    };

    return (
        <Box
            sx={{
                bgcolor: '#F7FAFD',
                py: { xs: 6, md: 8 },
            }}
        >
            <style>
                {`
                    @keyframes saathiMarquee {
                        from {
                            transform: translateX(0);
                        }

                        to {
                            transform: translateX(-50%);
                        }
                    }
                `}
            </style>

            <Container maxWidth="xxl">

                {/* Header */}
                <Stack
                    spacing={1}
                    sx={{
                        mb: { xs: 4, md: 7 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center"
                    }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            fontSize: {
                                xs: 26,
                                md: 32,
                            },
                            color: colors.navy,
                        }}
                    >
                        How Saathi Works
                    </Typography>

                    <Typography
                        sx={{
                            color: colors.textSecondary,
                        }}
                    >
                        Simple steps. Built on trust.
                    </Typography>
                </Stack>

                {isDesktop ? (

                    /* ================= DESKTOP ================= */

                    <Box
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        onTouchStart={handleTouchStart}
                        sx={{
                            overflow: 'hidden',
                            position: 'relative',

                            maskImage:
                                'linear-gradient(to right, transparent 0, #000 32px, #000 calc(100% - 32px), transparent 100%)',

                            WebkitMaskImage:
                                'linear-gradient(to right, transparent 0, #000 32px, #000 calc(100% - 32px), transparent 100%)',
                        }}
                    >
                        <Box
                            ref={trackRef}
                            sx={{
                                display: 'flex',
                                gap: `${CARD_GAP}px`,
                                width: 'max-content',
                                py: 1.5,
                                px: 0.5,

                                animation: `saathiMarquee ${duration}s linear infinite`,

                                animationPlayState: isPaused
                                    ? 'paused'
                                    : 'running',

                                willChange: 'transform',
                            }}
                        >
                            {[...steps, ...steps].map((step, i) => (
                                <StepCard
                                    key={`${step.title}-${i}`}
                                    step={step}
                                    idx={i % steps.length}
                                />
                            ))}
                        </Box>
                    </Box>

                ) : (

                    <Box
                        sx={{
                            width: '100%',
                            p: {
                                xs: 1.5,
                                sm: 2,
                            },
                            borderRadius: 3,
                            border: '1px solid #E7ECF2',
                            bgcolor: '#fff',
                            boxSizing: 'border-box',

                            display: 'grid',

                            gridTemplateColumns: {
                                xs: '1fr',                         // Mobile: 1
                                sm: 'repeat(2, minmax(0, 1fr))',  // Tablet: 2
                            },

                            gap: {
                                xs: 2,
                                sm: 2.5,
                                md: 3,
                            },
                        }}
                    >
                        {steps.map((step, idx) => (
                            <Box
                                key={step.title}
                                sx={{
                                    width: '100%',
                                    minWidth: 0,
                                    p: {
                                        xs: 2,
                                        sm: 2.5,
                                    },
                                    borderRadius: 3,
                                    bgcolor: '#fff',
                                    boxSizing: 'border-box',

                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <StepCards
                                    step={step}
                                    idx={idx}
                                />
                            </Box>
                        ))}
                    </Box>
                )}

            </Container>
        </Box>
    );
}