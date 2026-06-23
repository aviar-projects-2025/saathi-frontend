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

export default function Community() {
  const [post, setPost] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [communityPosts, setCommunityPosts] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'))

  // console.log(user,'user')

  const newPost = {
    description: post,
    authorId: user?.id,
    postImage: preview,
    name: "Daniel Arun",
    city: "Saathi Community",
    time: "Just now",
    initials: "DA", verified: true,
  };

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

      console.log(formData, 'formData')

      const res = await axios.post(Api + "/community/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(res.data, "post created");

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

  // const addLike = (id) => {
  //   try {
  //     let postId = id
  //     axios.post(Api + `/likes/${postId}/${user.id}`)
  //       .then((res) => {
  //         console.log(res)
  //         setIsLiked(res?.data?.isLiked)
  //       })
  //   } catch (error) {
  //     toast.error(error.message)
  //   }
  // }

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
      console.log(res,'delete')
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
    <PageLayout>
      <Typography
        variant="h5"
        fontWeight={800}
        mb={0.5}
        sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
      >
        Saathi <span style={{ color: '#E8650A' }}>Community</span>
      </Typography>
      <Typography
        color="text.secondary"
        mb={3}
        sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}
      >
        Built on trust, referrals, and shared roots 🙏
      </Typography>

      <Grid container spacing={{ xs: 2, md: 3 }} alignItems="flex-start">
        {/* LEFT: Post feed */}
        <Grid item xs={12} md={7} lg={8}>
          <Box sx={{ pr: { xs: 0, md: 1 } }}>
            {/* Create Post Box */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                border: "1px solid #F0E6DC",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", gap: { xs: 1, sm: 1.5 }, alignItems: "flex-start" }}>
                <UserAvatar
                  name="Daniel Arun"
                  initials="DA"
                  size={42}
                  verified
                  sx={{ flexShrink: 0 }}
                />

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
                    minWidth: 0,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      alignItems: "flex-start",
                      fontSize: { xs: '0.9rem', sm: '1rem' },
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
                      maxHeight: { xs: 200, sm: 300 },
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
                      p: 0,
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </Button>
                </Box>
              )}

              <Divider sx={{ my: 1.5 }} />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
              >
                <Button
                  component="label"
                  startIcon={<PermMediaIcon />}
                  sx={{ textTransform: "none", alignSelf: { xs: 'flex-start', sm: 'center' } }}
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
                    width: { xs: '100%', sm: 'auto' },
                  }}
                >
                  {loading ? "Posting..." : "Post"}
                </Button>
              </Stack>
            </Paper>

            {/* Posts */}
            {postLoading ? (
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  py: 4,
                }}
              >
                <CircularProgress size={50} />
              </Box>
            ) : (
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
                    <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                      {/* Header */}
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: { xs: 1, sm: 1.5 } }}>
                        <UserAvatar
                          name={post?.authorId?.firstName}
                          initials={post.initials}
                          size={44}
                          verified={post.verified}
                          sx={{ flexShrink: 0 }}
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
                      {console.log(post)}
                      <Box sx={{ p: 2 }}>
                        {/* Header */}
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                          <UserAvatar
                            name={post?.authorId?.firstName}
                            initials={post.initials}
                            size={44}
                            verified={post.verified}
                          />

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

                        <MoreHorizIcon sx={{ color: "text.secondary", flexShrink: 0 }} />
                      </Box>

                      {/* Description */}
                      <Typography
                        sx={{
                          mt: 1.5,
                          fontSize: "0.95rem",
                          lineHeight: 1.6,
                          wordBreak: 'break-word',
                        }}
                      >
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

                      {/* Actions */}
                      <Stack direction="row" sx={{ py: 0.5, marginLeft: 2, gap: 5 }}>
                        {/* {console.log(isLiked, 'isLiked')} */}
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

                    {/* Actions */}
                    <Stack
                      direction="row"
                      sx={{
                        py: 0.5,
                        px: { xs: 0.5, sm: 2 },
                        gap: { xs: 0.5, sm: 3, md: 5 },
                        flexWrap: 'wrap',
                      }}
                    >
                      <Button
                        startIcon={<ThumbUpOffAltIcon />}
                        sx={{
                          textTransform: "none",
                          color: "text.secondary",
                          flex: { xs: 1, sm: '0 0 auto' },
                          minWidth: 0,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        }}
                      >
                        Like
                      </Button>

                      <Button
                        startIcon={<ChatIcon />}
                        sx={{
                          textTransform: "none",
                          color: "text.secondary",
                          flex: { xs: 1, sm: '0 0 auto' },
                          minWidth: 0,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        }}
                      >
                        Comment
                      </Button>

                      <Button
                        startIcon={<ShareIcon />}
                        sx={{
                          textTransform: "none",
                          color: "text.secondary",
                          flex: { xs: 1, sm: '0 0 auto' },
                          minWidth: 0,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        }}
                      >
                        Share
                      </Button>
                    </Stack>
                  </Paper>
                ))}
              </>
            )}
          </Box>
        </Grid>

        {/* RIGHT: Sidebar */}
        <Grid item xs={12} md={5} lg={4}>
          <Box
            sx={{
              position: { xs: 'static', md: 'sticky' },
              top: { md: 24 },
              alignSelf: 'flex-start',
            }}
          >
            {/* Top members */}
            <Paper sx={{ p: { xs: 1.5, sm: 2.5 }, borderRadius: 3, border: '1px solid #F0E6DC', mb: 2 }} elevation={0}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EmojiEventsIcon sx={{ color: '#F4A261' }} />
                <Typography fontWeight={700} sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                  Top Community Members
                </Typography>
              </Box>
              {topMembers.map((member, i) => (
                <Box key={member.name}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1.5 }, py: 2 }}>
                    <Typography
                      fontWeight={800}
                      color="text.secondary"
                      fontSize="0.9rem"
                      sx={{ width: 20, textAlign: 'center', flexShrink: 0 }}
                    >
                      {i + 1}
                    </Typography>
                    <UserAvatar
                      name={member.name}
                      initials={member.initials}
                      size={40}
                      verified={member.verified}
                      sx={{ flexShrink: 0 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontWeight={600} fontSize="0.9rem" noWrap>
                        {member.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap component="div">
                        {member.city}
                      </Typography>
                      {member.badge && (
                        <Typography
                          variant="caption"
                          noWrap
                          component="div"
                          sx={{ color: '#E8650A', fontWeight: 600 }}
                        >
                          {member.badge}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ textAlign: 'right', flexShrink: 0, pl: 0.5 }}>
                      <Typography fontWeight={700} color="primary.main" fontSize="0.9rem">
                        {member.rides}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        rides
                      </Typography>
                    </Box>
                  </Box>
                  {i < topMembers.length - 1 && <Divider />}
                </Box>
              ))}
            </Paper>

            {/* Activity feed */}
            <Paper sx={{ p: { xs: 1.5, sm: 2.5 }, borderRadius: 3, border: '1px solid #F0E6DC', mb: 2 }} elevation={0}>
              <Typography fontWeight={700} mb={1.5} sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                Recent Activity
              </Typography>
              {activities.map((a, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1.25, mb: 2 ,mt:2 }}>
                  <Typography fontSize="1.1rem" sx={{ flexShrink: 0 }}>{a.icon}</Typography>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" lineHeight={1.4} sx={{ wordBreak: 'break-word' }}>
                      {a.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{a.time}</Typography>
                  </Box>
                </Box>
              ))}
            </Paper>

            {/* Invite card */}
            <Paper
              sx={{
                p: { xs: 1.5, sm: 2.5 },
                borderRadius: 3,
                background: 'linear-gradient(135deg, #E8650A 0%, #FF8C42 100%)',
                color: '#fff',
              }}
              elevation={0}
            >
              <Typography fontWeight={800} fontSize="1.05rem" sx={{mb:2}} >
                Invite a friend 🙏
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb:2 }}>
                Saathi grows through trust. Invite someone from your community to join — your referral builds their credibility.
              </Typography>
              <Button
                variant="contained"
                size="small"
                sx={{
                  bgcolor: '#fff',
                  color: '#E8650A',
                  fontWeight: 700,
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': { bgcolor: '#FFF8F2' },
                }}
              >
                Share invite link
              </Button>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </PageLayout>
  );
}