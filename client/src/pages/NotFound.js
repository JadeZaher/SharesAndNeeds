import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

function NotFound() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          mt: 8,
          p: 4,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <ErrorOutlineIcon
          sx={{
            fontSize: 80,
            color: 'error.main',
          }}
        />
        
        <Typography variant="h4" component="h1">
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            size="large"
            sx={{
              minWidth: 200,
              py: 1,
            }}
          >
            Return to Home
          </Button>
        </Box>
      </Paper>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          If you believe this is an error, please contact support.
        </Typography>
      </Box>
    </Container>
  );
}

export default NotFound;
