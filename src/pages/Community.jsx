// import React, { useEffect, useState } from 'react';
// import {
//   Box, Typography, Grid, Paper, Chip, Avatar, Button,
//   Divider, Stack, LinearProgress,
//   TextField,
//   CircularProgress
// } from '@mui/material';
// import GroupsIcon from '@mui/icons-material/Groups';
// import StarIcon from '@mui/icons-material/Star';
// import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
// import FavoriteIcon from '@mui/icons-material/Favorite';
// import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
// import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
// import ThumbUpIcon from '@mui/icons-material/ThumbUp';
// import UserAvatar from '../components/UserAvatar.jsx';
// import PageLayout from '../components/PageLayout.jsx';
// import ChatIcon from '@mui/icons-material/Chat';
// import ShareIcon from '@mui/icons-material/Share';
// import PermMediaIcon from '@mui/icons-material/PermMedia';
// import CloseIcon from '@mui/icons-material/Close';
// import Api from '../Api.jsx';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import CommunityImage from '../components/CommunityImage.jsx';
// import CommunityComments from './CommunityComments.jsx';
// import { useUser } from '../context/userConetext.jsx';


// // const communityPosts = [
// //   {
// //     name: "Vijay Patel",
// //     city: "Frisco",
// //     time: "2h ago",
// //     initials: "VP",
// //     verified: true,
// //     description:
// //       "Planning a ride from Dallas to Houston this weekend. 2 seats available. Happy to help anyone from our Saathi community.",
// //     postImage:
// //       "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
// //     likes: 24,
// //     comments: 6,
// //   },
// //   {
// //     name: "Deepa Iyer",
// //     city: "Plano",
// //     time: "5h ago",
// //     initials: "DI",
// //     verified: true,
// //     description:
// //       "Thank you Rahul for helping my parents with airport pickup. This is why Saathi community is special 🙏",
// //     postImage: "",
// //     likes: 41,
// //     comments: 12,
// //   },
// // ];

// export default function Community() {
//   const [post, setPost] = useState("");
//   const [media, setMedia] = useState(null);
//   const [preview, setPreview] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [postLoading, setPostLoading] = useState(false);
//   const [communityPosts, setCommunityPosts] = useState([]);
//   const [activeCommentPostId, setActiveCommentPostId] = useState(null);
//   const user = JSON.parse(localStorage.getItem('user'))

//   const { currentUser } = useUser()

//   const SAFFRON = "#E8650A";
//   const SAFFRON_LIGHT = "#FDF0E8";
//   const CARD_BORDER = "1px solid #F0E6DC";


//   const handleCreatePost = async () => {
//     try {
//       setLoading(true);
//       const formData = new FormData();
//       formData.append("description", post);
//       formData.append("authorId", user?.id);
//       formData.append("name", "Daniel Arun");
//       formData.append("city", "Saathi Community");
//       formData.append("time", "Just now");
//       formData.append("initials", "DA");
//       formData.append("verified", true,);

//       if (media) {
//         formData.append("postImage", media);
//       }


//       const res = await axios.post(Api + "/community/", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });


//       setPost("");
//       setMedia(null);
//       setPreview("");
//       toast.success("Posted")
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setLoading(false);
//       getCommmunityPost();
//     }
//   };

//   const getCommmunityPost = async () => {
//     try {
//       setPostLoading(true);

//       const postsRes = await axios.get(Api + "/community/");
//       const likesRes = await axios.get(Api + `/likes/liked-posts/${user.id}`);

//       const likedPostIds = likesRes?.data?.data || [];

//       const updatedPosts = postsRes?.data?.data?.map((post) => ({
//         ...post,
//         isLiked: likedPostIds.includes(post._id),
//       }));

//       setCommunityPosts(updatedPosts);
//     } catch (error) {
//       console.error(error.message);
//     } finally {
//       setPostLoading(false);
//     }
//   };

//   useEffect(() => {
//     getCommmunityPost();
//   }, [])



//   const formattedDateTime = (createdAt) => {
//     let val;
//     return val = new Date(createdAt).toLocaleString("en-IN", {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//       hour: "numeric",
//       minute: "2-digit"
//     })

