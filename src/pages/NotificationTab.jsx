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

export default function NotificationTab() {
    const { tabNotification } = useNotifications();

    console.log(tabNotification,'tabNotification')

    return (
        <List
            sx={{
                width: '100%',
                maxWidth: 360,
                bgcolor: 'background.paper',
            }}
        >
            {tabNotification?.length === 0 ? (
                <Typography sx={{ p: 2, textAlign:'center' }}>No notifications</Typography>
            ) : (
                tabNotification.map((item) => {
                    const isUnread = !item.isRead;

                    return (
                        <React.Fragment key={item._id}>
                            <ListItem
                                alignItems="flex-start"
                                sx={{
                                    borderRadius: 3,
                                    marginBottom: 1,
                                    bgcolor: isUnread ? '#e3f2fd' : 'transparent',
                                    transition: '0.2s',
                                    '&:hover': {
                                        bgcolor: isUnread ? '#bbdefb' : '#f5f5f5'
                                    }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar src={item?.actorId?.profileImage}>
                                        {item?.actorId?.firstName?.[0] || "U"}
                                    </Avatar>
                                </ListItemAvatar>
                                <Box sx={{
                                    display: 'flex',
                                    width: '100%',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <Box>
                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                            <Typography
                                                sx={{
                                                    marginTop: -0.5,
                                                    fontSize: 13,
                                                    fontWeight: isUnread ? 700 : 500
                                                }}
                                            >
                                                {item.title}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                sx={{ color: 'gray', fontSize: 11, marginTop: -2, }}
                                            >
                                                {moment(item.createdAt).fromNow()}
                                            </Typography>
                                        </Box>
                                        <>
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
                                            <span
                                                style={{ fontSize: 11 }}
                                            >
                                                {" — " + item.message}
                                            </span>
                                        </>
                                    </Box>

                                    {isUnread && (
                                        <Box
                                            sx={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: '50%',
                                                bgcolor: '#1976d2',
                                                ml: 1,
                                                mt: 1
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