import React, { useMemo, useState } from "react";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Avatar,
  TextField,
  InputAdornment,
  Divider,
  Badge,
  List,
  ListItemButton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';

const SAFFRON = "#FF9933";

const MessagesModal = ({
  open,
  onClose,
  conversations = [],
  onOpenChat,
}) => {
  const [search, setSearch] = useState("");

  const filteredConversations = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return conversations;

    return conversations.filter((conversation) => {
      const name = `${conversation?.user?.firstName || ""} ${
        conversation?.user?.lastName || ""
      }`
        .trim()
        .toLowerCase();

      return (
        name.includes(value) ||
        conversation?.lastMessage
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [conversations, search]);

  const getUserName = (user) => {
    const name = `${user?.firstName || ""} ${
      user?.lastName || ""
    }`.trim();

    return name || user?.name || "User";
  };

  const getInitials = (user) => {
    const first =
      user?.firstName?.[0] ||
      user?.name?.[0] ||
      "";

    const last =
      user?.lastName?.[0] ||
      "";

    return `${first}${last}`.toUpperCase() || "U";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: 460,
          height: {
            xs: "100%",
            sm: "650px",
          },
          maxHeight: {
            xs: "100%",
            sm: "90vh",
          },
          borderRadius: {
            xs: 0,
            sm: 3,
          },
          overflow: "hidden",
          m: {
            xs: 0,
            sm: 2,
          },
        },
      }}
    >
      {/* HEADER */}

      <Box
        sx={{
          height: 68,
          px: 2,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #eeeeee",
          flexShrink: 0,
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            mr: 1,
            display: {
              xs: "inline-flex",
              sm: "none",
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        <ChatBubbleOutlineIcon
          sx={{
            color: SAFFRON,
            mr: 1,
          }}
        />

        <Typography
          sx={{
            fontSize: "1.1rem",
            fontWeight: 800,
            flex: 1,
          }}
        >
          Messages
        </Typography>

        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* SEARCH */}

      <Box
        sx={{
          px: 2,
          py: 1.5,
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search messages..."
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              backgroundColor: "#f7f7f7",

              "& fieldset": {
                borderColor: "#eeeeee",
              },

              "&.Mui-focused fieldset": {
                borderColor: SAFFRON,
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{
                    color: "#888",
                  }}
                />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Divider />

      {/* CONVERSATIONS */}

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",

          "&::-webkit-scrollbar": {
            width: 6,
          },

          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#ccc",
            borderRadius: 10,
          },
        }}
      >
        {filteredConversations.length === 0 ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              px: 3,
              textAlign: "center",
            }}
          >
            <ChatBubbleOutlineIcon
              sx={{
                fontSize: 52,
                color: "#ddd",
                mb: 1,
              }}
            />

            <Typography
              fontWeight={700}
              sx={{
                color: "#555",
              }}
            >
              No conversations yet
            </Typography>

            <Typography
              sx={{
                color: "#999",
                fontSize: "0.85rem",
                mt: 0.5,
              }}
            >
              When you message someone from their
              profile, your conversation will appear
              here.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {filteredConversations.map(
              (conversation) => {
                const user = conversation.user;

                return (
                  <React.Fragment
                    key={user?._id}
                  >
                    <ListItemButton
                      onClick={() =>
                        onOpenChat(user)
                      }
                      sx={{
                        px: 2,
                        py: 1.3,

                        "&:hover": {
                          backgroundColor:
                            "#fff7ef",
                        },
                      }}
                    >
                      <Badge
                        overlap="circular"
                        variant="dot"
                        invisible={
                          !conversation.online
                        }
                        sx={{
                          "& .MuiBadge-badge": {
                            backgroundColor:
                              "#35c759",
                            width: 10,
                            height: 10,
                            borderRadius:
                              "50%",
                            border:
                              "2px solid white",
                          },
                        }}
                      >
                        <Avatar
                          src={
                            user?.profileImage ||
                            ""
                          }
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: SAFFRON,
                            fontWeight: 700,
                          }}
                        >
                          {!user?.profileImage &&
                            getInitials(user)}
                        </Avatar>
                      </Badge>

                      <Box
                        sx={{
                          ml: 1.5,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
                            gap: 1,
                          }}
                        >
                          <Typography
                            fontWeight={
                              conversation.unread
                                ? 800
                                : 600
                            }
                            noWrap
                          >
                            {getUserName(user)}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize:
                                "0.68rem",
                              color:
                                conversation.unread
                                  ? SAFFRON
                                  : "#999",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {
                              conversation.time
                            }
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems:
                              "center",
                            mt: 0.4,
                          }}
                        >
                          <Typography
                            noWrap
                            sx={{
                              flex: 1,
                              fontSize:
                                "0.82rem",
                              color:
                                conversation.unread
                                  ? "#333"
                                  : "#888",
                              fontWeight:
                                conversation.unread
                                  ? 600
                                  : 400,
                            }}
                          >
                            {
                              conversation.lastMessage
                            }
                          </Typography>

                          {conversation.unread &&
                            conversation.unreadCount >
                              0 && (
                              <Box
                                sx={{
                                  minWidth: 20,
                                  height: 20,
                                  borderRadius:
                                    "50%",
                                  backgroundColor:
                                    SAFFRON,
                                  color: "#fff",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  fontSize:
                                    "0.68rem",
                                  fontWeight: 700,
                                  ml: 1,
                                }}
                              >
                                {
                                  conversation.unreadCount
                                }
                              </Box>
                            )}
                        </Box>
                      </Box>
                    </ListItemButton>

                    <Divider
                      sx={{
                        ml: 9,
                      }}
                    />
                  </React.Fragment>
                );
              }
            )}
          </List>
        )}
      </Box>
    </Dialog>
  );
};

export default MessagesModal;