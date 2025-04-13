import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = () => {
      try {
        // Get token and refresh token from URL params
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');

        if (!token) {
          setError('Authentication failed. No token received.');
          return;
        }

        // Store tokens in local storage
        localStorage.setItem('accessToken', token);
        
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        // Redirect to dashboard or home
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('Error during authentication callback:', error);
        setError('Authentication failed. Please try again.');
      }
    };

    handleCallback();
  }, [location, navigate]);

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Typography variant="body1">
          Please try logging in again.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Completing authentication...
      </Typography>
    </Box>
  );
};

export default AuthCallbackPage; 