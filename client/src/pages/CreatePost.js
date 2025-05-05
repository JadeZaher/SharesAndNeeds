import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
  FormHelperText,
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { createPost } from '../db';

function CreatePost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'share',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (_, newType) => {
    if (newType !== null) {
      setFormData(prev => ({
        ...prev,
        type: newType
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      errors.imageUrl = 'Please enter a valid URL';
    }
    return errors;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setTouched({
        title: true,
        description: true,
        imageUrl: true
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual user ID from auth context
      const userId = 'temp-user-id';
      
      await createPost({
        ...formData,
        userId,
      });

      navigate('/');
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
      setLoading(false);
    }
  };

  const errors = validateForm();
  const getFieldError = (field) => touched[field] && errors[field];

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create a New Post
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <ToggleButtonGroup
              value={formData.type}
              exclusive
              onChange={handleTypeChange}
              aria-label="post type"
              fullWidth
            >
              <ToggleButton 
                value="share" 
                aria-label="share"
                sx={{
                  py: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              >
                <ShareIcon sx={{ mr: 1 }} />
                I want to Share
              </ToggleButton>
              <ToggleButton 
                value="need" 
                aria-label="need"
                sx={{
                  py: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'secondary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'secondary.dark',
                    },
                  },
                }}
              >
                <HelpOutlineIcon sx={{ mr: 1 }} />
                I have a Need
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            onBlur={() => handleBlur('title')}
            error={!!getFieldError('title')}
            helperText={getFieldError('title')}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            onBlur={() => handleBlur('description')}
            error={!!getFieldError('description')}
            helperText={getFieldError('description')}
            margin="normal"
            required
            multiline
            rows={4}
          />

          <TextField
            fullWidth
            label="Image URL (optional)"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            onBlur={() => handleBlur('imageUrl')}
            error={!!getFieldError('imageUrl')}
            helperText={getFieldError('imageUrl') || 'Add an image URL to make your post more visible'}
            margin="normal"
          />

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || Object.keys(errors).length > 0}
              sx={{ flex: 1 }}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                `Create ${formData.type === 'share' ? 'Share' : 'Need'} Post`
              )}
            </Button>
          </Box>
        </form>

        <Box sx={{ mt: 3 }}>
          <FormHelperText>
            * Please ensure your post follows our community guidelines
          </FormHelperText>
        </Box>
      </Paper>
    </Container>
  );
}

export default CreatePost;
