import { Box } from '@mui/material'
import React from 'react'

const PageLayout = ({ children }) => {
    return (
        <Box sx={{ maxWidth: 620, }}>
            { children }
        </Box>
    )
}

export default PageLayout