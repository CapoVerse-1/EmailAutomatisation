import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import GoogleLogin from '../components/GoogleLogin';

const LoginPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 3 }}>
            Sign in to access the Email Marketing Automation platform
          </Typography>
          <GoogleLogin />
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage; 