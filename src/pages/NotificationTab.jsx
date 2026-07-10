import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import moment from 'moment';
import { useNotifications } from '../context/NotificationContext';
import { data, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Api from '../Api';
import { toast } from 'react-toastify';

export default function NotificationTab({ handleCloseNotifications }) {
    const { tabNotification, fetchNotifications } = useNotifications();

    const uniqueNotifications = Object.values(
        (tabNotification || []).reduce((acc, curr) => {
            acc[curr.data.rideId || data.rideId] = curr; // handle both cases
            return acc;
        }, {})
    );

    console.log(tabNotification,'tabNotification')

    const navigate = useNavigate();

    const handleNavigation = (item) => {
        switch (item.type) {
            case "new_request":
            case "request_accepted":
            case "request_rejected":
                navigate("/myride", { state: { tab: 2, rideId: item.data?.rideId }, });
                break;

            case "referral_pending":
            case "referral_approved":
            case "referral_rejected":
                navigate("/my-referalls");
                break;
            case "ride_started": 
                console.log(item.type,'item.type')
                navigate("/myride")
                break;

            default:
                navigate("/");
        }
    }

    const handleIsRead = (id, item) => {
        if (item?.isRead) return;
        console.log(id)
        try {
            axios.patch(Api + `/notification/${id}`)
                .then((res) => {
                    console.log(res, 'res')
                    fetchNotifications();
                })
        } catch (error) {
            console.log(error.message)
        }
    }

    return (
        // Outer wrapper controls the visible box: fixed max height + hidden overflow
        // so the list itself scrolls inside this frame rather than pushing content
        // off the top or getting clipped.
        <Box
            sx={{
                width: '100%',
                maxWidth: 360,
                maxHeight: 450,
                bgcolor: 'background.paper',
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',

            }}
        >
            <List
                sx={{
                    width: '100%',
                    maxHeight: 420,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    bgcolor: 'background.paper',
                    py: 0,
                    // nice thin scrollbar instead of the default chunky one
                    '&::-webkit-scrollbar': {
                        width: 6,
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#c1c1c1',
                        borderRadius: 3,
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: 'transparent',
                    },
                }}
            >
                {uniqueNotifications?.length === 0 ? (
                    <Typography sx={{ p: 2, textAlign: 'center' }}>No notifications</Typography>
                ) : (
                    uniqueNotifications.map((item) => {
                        const isUnread = !item.isRead;

                        return (
                            <React.Fragment key={item._id}>
                                <ListItem
                                    onClick={() => {
                                        handleNavigation(item);
                                        handleIsRead(item._id, item);
                                        handleCloseNotifications();
                                    }}
                                    alignItems="flex-start"
                                    sx={{
                                        borderRadius: 3,
                                        marginBottom: 1,
                                        bgcolor: isUnread ? '#e3f2fd' : 'transparent',
                                        transition: '0.2s',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: isUnread ? '#bbdefb' : '#f5f5f5',
                                        },
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar src={item?.actorId?.profileImage}>
                                            {item?.actorId?.firstName?.[0] || "U"}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            width: '100%',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                        }}
                                    >
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="space-between"
                                                gap={1}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontSize: 13,
                                                        fontWeight: isUnread ? 700 : 500,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    {item.title}
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    sx={{ color: 'gray', fontSize: 11, whiteSpace: 'nowrap' }}
                                                >
                                                    {moment(item.createdAt).fromNow()}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ mt: 0.3 }}>
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: isUnread ? 400 : 300,
                                                        fontSize: 11,
                                                    }}
                                                >
                                                    {item?.requestedById?.firstName} {item?.requestedById?.lastName}
                                                </Typography>
                                                <Typography component="span" sx={{ fontSize: 11 }}>
                                                    {" — " + item.message}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {isUnread && (
                                            <Box
                                                sx={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                    bgcolor: '#1976d2',
                                                    ml: 1,
                                                    mt: 1,
                                                    flexShrink: 0,
                                                }}
                                            />
                                        )}
                                    </Box>
                                </ListItem>

                                <Divider variant="inset" component="li" />
                            </React.Fragment>
                        );
                    })
                )}
            </List>
        </Box>
    );
}


{/* <ListItemText
                                    primary={
                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                            <Typography
                                                sx={{
                                                    marginTop:-0.5,
                                                    fontSize:14,
                                                    fontWeight: isUnread ? 700 : 500
                                                }}
                                            >
                                                {item.title}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                sx={{ color: 'gray', fontSize:11, marginTop:-2,}}
                                            >
                                                {moment(item.createdAt).fromNow()}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <>
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                sx={{
                                                    fontWeight: isUnread ? 400 : 300,
                                                    fontSize:11,
                                                }}
                                            >
                                                {item?.requestedById?.firstName} {item?.requestedById?.lastName}
                                            </Typography>
                                            {" — " + item.message}
                                        </>
                                    }
                                /> */}