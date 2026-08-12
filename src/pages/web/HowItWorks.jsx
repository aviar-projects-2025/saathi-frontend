import React, { useRef, useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Stack, Avatar, LinearProgress, Button, Chip, IconButton } from '@mui/material';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
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

// Card width (+gap) drives the scroll-snap math. Keep these two in sync with the sx values below.
const CARD_WIDTH = 208;
const CARD_GAP = 16;
const CARD_STEP = CARD_WIDTH + CARD_GAP; // distance to slide to move exactly one card

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
                p: 2,
                height: '100%',
                minHeight: 240,
                width: CARD_WIDTH,
                flex: `0 0 ${CARD_WIDTH}px`,
                scrollSnapAlign: 'start',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Avatar
                sx={{
                    position: 'absolute',
                    top: -12,
                    left: -12,
                    width: 24,
                    height: 24,
                    bgcolor: colors.navy,
                    fontSize: 11,
                    fontWeight: 700,
                }}
            >
                {idx + 1}
            </Avatar>

            <Box sx={{ position: 'relative', width: 38, height: 38 }}>
                <Icon sx={{ fontSize: 28, color: idx % 2 === 0 ? colors.orange : colors.navy }} />
                {step.badge && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -4,
                            right: 2,
                            bgcolor: '#E24444',
                            color: '#fff',
                            fontSize: 9,
                            fontWeight: 700,
                            width: 14,
                            height: 14,
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

            <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: colors.navy, mt: 1.2 }}>
                {step.title}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: colors.textSecondary, mt: 0.6, flexGrow: 1, lineHeight: 1.45 }}>
                {step.body}
            </Typography>

            <StepFooter step={step} />
        </Box>
    );
}

const AUTOPLAY_INTERVAL = 3000; // slide to the next step every 3s
const RESUME_AFTER_INTERACTION = 6000; // give a manual swipe/click some breathing room before autoplay kicks back in
const REAL_COUNT = steps.length;
const SNAP_MS = 450; // roughly how long the smooth scroll takes to land, used to time the invisible loop-reset

// Clone the last card onto the front and the first card onto the end. This lets the strip keep
// scrolling forward (or backward) past the "real" ends, so we can silently jump back to the
// matching real card once the clone is in view — the loop feels like it's rotating instead of
// snapping backwards.
const extendedSteps = [
    { ...steps[REAL_COUNT - 1], _idx: REAL_COUNT - 1, _key: 'clone-last' },
    ...steps.map((step, i) => ({ ...step, _idx: i, _key: `real-${i}` })),
    { ...steps[0], _idx: 0, _key: 'clone-first' },
];