//   }

//   const addLike = async (id) => {
//     try {
//       const res = await axios.post(Api + `/likes/${id}/${user.id}`);

//       setCommunityPosts((prev) =>
//         prev.map((post) =>
//           post._id === id
//             ? {
//               ...post,
//               isLiked: res.data.isLiked,
//               likes: res.data.likesCount,
//             }
//             : post
//         )
//       );
//     } catch (error) {
//       // toast.error(error.message);
//     }
//   };

//   const removeLike = async (id) => {
//     try {
//       const res = await axios.delete(Api + `/likes/${id}/${user.id}`);
//       setCommunityPosts((prev) =>
//         prev.map((post) =>
//           post._id === id
//             ? {
//               ...post,
//               isLiked: res.data.isLiked,
//               likes: res.data.likesCount,
//             }
//             : post
//         )
//       );
//     } catch (error) {
//       // toast.error(error.message)
//     }
//   }



//   return (
//     // <Box sx={{ maxWidth: 1000, mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
//     <PageLayout>
//       <Typography variant="h5" fontWeight={800} mb={0.5}>
//         Saathi <span style={{ color: '#E8650A' }}>Community</span>
//       </Typography>
//       <Typography color="text.secondary" mb={3}>
//         Built on trust, referrals, and shared roots 🙏
//       </Typography>

//       <Stack direction={'row'}
//         sx={{
//           mt: 3,
//           justifyContent: 'space-between'
//         }}>
//         <Box
//           sx={{
//             width: '110%',
//             flexShrink: 0,
//           }}
//         >
//           {/* left Post Feed */}
//           <Grid
//             xs={12}
//             md={7}
//             lg={6}
//             sx={{
//               height: "calc(100vh - 130px)",
//               overflowY: "auto",
//               pr: 1,
//               paddingRight: 10,
//             }}
//           >
//             {/* Commmunity Post */}
//             <Grid xs={12} md={7}>
//               {/* Create Post Box */}
//               <Paper
//                 elevation={0}
//                 sx={{
//                   p: 2,
//                   borderRadius: 3,
//                   border: "1px solid #F0E6DC",
//                   mb: 2,
//                 }}
//               >
//                 <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
//                   <UserAvatar
//                     size={42}
//                     verified
//                     currentUser={currentUser}
//                   />

//                   {/* <UserAvatar
//                     src={user?.profileImage || ""}
//                     sx={{
//                       width: { xs: 40, sm: 42, md: 42 },
//                       height: { xs: 40, sm: 42, md: 42 },
//                       bgcolor: SAFFRON,
//                       color: "#fff",
//                       fontWeight: 800,
//                       fontSize: { xs: "0.85rem", sm: "1rem", md: "1.15rem" },
//                       flexShrink: 0,
//                     }}
//                     size={42}
//                     verified
//                   >
//                     {!user?.profileImage &&
//                       `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`}
//                   </UserAvatar> */}

//                   <TextField
//                     fullWidth
//                     multiline
//                     minRows={1}
//                     maxRows={5}
//                     value={post}
//                     onChange={(e) => setPost(e.target.value)}
//                     placeholder="Make a post in Saathi community"
//                     variant="outlined"
//                     sx={{
//                       "& .MuiOutlinedInput-root": {
//                         borderRadius: 3,
//                         alignItems: "flex-start",
//                       },
//                     }}
//                   />
//                 </Box>

//                 {preview && (
//                   <Box
//                     sx={{
//                       mt: 2,
//                       position: "relative",
//                       borderRadius: 3,
//                       overflow: "hidden",
//                       border: "1px solid #eee",
//                     }}
//                   >
//                     <Box
//                       component="img"
//                       src={preview}
//                       alt="preview"
//                       sx={{
//                         width: "100%",
//                         maxHeight: 300,
//                         objectFit: "cover",
//                         display: "block",
//                       }}
//                     />

