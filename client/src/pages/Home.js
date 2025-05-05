import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { getPosts, subscribeToAllPosts } from '../db';

// Placeholder image for posts without images
const DEFAULT_IMAGE = 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';

function Home() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'share', or 'need'

  useEffect(() => {
    let subscription;

    const loadPosts = async () => {
      try {
        const initialPosts = await getPosts();
        setPosts(initialPosts);
        setLoading(false);

        // Subscribe to changes
        subscription = subscribeToAllPosts((newPosts) => {
          setPosts(newPosts);
        });
      } catch (err) {
        console.error('Error loading posts:', err);
        setError('Failed to load posts. Please try again later.');
        setLoading(false);
      }
    };

    loadPosts();

    // Cleanup subscription
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const filteredPosts = posts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || post.type === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handlePostClick = (postId) => {
    navigate(`/posts/${postId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Search and Filter Section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={1}>
              <Button
                variant={filter === 'all' ? 'contained' : 'outlined'}
                onClick={() => setFilter('all')}
                startIcon={<FilterListIcon />}
              >
                All
              </Button>
              <Button
                variant={filter === 'share' ? 'contained' : 'outlined'}
                onClick={() => setFilter('share')}
                color="primary"
              >
                Shares
              </Button>
              <Button
                variant={filter === 'need' ? 'contained' : 'outlined'}
                onClick={() => setFilter('need')}
                color="secondary"
              >
                Needs
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Posts Grid */}
      <Grid container spacing={3}>
        {filteredPosts.length === 0 ? (
          <Grid item xs={12}>
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              minHeight="200px"
            >
              <Typography variant="h6" color="textSecondary">
                No posts found. Try adjusting your search or filter.
              </Typography>
            </Box>
          </Grid>
        ) : (
          filteredPosts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    transition: 'all 0.3s ease-in-out',
                  },
                }}
                onClick={() => handlePostClick(post.id)}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={post.imageUrl || DEFAULT_IMAGE}
                  alt={post.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography gutterBottom variant="h6" component="h2" noWrap>
                      {post.title}
                    </Typography>
                    <Chip
                      label={post.type}
                      color={post.type === 'share' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {post.description}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ mt: 2, display: 'block' }}
                  >
                    Posted {new Date(post.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Create Post FAB */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/create')}
          sx={{
            borderRadius: '28px',
            padding: '12px 24px',
            boxShadow: 3,
          }}
        >
          Create Post
        </Button>
      </Box>
    </Container>
  );
}

export default Home;
