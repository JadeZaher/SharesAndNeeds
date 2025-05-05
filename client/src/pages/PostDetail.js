import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Chip,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { getPosts } from '../db';

// Placeholder image for posts without images
const DEFAULT_IMAGE = 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  
  // TODO: Replace with actual auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const posts = await getPosts();
        const foundPost = posts.find(p => p.id === id);
        
        if (foundPost) {
          setPost(foundPost);
        } else {
          setError('Post not found');
        }
      } catch (err) {
        console.error('Error loading post:', err);
        setError('Failed to load post details');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);

  const handleConnect = () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: `/posts/${id}` } });
      return;
    }
    setOpenDialog(true);
  };

  const handleConfirmConnect = () => {
    // TODO: Implement actual connection logic
    setOpenDialog(false);
    navigate('/messages');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          {error || 'Post not found'}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Return to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ mt: 4, overflow: 'hidden' }}>
        {/* Image Section */}
        <Card sx={{ width: '100%', boxShadow: 'none' }}>
          <CardMedia
            component="img"
            height="300"
            image={post.imageUrl || DEFAULT_IMAGE}
            alt={post.title}
            sx={{ objectFit: 'cover' }}
          />
        </Card>

        {/* Content Section */}
        <Box sx={{ p: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" component="h1">
              {post.title}
            </Typography>
            <Chip
              icon={post.type === 'share' ? <ShareIcon /> : <HelpOutlineIcon />}
              label={post.type.toUpperCase()}
              color={post.type === 'share' ? 'primary' : 'secondary'}
            />
          </Box>

          <Box display="flex" gap={2} mb={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon color="action" />
              <Typography variant="body2" color="text.secondary">
                Posted by User
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarTodayIcon color="action" />
              <Typography variant="body2" color="text.secondary">
                {new Date(post.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body1" paragraph>
            {post.description}
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleConnect}
              sx={{ py: 1.5 }}
            >
              Connect with {post.type === 'share' ? 'Sharer' : 'Seeker'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Connect Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="connect-dialog-title"
      >
        <DialogTitle id="connect-dialog-title">
          Connect with {post.type === 'share' ? 'Sharer' : 'Seeker'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            By connecting, you'll be able to message the {post.type === 'share' ? 'sharer' : 'seeker'} directly.
            Please be respectful and follow our community guidelines.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmConnect} variant="contained" autoFocus>
            Connect
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PostDetail;
