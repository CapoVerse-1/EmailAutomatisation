import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { Link as RouterLink } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SendIcon from '@mui/icons-material/Send';

const HomePage: React.FC = () => {
  return (
    <Box>
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Email Marketing Automation
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Create and send personalized marketing emails powered by AI
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          to="/login"
          sx={{ mt: 2 }}
        >
          Get Started
        </Button>
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              <AutoFixHighIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                AI-Powered Content
              </Typography>
              <Typography variant="body1" align="center">
                Our application uses advanced AI to generate personalized marketing emails based on company information.
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              <EmailIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Customizable Templates
              </Typography>
              <Typography variant="body1" align="center">
                Review and edit AI-generated emails before sending to ensure they match your brand voice.
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              <SendIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Direct Gmail Integration
              </Typography>
              <Typography variant="body1" align="center">
                Send emails directly through your Gmail account and track their status in our dashboard.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage; 