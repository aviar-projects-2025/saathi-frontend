import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Paper, Chip, Avatar, Button,
  Divider, Stack, LinearProgress,
  TextField,
  CircularProgress
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import UserAvatar from '../components/UserAvatar.jsx';
import PageLayout from '../components/PageLayout.jsx';
import ChatIcon from '@mui/icons-material/Chat';
import ShareIcon from '@mui/icons-material/Share';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import CloseIcon from '@mui/icons-material/Close';
import Api from '../Api.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import CommunityImage from '../components/CommunityImage.jsx';
import CommunityComments from './CommunityComments.jsx';
import { useUser } from '../context/userConetext.jsx';

const topMembers = [
  { name: 'Vijay Patel', initials: 'VP', rides: 67, city: 'Frisco', badge: '🏅 Founding member', verified: true },
  { name: 'Deepa Iyer', initials: 'DI', rides: 42, city: 'Plano', badge: '⭐ Community elder', verified: true },
  { name: 'Rahul Sharma', initials: 'RS', rides: 34, city: 'Dallas', badge: null, verified: true },
  { name: 'Ananya Krishnan', initials: 'AK', rides: 18, city: 'Houston', badge: null, verified: true },
  { name: 'Sunita Mehta', initials: 'SM', rides: 12, city: 'Chicago', badge: null, verified: false },
];

const activities = [
  { text: 'Vijay P. gave a free temple ride to 4 members', time: '2h ago', icon: '🛕' },
  { text: 'Deepa I. helped Neel K.\'s parents from the airport', time: '5h ago', icon: '✈️' },
  { text: 'Rahul S. completed his 34th community ride!', time: '1d ago', icon: '🎉' },
  { text: '3 new members joined from Houston', time: '2d ago', icon: '👋' },
  { text: 'Sunita M. got 5 ride offers for her family trip', time: '3d ago', icon: '🙏' },
];

// const communityPosts = [
//   {
//     name: "Vijay Patel",
//     city: "Frisco",
//     time: "2h ago",
//     initials: "VP",
//     verified: true,
//     description:
//       "Planning a ride from Dallas to Houston this weekend. 2 seats available. Happy to help anyone from our Saathi community.",
//     postImage:
//       "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
//     likes: 24,
//     comments: 6,
//   },
//   {
//     name: "Deepa Iyer",
//     city: "Plano",
//     time: "5h ago",
//     initials: "DI",
//     verified: true,
//     description:
//       "Thank you Rahul for helping my parents with airport pickup. This is why Saathi community is special 🙏",
//     postImage: "",
//     likes: 41,
//     comments: 12,
//   },
// ];

