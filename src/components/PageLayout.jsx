import { Box } from '@mui/material'
import React from 'react'

const PageLayout = ({ children }) => {
    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: { xs: '100%', sm: 620 },
                // mx: 'auto',
                px: { xs: 0, sm: 2 },
                py: { xs: 0, sm: 2 },
                pb: { xs: 2, sm: 3 },
                boxSizing: 'border-box',
            }}
        >
            {children}
        </Box>
    )
}

export default PageLayout