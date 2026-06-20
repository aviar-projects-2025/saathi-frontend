import { Box } from '@mui/material'
import React from 'react'

const PageLayout = ({ children }) => {
    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: { xs: '100%', sm: 620 },
                // mx: 'auto',
                px: { xs: 2, sm: 3 },
                py: { xs: 2, sm: 3 },
                boxSizing: 'border-box',
            }}
        >
            {children}
        </Box>
    )
}

export default PageLayout