//                     <Button
//                       size="small"
//                       onClick={() => {
//                         setMedia(null);
//                         setPreview("");
//                       }}
//                       sx={{
//                         position: "absolute",
//                         top: 8,
//                         right: 8,
//                         minWidth: 0,
//                         bgcolor: "#fff",
//                         borderRadius: "50%",
//                         width: 34,
//                         height: 34,
//                       }}
//                     >
//                       <CloseIcon fontSize="small" />
//                     </Button>
//                   </Box>
//                 )}

//                 <Divider sx={{ my: 1.5 }} />

//                 <Stack direction="row" >
//                   <Button
//                     component="label"
//                     startIcon={<PermMediaIcon />}
//                     sx={{ textTransform: "none" }}
//                   >
//                     Media
//                     <input
//                       hidden
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => {
//                         const file = e.target.files[0];
//                         if (file) {
//                           setMedia(file);
//                           setPreview(URL.createObjectURL(file));
//                         }
//                       }}
//                     />
//                   </Button>

//                   <Button
//                     variant="contained"
//                     disabled={loading || (!post.trim() && !media)}
//                     onClick={handleCreatePost}
//                     sx={{
//                       borderRadius: 999,
//                       textTransform: "none",
//                       bgcolor: "#E8650A",
//                     }}
//                   >
//                     {loading ? "Posting..." : "Post"}
//                   </Button>
//                 </Stack>
//               </Paper>
//               {/* Posts */}
//               {postLoading ?
//                 <>
//                   <Box
//                     sx={{
//                       width: '100%',
//                       display: 'flex',
//                       justifyContent: 'center',
//                     }}
//                   >
//                     <CircularProgress size={50} />
//                   </Box>
//                 </>
//                 :
//                 <>
//                   {communityPosts?.map((post, index) => (
//                     <Paper
//                       key={index}
//                       elevation={0}
//                       sx={{
//                         borderRadius: 3,
//                         border: "1px solid #F0E6DC",
//                         mb: 2,
//                         overflow: "hidden",
//                       }}
//                     >
//                       <Box sx={{ p: 2 }}>
//                         {/* Header */}
//                         <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
//                           <Avatar
//                             src={post?.authorId?.profileImage}
//                             sx={{
//                               width: { xs: 40, sm: 42, md: 42 },
//                               height: { xs: 40, sm: 42, md: 42 },
//                               bgcolor: SAFFRON,
//                               color: "#fff",
//                               fontWeight: 800,
//                               fontSize: { xs: "0.85rem", sm: "1rem", md: "1.15rem" },
//                               flexShrink: 0,
//                             }}
//                           >
//                             {!currentUser?.profileImage &&
//                               `${currentUser?.firstName?.[0] || ""}${currentUser?.lastName?.[0] || ""}`}
//                           </Avatar>

//                           <Box sx={{ flex: 1 }}>
//                             <Typography fontWeight={700} fontSize="0.95rem">
//                               {post?.authorId?.firstName} {post?.authorId?.lastName}
//                             </Typography>
//                             <Typography variant="caption" color="text.secondary">
//                               {'tvm'} | {formattedDateTime(post?.createdAt)}
//                             </Typography>
//                           </Box>

//                           <MoreHorizIcon sx={{ color: "text.secondary" }} />
//                         </Box>

//                         {/* Description */}
//                         <Typography sx={{ mt: 1.5, fontSize: "0.95rem", lineHeight: 1.6 }}>
//                           {post.description}
//                         </Typography>
//                       </Box>

//                       {/* Image */}
//                       {post.postImage && (
//                         <CommunityImage src={post.postImage} />
//                       )}

//                       {/* Likes Count */}
//                       <Box sx={{ px: 2, py: 1 }}>
//                         {/* <Typography variant="caption" color="text.secondary">
//                       ❤️ {post.likes} likes • {post.comments} comments
//                     </Typography> */}
//                       </Box>

//                       <Divider />

//                       {/* Actions */}
//                       <Stack direction="row" sx={{ py: 0.5, marginLeft: 2, gap: 5 }}>
//                         <Button
//                           onClick={() => {
//                             post.isLiked ?
//                               removeLike(post._id) :
//                               addLike(post._id)
//                           }}
//                           startIcon={
//                             post.isLiked ? (
//                               <ThumbUpIcon sx={{ color: "#0084ffff" }} />
//                             ) : (
//                               <ThumbUpOffAltIcon />
//                             )
//                           }
//                           sx={{ textTransform: "none", color: "text.secondary" }}
//                         >
//                           Like {post?.likes || 0}
//                         </Button>

//                         <Button
//                           startIcon={activeCommentPostId === post._id ? <ChatIcon sx={{ color: "#0084ffff" }} /> : <ChatIcon />}
//                           onClick={() => {
//                             setActiveCommentPostId((prev) =>
//                               prev === post._id ? null : post._id
//                             );
//                           }}
//                           sx={{ textTransform: "none", color: "text.secondary" }}
//                         >
//                           Comments
//                         </Button>

//                         <Button
//                           startIcon={<ShareIcon />}
//                           sx={{ textTransform: "none", color: "text.secondary" }}
//                         >
//                           Share
//                         </Button>
//                       </Stack>
//                       <Divider />

//                       {activeCommentPostId === post._id && (
//                         <Box sx={{ margin: 1.5 }}>
//                           <CommunityComments post={post} user={user} />
//                         </Box>
//                       )}
//                     </Paper>
//                   ))}
//                 </>
//               }
//             </Grid>
//           </Grid>
//         </Box>
//       </Stack>
//     </PageLayout >
//   );
// }



import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Paper, Chip, Avatar, Button,
  Divider, Stack, LinearProgress,
  TextField,
  CircularProgress,
  useMediaQuery,
  useTheme
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

export default function Community() {
  const [post, setPost] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  const { currentUser } = useUser();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Show sidebar on tablet (sm+) and desktop (md+)
  const showSidebar = useMediaQuery(theme.breakpoints.up('sm'));

  const SAFFRON = "#E8650A";
  const CARD_BORDER = "1px solid #F0E6DC";

  const avatarSize = isMobile ? 30 : 35;
  const iconFontSize = isMobile ? 'small' : 'medium';
  const btnFontSize = isMobile ? '0.7rem' : '0.8rem';
  const bodyFontSize = isMobile ? '0.8rem' : '0.8rem';
  const captionSize = isMobile ? '0.6rem' : '0.6rem';
  const avatarFontSize = isMobile ? '0.6rem' : '1.1rem';

  // ── Scroll behavior ────────────────────────────────────────────────────
  // Only the SIDEBAR gets its own independent scroll container (fixed height).
  // The feed/main content scrolls with the page itself (normal page scroll),
  // so scrolling anywhere on the page scrolls the page/feed, except when the
  // cursor is over the sidebar, which scrolls independently.
  const SIDEBAR_SCROLL_HEIGHT = 'calc(100vh - 130px)';

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
      formData.append("verified", true);
      if (media) formData.append("postImage", media);

      await axios.post(Api + "/community/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPost("");
      setMedia(null);
      setPreview("");
      toast.success("Posted");
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
  }, []);

  const formattedDateTime = (createdAt) =>
    new Date(createdAt).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });

  const addLike = async (id) => {
    try {
      const res = await axios.post(Api + `/likes/${id}/${user.id}`);
      setCommunityPosts((prev) =>
        prev.map((post) =>
          post._id === id
            ? { ...post, isLiked: res.data.isLiked, likes: res.data.likesCount }
            : post
        )
      );
    } catch (error) { }
  };

  const removeLike = async (id) => {
    try {
      const res = await axios.delete(Api + `/likes/${id}/${user.id}`);
      setCommunityPosts((prev) =>
        prev.map((post) =>
          post._id === id
            ? { ...post, isLiked: res.data.isLiked, likes: res.data.likesCount }
            : post
        )
      );
    } catch (error) { }
  };

  // ── Discover data ──────────────────────────────────────────────────────────────
  const topMembers = [
    { name: "Vijay Patel", initials: "VP", rides: 67, city: "Frisco", badge: "🏅 Founding member", verified: true },
    { name: "Deepa Iyer", initials: "DI", rides: 42, city: "Plano", badge: "⭐ Community elder", verified: true },
    { name: "Rahul Sharma", initials: "RS", rides: 34, city: "Dallas", badge: null, verified: true },
    { name: "Ananya Krishnan", initials: "AK", rides: 18, city: "Houston", badge: null, verified: true },
    { name: "Sunita Mehta", initials: "SM", rides: 12, city: "Chicago", badge: null, verified: false },
  ];

  const activities = [
    { text: "Vijay P. gave a free temple ride to 4 members", time: "2h ago", icon: "🛕" },
    { text: "Deepa I. helped Neel K.'s parents from the airport", time: "5h ago", icon: "✈️" },
    { text: "Rahul S. completed his 34th community ride!", time: "1d ago", icon: "🎉" },
    { text: "3 new members joined from Houston", time: "2d ago", icon: "👋" },
    { text: "Sunita M. got 5 ride offers for her family trip", time: "3d ago", icon: "🙏" },
  ];

  // ── Small avatar used in the leaderboard ─────────────────────────────────────
  const LeaderAvatar = ({ initials, verified }) => (
    <Box sx={{
      width: 36, height: 36, borderRadius: '50%', background: '#FFE8D6',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: 13, position: 'relative', flexShrink: 0
    }}>
      {initials}
      {verified && (
        <Box sx={{
          position: 'absolute', right: -2, bottom: -2, background: '#2196f3',
          color: '#fff', borderRadius: '50%', width: 13, height: 13, fontSize: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          ✓
        </Box>
      )}
    </Box>
  );

  // ── Sidebar content extracted for reuse ──────────────────────────────────────
  const SidebarContent = () => (
    <Box sx={{ width: '100%' }}>
      {/* Top Members */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #F0E6DC', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <EmojiEventsIcon sx={{ color: '#F4A261', fontSize: 20 }} />
          <Typography fontWeight={700} fontSize="0.9rem">Top Community Members</Typography>
        </Box>

        {topMembers.map((member, index) => (
          <Box key={member.name}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, py: 1 }}>
              <Typography sx={{ width: 18, fontWeight: 800, color: 'text.secondary', fontSize: 12 }}>
                {index + 1}
              </Typography>
              <LeaderAvatar initials={member.initials} verified={member.verified} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={600} fontSize="0.8rem" noWrap>{member.name}</Typography>
                <Typography variant="caption" color="text.secondary" fontSize="0.68rem">
                  {member.city}
                </Typography>
                {member.badge && (
                  <Typography variant="caption" sx={{
                    display: 'block', color: '#E8650A',
                    fontWeight: 600, fontSize: '0.65rem'
                  }}>
                    {member.badge}
                  </Typography>
                )}
              </Box>
              <Box textAlign="right" sx={{ flexShrink: 0 }}>
                <Typography fontWeight={700} color="primary.main" fontSize={13}>
                  {member.rides}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                  rides
                </Typography>
              </Box>
            </Box>
            {index !== topMembers.length - 1 && <Divider />}
          </Box>
        ))}
      </Paper>

      {/* Recent Activity */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #F0E6DC', mb: 2 }}>
        <Typography fontWeight={700} fontSize="0.9rem" mb={1.5} sx={{mb:2}}>Recent Activity</Typography>
        {activities.map((a, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1.2 }}>
            <Typography fontSize={16}>{a.icon}</Typography>
            <Box>
              <Typography variant="body2" fontSize="0.78rem">{a.text}</Typography>
              <Typography variant="caption" color="text.secondary" fontSize="0.65rem">{a.time}</Typography>
            </Box>
          </Box>
        ))}
      </Paper>

      {/* Invite */}
      <Paper elevation={0} sx={{
        p: 2, borderRadius: 3,
        background: 'linear-gradient(135deg, #E8650A, #FF8C42)', color: '#fff'
      }}>
        <Typography fontWeight={800} mb={0.5} fontSize="0.9rem">Invite a friend 🙏</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1.5, fontSize: '0.78rem' }}>
          Saathi grows through trust. Invite someone from your community to join.
        </Typography>
        <Button size="small" variant="contained"
          sx={{
            background: '#fff', color: '#E8650A', fontWeight: 700,
            '&:hover': { background: '#FFF8F2' }, fontSize: '0.75rem'
          }}>
          Share invite link
        </Button>
      </Paper>
    </Box>
  );

  return (
    <>
      <Box sx={{
        display: "flex",
        gap: 5
      }}>
        <PageLayout>
          {/* Page header */}
          <Typography variant="h5" fontWeight={800} mb={0.5}>
            Saathi <span style={{ color: '#E8650A' }}>Community</span>
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Built on trust, referrals, and shared roots
          </Typography>

          {/* Main layout: feed + sidebar side by side on sm+ */}
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 0, sm: 2, md: 3 },
              alignItems: 'flex-start',
              width: '100%',
              maxWidth: "1200px"
            }}
          >
            {/* ── Left: Post Feed (scrolls with the page, no independent scroll) ── */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0, // prevents flex child from overflowing
                pr: isMobile ? 0.5 : 1,
              }}
            >
              {/* Create post box */}
              <Box
                sx={{
                  p: isMobile ? 1.5 : 2,
                  borderRadius: 3,
                  border: CARD_BORDER,
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', gap: isMobile ? 1 : 1.5, alignItems: 'flex-start' }}>
                  <UserAvatar
                    size={avatarSize}
                    verified
                    currentUser={currentUser}
                  />

                  <TextField
                    fullWidth
                    multiline
                    minRows={1}
                    maxRows={5}
                    value={post}
                    onChange={(e) => setPost(e.target.value)}
                    placeholder="Make a post"
                    variant="outlined"
                    size={isMobile ? 'small' : 'medium'}
                    inputProps={{ style: { fontSize: bodyFontSize } }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        alignItems: 'flex-start',
                        fontSize: { xs: "11px", sm: "13px" }
                      },
                    }}
                  />
                </Box>

                {/* Image preview */}
                {preview && (
                  <Box
                    sx={{
                      mt: 2,
                      position: 'relative',
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: '1px solid #eee',
                    }}
                  >
                    <Box
                      component="img"
                      src={preview}
                      alt="preview"
                      sx={{
                        width: '100%',
                        maxHeight: isMobile ? 200 : 300,
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    <Button
                      size="small"
                      onClick={() => { setMedia(null); setPreview(""); }}
                      sx={{
                        position: 'absolute', top: 8, right: 8,
                        minWidth: 0, bgcolor: '#fff', borderRadius: '50%',
                        width: isMobile ? 28 : 34, height: isMobile ? 28 : 34,
                      }}
                    >
                      <CloseIcon fontSize={iconFontSize} />
                    </Button>
                  </Box>
                )}

                <Divider sx={{ my: 1.5 }} />

                <Stack direction="row" alignItems="center">
                  <Button
                    component="label"
                    startIcon={<PermMediaIcon fontSize={iconFontSize} />}
                    size={isMobile ? 'small' : 'medium'}
                    sx={{ textTransform: 'none', fontSize: btnFontSize }}
                  >
                    Media
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) { setMedia(file); setPreview(URL.createObjectURL(file)); }
                      }}
                    />
                  </Button>

                  <Button
                    variant="contained"
                    disabled={loading || (!post.trim() && !media)}
                    onClick={handleCreatePost}
                    size={isMobile ? 'small' : 'medium'}
                    sx={{
                      borderRadius: 999,
                      textTransform: 'none',
                      bgcolor: '#E8650A',
                      fontSize: btnFontSize,
                      ml: 'auto',
                    }}
                  >
                    {loading ? 'Posting…' : 'Post'}
                  </Button>
                </Stack>
              </Box>

              {/* Posts list */}
              {postLoading ? (
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={isMobile ? 36 : 50} />
                </Box>
              ) : (
                communityPosts?.map((post, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{ borderRadius: 3, border: CARD_BORDER, mb: 2, overflow: 'hidden' }}
                  >
                    <Box sx={{ p: isMobile ? 1.5 : 2 }}>
                      {/* Post header */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 1 : 1.5 }}>
                        <Avatar
                          src={post?.authorId?.profileImage}
                          sx={{
                            width: avatarSize,
                            height: avatarSize,
                            bgcolor: SAFFRON,
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: avatarFontSize,
                            flexShrink: 0,
                          }}
                        >
                          {!currentUser?.profileImage &&
                            `${currentUser?.firstName?.[0] || ''}${currentUser?.lastName?.[0] || ''}`}
                        </Avatar>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography fontWeight={700} fontSize={isMobile ? '0.82rem' : '0.95rem'} noWrap>
                            {post?.authorId?.firstName} {post?.authorId?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontSize={captionSize}>
                            {'tvm'} | {formattedDateTime(post?.createdAt)}
                          </Typography>
                        </Box>

                        <MoreHorizIcon fontSize={iconFontSize} sx={{ color: 'text.secondary', flexShrink: 0 }} />
                      </Box>

                      {/* Post body */}
                      <Typography sx={{ mt: 1.5, fontSize: bodyFontSize, lineHeight: 1.6 }}>
                        {post.description}
                      </Typography>
                    </Box>

                    {/* Post image */}
                    {post.postImage && <CommunityImage src={post.postImage} />}

                    <Divider />

                    {/* Action buttons */}
                    <Stack
                      direction="row"
                      sx={{
                        py: isMobile ? 0.25 : 0.5,
                        px: isMobile ? 0.5 : 2,
                        gap: isMobile ? 0 : 5,
                        justifyContent: isMobile ? 'space-around' : 'flex-start',
                      }}
                    >
                      <Button
                        onClick={() => post.isLiked ? removeLike(post._id) : addLike(post._id)}
                        startIcon={
                          post.isLiked
                            ? <ThumbUpIcon fontSize={iconFontSize} sx={{ color: '#0084ff' }} />
                            : <ThumbUpOffAltIcon fontSize={iconFontSize} />
                        }
                        size={isMobile ? 'small' : 'medium'}
                        sx={{ textTransform: 'none', color: 'text.secondary', fontSize: btnFontSize }}
                      >
                        Like {post?.likes || 0}
                      </Button>

                      <Button
                        startIcon={
                          activeCommentPostId === post._id
                            ? <ChatIcon fontSize={iconFontSize} sx={{ color: '#0084ff' }} />
                            : <ChatIcon fontSize={iconFontSize} />
                        }
                        onClick={() =>
                          setActiveCommentPostId((prev) => prev === post._id ? null : post._id)
                        }
                        size={isMobile ? 'small' : 'medium'}
                        sx={{ textTransform: 'none', color: 'text.secondary', fontSize: btnFontSize }}
                      >
                        Comments
                      </Button>

                      <Button
                        startIcon={<ShareIcon fontSize={iconFontSize} />}
                        size={isMobile ? 'small' : 'medium'}
                        sx={{ textTransform: 'none', color: 'text.secondary', fontSize: btnFontSize }}
                      >
                        Share
                      </Button>
                    </Stack>

                    <Divider />

                    {activeCommentPostId === post._id && (
                      <Box sx={{ margin: isMobile ? 1 : 1.5 }}>
                        <CommunityComments post={post} user={user} />
                      </Box>
                    )}
                  </Paper>
                ))
              )}
            </Box>
          </Box>
        </PageLayout>

        {/* ── Right: Sidebar (visible on sm and up, independent fixed scroll) ── */}
        {showSidebar && (
          <Grid
            sx={{
              mt:12,
              width: { sm: '280px', md: '340px', lg: '380px' },
              minWidth: { sm: '280px', md: '340px', lg: '380px' },
              flexShrink: 0,
              position: 'sticky',
              top: 20,
              height: SIDEBAR_SCROLL_HEIGHT,
              overflowY: 'auto',
              overflowX: 'hidden',
              pr: 1,
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#E0D4C8', borderRadius: 4 },
            }}
          >
            <SidebarContent />
          </Grid>
        )}
      </Box>
    </>


  );
}