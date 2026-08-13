import React from 'react'
import PageLayout from '../components/PageLayout'
import { Avatar, Box, Divider, List, ListItem, ListItemAvatar, Typography } from '@mui/material';
import moment from 'moment';
import { useNotifications } from '../context/NotificationContext';
import { useReferral } from '../context/ReferralContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Notifications = () => {
    const { tabNotification, fetchNotifications } = useNotifications();
    const { getPendingReferralCount } = useReferral();

    const uniqueNotifications = Object.values(
        (tabNotification || []).reduce((acc, curr) => {
            acc[curr._id] = curr;
            return acc;
        }, {})
    );

    const navigate = useNavigate();

    const handleNavigation = (item) => {
        switch (item.type) {
            case "new_request":
            case "request_rejected":
                navigate("/myride", { state: { tab: 2, rideId: item.data?.rideId }, });
                break;
            case "request_accepted":
                navigate("/request-ride", { state: { rideId: item.data?.rideId }, });
                break;
            case "referral_approved":
            case "request_cancelled":
                break
            case "referral_pending":
            case "referral_rejected":
                navigate("/my-referalls");
                break;
            case "ride_started":
                navigate("/myride")
                break;

            default:
                navigate("/");
        }
    }

    const handleIsRead = (id, item) => {

        if (item?.isRead) return;
        try {
            axios.patch(Api + `/notification/${id}`)
                .then((res) => {
                    fetchNotifications();
                    getPendingReferralCount();
                })
        } catch (error) {
            console.log(error.message)
        }
    }
    return (
        <PageLayout>
            <List
                sx={{
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
                        const itemId = item.id || item._id;

                        return (
                            <React.Fragment key={item._id}>
                                <ListItem
                                    onClick={() => {
                                        handleNavigation(item);
                                        handleIsRead(itemId, item);
                                        handleCloseNotifications();
                                    }}
                                    alignItems="flex-start"
                                    sx={{
                                        borderRadius: 3,
                                        marginBottom: 1,
                                        bgcolor: isUnread ? '#e3f2fd' : '#f4f4f4ff',
                                        transition: '0.2s',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: isUnread ? '#bbdefb' : '#f5f5f5',
                                        },
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar src={item?.actorId?.profileImage || item?.data?.profileImage}>
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
                                                    {item.title || item.category}
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
        </PageLayout>
    )
}

export default Notifications