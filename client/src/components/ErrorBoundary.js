import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // You could also log the error to an error reporting service here
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          padding={3}
          textAlign="center"
        >
          <Typography variant="h4" component="h1" gutterBottom color="error">
            Oops! Something went wrong.
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            We apologize for the inconvenience. Please try refreshing the page or return to the homepage.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleReset}
            sx={{ mt: 2 }}
          >
            Return to Homepage
          </Button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box mt={4} textAlign="left" width="100%" maxWidth={800}>
              <Typography variant="h6" color="error" gutterBottom>
                Error Details:
              </Typography>
              <pre style={{ 
                overflow: 'auto', 
                padding: '1rem', 
                backgroundColor: '#f5f5f5',
                borderRadius: '4px'
              }}>
                {this.state.error.toString()}
                {'\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}
