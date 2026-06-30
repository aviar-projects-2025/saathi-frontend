import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme, useMediaQuery } from "@mui/material";

import {
    Box,
    Paper,
    BottomNavigation,
    BottomNavigationAction,
    // Badge,
} from "@mui/material";

import GroupsIcon from "@mui/icons-material/Groups";
// import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import ExploreIcon from "@mui/icons-material/Explore";
import SettingsIcon from "@mui/icons-material/Settings";
import AddCircleIcon from "@mui/icons-material/AddCircle";

export default function MobileBottomNav({ pendingNotificationCount = 0 }) {
    const theme = useTheme();


    const navigate = useNavigate();
    const location = useLocation();

    const bottomNavItems = [
        {
            label: "Community",
            icon: <GroupsIcon />,
            link: "/community",
        },
        // {
        //     label: "My Rides",
        //     icon: <TwoWheelerIcon />,
        //     link: "/myride",
        // },
        {
            label: "Find Ride",
            icon: <TravelExploreIcon />,
            link: "/find-ride",
        },
        {
            label: "Post Ride",
            icon: <AddCircleIcon />,
            link: "/offer-ride",
        },
        {
            label: "Discover",
            icon: <ExploreIcon />,
            link: "/discover",
        },
        {
            label: "Settings",
            icon: <SettingsIcon />,
            link: "/settings",
        },
    ];

    const currentIndex = Math.max(
        bottomNavItems.findIndex((item) => location.pathname === item.link),
        0
    );

    const [value, setValue] = useState(currentIndex);

    const goTo = (link, index) => {
        setValue(index);
        navigate(link);
    };

    return (
        <>
            <Paper
                elevation={3}
                sx={{
                    display: { xs: "flex", sm: "none" },
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1300,
                }}
            >
                <BottomNavigation
                    value={currentIndex}
                    onChange={(_, newValue) => {
                        setValue(newValue);
                        goTo(bottomNavItems[newValue].link, newValue);
                    }}
                    showLabels
                    sx={{
                        width: "100%",
                        height: 50,
                        padding: "3px",

                        "& .MuiBottomNavigationAction-root": {
                            minWidth: 0,
                            padding: "8px 4px 10px",
                            gap: "4px",
                        },

                        "& .MuiBottomNavigationAction-label": {
                            fontSize: "10px !important",
                            lineHeight: 1.2,
                            whiteSpace: "nowrap",
                        },

                        "& .MuiSvgIcon-root": {
                            fontSize: 20,
                        },

                        "& .Mui-selected": {
                            color: "#FF9933",
                        },

                        "& .Mui-selected .MuiBottomNavigationAction-label": {
                            fontSize: "10px !important",
                            fontWeight: 600,
                        },
                    }}
                >
                    {bottomNavItems.map((item) => (
                        <BottomNavigationAction
                            key={item.link}
                            label={item.label}
                            icon={item.icon}
                        />
                    ))}
                </BottomNavigation>
            </Paper>

        </>
    );
}