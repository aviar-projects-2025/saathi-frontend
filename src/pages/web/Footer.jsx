import React from 'react';
import { Box, Stack, Typography, Divider } from '@mui/material';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { colors } from './theme';

export default function Footers() {
    return (
    <Box
        sx={{
            width: '100%',
            bgcolor: '#fff',
            py: { xs: 3, sm: 4, md: 5 },
            px: { xs: 2, sm: 3, md: 4 },
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1.5, sm: 2, md: 3 },
        }}
    >
        <Divider sx={{ flex: 1, borderColor: '#E5E7EB' }} />

        <Typography
            sx={{
                fontSize: { xs: 11, sm: 13, md: 14 },
                fontWeight: 600,
                color: colors.navy,
                textAlign: 'center',
                lineHeight: 1.5,
                whiteSpace: 'nowrap',
            }}
        >
            Referred. Approved. Connected. That &apos;s the Saathi way.
        </Typography>

        <Divider sx={{ flex: 1, borderColor: '#E5E7EB' }} />
    </Box>
    );
}