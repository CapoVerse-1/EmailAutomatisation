import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

declare global {
  interface Window {
    google?: any;
  }
}

const GoogleLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // This will be replaced with actual implementation
    const initializeGoogleAuth = () => {
      console.log('Google Auth initialized');
    };

    initializeGoogleAuth();
  }, []);

  const handleGoogleLogin = () => {
    setLoading(true);
    // This is a placeholder for the actual Google login implementation
    setTimeout(() => {
      console.log('Google login clicked');
      setLoading(false);
    }, 1000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Sign in with Google to continue
      </Typography>
      <Button
        variant="contained"
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
        onClick={handleGoogleLogin}
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </Button>
    </Box>
  );
};

export default GoogleLogin; 