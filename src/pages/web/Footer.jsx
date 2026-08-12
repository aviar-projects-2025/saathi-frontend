import React from 'react';
import { Box, Stack, Typography, Divider } from '@mui/material';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { colors } from './theme';

export default function Footers() {
    return (
        <Box
            sx={{
                py: 5,
                bgcolor: '#fff',
                width: '100%',
            }}
        >
            <Stack
                direction="row"
                spacing={{ xs: 1, sm: 2 }}
                sx={{
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Divider
                    sx={{
                        width: { xs: 30, sm: 50, md: 80 },
                        borderColor: colors.border,
                    }}
                />

                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <FavoriteBorderRoundedIcon
                        sx={{
                            color: colors.orange,
                            fontSize: { xs: 16, sm: 18 },
                            flexShrink: 0,
                        }}
                    />

                    <Typography
                        sx={{
                            fontSize: { xs: 12, sm: 14 },
                            fontWeight: 600,
                            color: colors.navy,
                            textAlign: 'center',
                            lineHeight: 1.5,
                        }}
                    >
                        Referred. Approved. Connected. That&apos;s the Saathi way.
                    </Typography>
                </Stack>

                <Divider
                    sx={{
                        width: { xs: 30, sm: 50, md: 80 },
                        borderColor: colors.border,
                    }}
                />
            </Stack>
        </Box>
    );
}