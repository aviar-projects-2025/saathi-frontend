import { Box } from '@mui/material'
import React from 'react'

const PageLayout = ({ children }) => {
    return (
        <Box sx={{ maxWidth: 620, marginLeft : 3}}>
            { children }
        </Box>
    )
}

export default PageLayout