export default function Community() {
  const [post, setPost] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'))

  const { currentUser } = useUser()

  const SAFFRON = "#E8650A";
  const SAFFRON_LIGHT = "#FDF0E8";
  const CARD_BORDER = "1px solid #F0E6DC";


  const handleCreatePost = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("description", post);
      formData.append("authorId", user?.id);
      formData.append("name", "Daniel Arun");
      formData.append("city", "Saathi Community");
      formData.append("time", "Just now");
      formData.append("initials", "DA");
      formData.append("verified", true,);

      if (media) {
        formData.append("postImage", media);
      }


      const res = await axios.post(Api + "/community/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });


      setPost("");
      setMedia(null);
      setPreview("");
      toast.success("Posted")
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      getCommmunityPost();
    }
  };

  const getCommmunityPost = async () => {
    try {
      setPostLoading(true);

      const postsRes = await axios.get(Api + "/community/");
      const likesRes = await axios.get(Api + `/likes/liked-posts/${user.id}`);

      const likedPostIds = likesRes?.data?.data || [];

      const updatedPosts = postsRes?.data?.data?.map((post) => ({
        ...post,
        isLiked: likedPostIds.includes(post._id),
      }));

      setCommunityPosts(updatedPosts);
    } catch (error) {
      console.error(error.message);
    } finally {
      setPostLoading(false);
    }
  };

  useEffect(() => {
    getCommmunityPost();
  }, [])



  const formattedDateTime = (createdAt) => {
    let val;
    return val = new Date(createdAt).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    })

  }

  const addLike = async (id) => {
    try {
      const res = await axios.post(Api + `/likes/${id}/${user.id}`);

      setCommunityPosts((prev) =>
        prev.map((post) =>
          post._id === id
            ? {
              ...post,
              isLiked: res.data.isLiked,
              likes: res.data.likesCount,
            }
            : post
        )
      );
    } catch (error) {
      // toast.error(error.message);
    }
  };

  const removeLike = async (id) => {
    try {
      const res = await axios.delete(Api + `/likes/${id}/${user.id}`);
      setCommunityPosts((prev) =>
        prev.map((post) =>
          post._id === id
            ? {
              ...post,
              isLiked: res.data.isLiked,
              likes: res.data.likesCount,
            }
            : post
        )
      );
    } catch (error) {
      // toast.error(error.message)
    }
  }



  return (
    // <Box sx={{ maxWidth: 1000, mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
    <PageLayout>
      <Typography variant="h5" fontWeight={800} mb={0.5}>
        Saathi <span style={{ color: '#E8650A' }}>Community</span>
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Built on trust, referrals, and shared roots 🙏
      </Typography>

      <Stack direction={'row'}
        sx={{
          mt: 3,
          justifyContent: 'space-between'
        }}>
        <Box
          sx={{
            width: '110%',
            flexShrink: 0,
          }}
        >
          {/* left Post Feed */}
          <Grid
            xs={12}
            md={7}
            lg={6}
            sx={{
              height: "calc(100vh - 130px)",
              overflowY: "auto",
              pr: 1,
              paddingRight: 10,
            }}
          >
            {/* Commmunity Post */}
            <Grid xs={12} md={7}>
              {/* Create Post Box */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid #F0E6DC",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                  <UserAvatar
                    size={42}
                    verified
                    currentUser={currentUser}
                  />

                  {/* <UserAvatar
                    src={user?.profileImage || ""}
                    sx={{
                      width: { xs: 40, sm: 42, md: 42 },
                      height: { xs: 40, sm: 42, md: 42 },
                      bgcolor: SAFFRON,
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: { xs: "0.85rem", sm: "1rem", md: "1.15rem" },
                      flexShrink: 0,
                    }}
                    size={42}
                    verified
                  >
                    {!user?.profileImage &&
                      `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`}
                  </UserAvatar> */}

                  <TextField
                    fullWidth
                    multiline
                    minRows={1}
                    maxRows={5}
                    value={post}
                    onChange={(e) => setPost(e.target.value)}
                    placeholder="Make a post in Saathi community"
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        alignItems: "flex-start",
                      },
                    }}
                  />
                </Box>

                {preview && (
                  <Box
                    sx={{
                      mt: 2,
                      position: "relative",
                      borderRadius: 3,
                      overflow: "hidden",
                      border: "1px solid #eee",
                    }}
                  >
                    <Box
                      component="img"
                      src={preview}
                      alt="preview"
                      sx={{
                        width: "100%",
                        maxHeight: 300,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />

                    <Button
                      size="small"
                      onClick={() => {
                        setMedia(null);
                        setPreview("");
                      }}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        minWidth: 0,
                        bgcolor: "#fff",
                        borderRadius: "50%",
                        width: 34,
                        height: 34,
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </Button>
                  </Box>
                )}

                <Divider sx={{ my: 1.5 }} />

                <Stack direction="row" >
                  <Button
                    component="label"
                    startIcon={<PermMediaIcon />}
                    sx={{ textTransform: "none" }}
                  >
                    Media
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setMedia(file);
                          setPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </Button>

                  <Button
                    variant="contained"
                    disabled={loading || (!post.trim() && !media)}
                    onClick={handleCreatePost}
                    sx={{
                      borderRadius: 999,
                      textTransform: "none",
                      bgcolor: "#E8650A",
                    }}
                  >
                    {loading ? "Posting..." : "Post"}
                  </Button>
                </Stack>
              </Paper>
              {/* Posts */}
              {postLoading ?
                <>
                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <CircularProgress size={50} />
                  </Box>
                </>
                :
                <>
                  {communityPosts?.map((post, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        borderRadius: 3,
                        border: "1px solid #F0E6DC",
                        mb: 2,
                        overflow: "hidden",
                      }}
                    >
                      <Box sx={{ p: 2 }}>
                        {/* Header */}
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                          <Avatar
                            src={post?.authorId?.profileImage}
                            sx={{
                              width: { xs: 40, sm: 42, md: 42 },
                              height: { xs: 40, sm: 42, md: 42 },
                              bgcolor: SAFFRON,
                              color: "#fff",
                              fontWeight: 800,
                              fontSize: { xs: "0.85rem", sm: "1rem", md: "1.15rem" },
                              flexShrink: 0,
                            }}
                          >
                            {!currentUser?.profileImage &&
                              `${currentUser?.firstName?.[0] || ""}${currentUser?.lastName?.[0] || ""}`}
                          </Avatar>

                          <Box sx={{ flex: 1 }}>
                            <Typography fontWeight={700} fontSize="0.95rem">
                              {post?.authorId?.firstName} {post?.authorId?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {'tvm'} | {formattedDateTime(post?.createdAt)}
                            </Typography>
                          </Box>

                          <MoreHorizIcon sx={{ color: "text.secondary" }} />
                        </Box>

                        {/* Description */}
                        <Typography sx={{ mt: 1.5, fontSize: "0.95rem", lineHeight: 1.6 }}>
                          {post.description}
                        </Typography>
                      </Box>

                      {/* Image */}
                      {post.postImage && (
                        <CommunityImage src={post.postImage} />
                      )}

                      {/* Likes Count */}
                      <Box sx={{ px: 2, py: 1 }}>
                        {/* <Typography variant="caption" color="text.secondary">
                      ❤️ {post.likes} likes • {post.comments} comments
                    </Typography> */}
                      </Box>

                      <Divider />

                      {/* Actions */}
                      <Stack direction="row" sx={{ py: 0.5, marginLeft: 2, gap: 5 }}>
                        <Button
                          onClick={() => {
                            post.isLiked ?
                              removeLike(post._id) :
                              addLike(post._id)
                          }}
                          startIcon={
                            post.isLiked ? (
                              <ThumbUpIcon sx={{ color: "#0084ffff" }} />
                            ) : (
                              <ThumbUpOffAltIcon />
                            )
                          }
                          sx={{ textTransform: "none", color: "text.secondary" }}
                        >
                          Like {post?.likes || 0}
                        </Button>

                        <Button
                          startIcon={activeCommentPostId === post._id ? <ChatIcon sx={{ color: "#0084ffff" }} /> : <ChatIcon />}
                          onClick={() => {
                            setActiveCommentPostId((prev) =>
                              prev === post._id ? null : post._id
                            );
                          }}
                          sx={{ textTransform: "none", color: "text.secondary" }}
                        >
                          Comments
                        </Button>

                        <Button
                          startIcon={<ShareIcon />}
                          sx={{ textTransform: "none", color: "text.secondary" }}
                        >
                          Share
                        </Button>
                      </Stack>
                      <Divider />

                      {activeCommentPostId === post._id && (
                        <Box sx={{ margin: 1.5 }}>
                          <CommunityComments post={post} user={user} />
                        </Box>
                      )}
                    </Paper>
                  ))}
                </>
              }
            </Grid>
          </Grid>
        </Box>
        <Box
          sx={{
            flexShrink: 0,
            width: '70%',
          }}
        >
          <Grid
            item
            xs={12}
            md={4}
            lg={3}
            sx={{
              height: "calc(100vh - 130px)",
              overflowY: "auto",
              position: { md: "sticky" },
              top: 100,
            }}
          >
            {/* Top members */}
            <Grid xs={12} md={7}>
              <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #F0E6DC' }} elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <EmojiEventsIcon sx={{ color: '#F4A261' }} />
                  <Typography fontWeight={700}>Top Community Members</Typography>
                </Box>
                {topMembers.map((member, i) => (
                  <Box key={member.name}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25 }}>
                      <Typography fontWeight={800} color="text.secondary" fontSize="0.9rem" sx={{ width: 20, textAlign: 'center' }}>
                        {i + 1}
                      </Typography>
                      <UserAvatar name={member.name} initials={member.initials} size={40} verified={member.verified} />
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={600} fontSize="0.9rem">{member.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{member.city}</Typography>
                        {member.badge && (
                          <Typography variant="caption" sx={{ display: 'block', color: '#E8650A', fontWeight: 600 }}>
                            {member.badge}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography fontWeight={700} color="primary.main" fontSize="0.9rem">{member.rides}</Typography>
                        <Typography variant="caption" color="text.secondary">rides</Typography>
                      </Box>
                    </Box>
                    {i < topMembers.length - 1 && <Divider />}
                  </Box>
                ))}
              </Paper>
            </Grid>

            {/* Activity feed + invite */}
            <Grid xs={12} md={5}>
              <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #F0E6DC', mb: 2 }} elevation={0}>
                <Typography fontWeight={700} mb={1.5}>Recent Activity</Typography>
                {activities.map((a, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.25, mb: 1.5 }}>
                    <Typography fontSize="1.1rem">{a.icon}</Typography>
                    <Box>
                      <Typography variant="body2" lineHeight={1.4}>{a.text}</Typography>
                      <Typography variant="caption" color="text.secondary">{a.time}</Typography>
                    </Box>
                  </Box>
                ))}
              </Paper>

              {/* Invite card */}
              <Paper
                sx={{
                  p: 2.5, borderRadius: 3,
                  background: 'linear-gradient(135deg, #E8650A 0%, #FF8C42 100%)',
                  color: '#fff',
                }}
                elevation={0}
              >
                <Typography fontWeight={800} fontSize="1.05rem" mb={0.5}>Invite a friend 🙏</Typography>
                <Typography variant="body2" mb={2} sx={{ opacity: 0.9 }}>
                  Saathi grows through trust. Invite someone from your community to join — your referral builds their credibility.
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  sx={{ bgcolor: '#fff', color: '#E8650A', fontWeight: 700, '&:hover': { bgcolor: '#FFF8F2' } }}
                >
                  Share invite link
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </PageLayout >
  );
}
