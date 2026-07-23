import { Box } from '@mui/material'
import React from 'react'

const PageLayout = ({ children }) => {
    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: { xs: '100%', sm: '100%' },
                // mx: 'auto',
                // px: { xs: 0, sm: 2 },
                // py: { xs: 0, sm: 2 },
                pb: { xs: 2, sm: 4 },
                boxSizing: 'border-box',
                // border:'1px solid black'
            }}
        >
            {children}
        </Box>
    )
}

export default PageLayout