import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navbar from './components/Navbar';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const CreatePost = React.lazy(() => import('./pages/CreatePost'));
const PostDetail = React.lazy(() => import('./pages/PostDetail'));
const Login = React.lazy(() => import('./pages/Login'));
const Messages = React.lazy(() => import('./pages/Messages'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <React.Suspense fallback={
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh' 
          }}>
            Loading...
          </Box>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </React.Suspense>
      </Container>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
            © {new Date().getFullYear()} Shared & Needs. All rights reserved.
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
