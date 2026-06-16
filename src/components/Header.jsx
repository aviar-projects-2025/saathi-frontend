import { Box, Typography } from '@mui/material'
import React from 'react'

const Header = () => {
    return (
        <>
            <Box
                sx={{
                    bgcolor: "rgba(255, 255, 236, 0)",
                    height: 20,
                    padding : 2,
                    pl : 4,
                }}
            >
                <Typography
                    sx={{
                        fontSize: 30,
                        fontWeight: 800,
                        color: "#d97706",
                        mb: 2,
                    }}
                >
                    Saathi
                </Typography>
            </Box>
        </>
    )
}

export default Header