export default function HowItWorks() {
    const scrollRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);
    const [index, setIndex] = useState(1); // 1 = first real card (index 0 is the leading clone)
    const resumeTimeoutRef = useRef(null);
    const instantRef = useRef(true); // true = jump with no animation (used for the invisible loop reset)

    // Keep the scroll position in sync with `index`. Most moves animate smoothly; the two loop
    // "reset" jumps (clone -> matching real card) happen instantly so they're invisible to the user.
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return undefined;

        el.scrollTo({ left: index * CARD_STEP, behavior: instantRef.current ? 'auto' : 'smooth' });
        instantRef.current = false;

        let resetTimer;
        if (index === REAL_COUNT + 1) {
            // Landed on the cloned first card at the very end — rotate back to the real first card.
            resetTimer = setTimeout(() => {
                instantRef.current = true;
                setIndex(1);
            }, SNAP_MS);
        } else if (index === 0) {
            // Landed on the cloned last card at the very start — rotate back to the real last card.
            resetTimer = setTimeout(() => {
                instantRef.current = true;
                setIndex(REAL_COUNT);
            }, SNAP_MS);
        }
        return () => clearTimeout(resetTimer);
    }, [index]);

    // Auto-advance every 3s, one step at a time. Pauses on hover/touch (desktop + mobile)
    // and briefly after any manual nudge.
    useEffect(() => {
        if (isPaused) return undefined;
        const id = setInterval(() => setIndex((i) => i + 1), AUTOPLAY_INTERVAL);
        return () => clearInterval(id);
    }, [isPaused]);

    const pauseThenResume = () => {
        setIsPaused(true);
        if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = setTimeout(() => setIsPaused(false), RESUME_AFTER_INTERACTION);
    };

    useEffect(() => () => {
        if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    }, []);

    const handleArrowClick = (direction) => {
        pauseThenResume();
        setIndex((i) => i + direction);
    };

    return (
        <Box sx={{ bgcolor: '#F7FAFD', py: { xs: 6, md: 8 } }}>
            <Container maxWidth="lg">
                <Stack
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        mb: 4,
                    }}
                    spacing={1}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        spacing={2}
                    >
                        {/* <Box sx={{ width: 40, height: 2, bgcolor: colors.orange }} /> */}

                        <Typography
                            variant="h3"
                            sx={{
                                fontSize: { xs: 26, md: 32 },
                                color: colors.navy,
                            }}
                        >
                            How Saathi Works
                        </Typography>

                        {/* <Box sx={{ width: 40, height: 2, bgcolor: colors.orange }} /> */}
                    </Stack>

                    <Typography sx={{ color: colors.textSecondary }}>
                        Simple steps. Built on trust.
                    </Typography>
                </Stack>

                <Box sx={{ position: 'relative' }}>
                    {/* Left arrow — hidden on touch/mobile since swipe handles it there */}
                    <IconButton
                        onClick={() => handleArrowClick(-1)}
                        sx={{
                            display: { xs: 'none', sm: 'flex' },
                            position: 'absolute',
                            left: -18,
                            top: '40%',
                            transform: 'translateY(-50%)',
                            zIndex: 2,
                            bgcolor: '#fff',
                            boxShadow: '0 2px 10px rgba(16,38,73,0.15)',
                            width: 36,
                            height: 36,
                            '&:hover': { bgcolor: '#fff' },
                        }}
                    >
                        <ArrowBackIosNewRoundedIcon sx={{ fontSize: 14, color: colors.navy, ml: 0.4 }} />
                    </IconButton>

                    <Box
                        ref={scrollRef}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        onTouchStart={pauseThenResume}
                        sx={{
                            display: 'flex',
                            gap: `${CARD_GAP}px`,
                            overflowX: 'auto',
                            scrollSnapType: 'x mandatory',
                            scrollBehavior: 'smooth',
                            pb: 2,
                            pt: 1.5,
                            px: 0.5,
                            // Hide scrollbar across browsers, mobile still swipes natively
                            '&::-webkit-scrollbar': { display: 'none' },
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none',
                        }}
                    >
                        {steps.map((step, idx) => (
                            <StepCard key={step.title} step={step} idx={idx} />
                        ))}
                    </Box>

                    {/* Right arrow */}
                    <IconButton
                        onClick={() => handleArrowClick(1)}
                        sx={{
                            display: { xs: 'none', sm: 'flex' },
                            position: 'absolute',
                            right: -18,
                            top: '40%',
                            transform: 'translateY(-50%)',
                            zIndex: 2,
                            bgcolor: '#fff',
                            boxShadow: '0 2px 10px rgba(16,38,73,0.15)',
                            width: 36,
                            height: 36,
                            '&:hover': { bgcolor: '#fff' },
                        }}
                    >
                        <ArrowForwardIosRoundedIcon sx={{ fontSize: 14, color: colors.navy }} />
                    </IconButton>
                </Box>

                {/* Mobile hint */}
                <Typography
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        textAlign: 'center',
                        fontSize: 11,
                        color: colors.textSecondary,
                        mt: 0.5,
                    }}
                >
                    Swipe to see all steps →
                </Typography>
            </Container>
        </Box>
    );
}