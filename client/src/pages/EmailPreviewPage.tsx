import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../contexts/AuthContext';

interface LocationState {
  companyName: string;
  recipientEmail: string;
  companyDescription: string;
  emailType: string;
  generatedContent: string;
}

// Parse subject and body from generated content
const parseEmail = (content: string) => {
  if (!content) return { subject: '', body: '' };
  // Assuming first line is the subject
  const lines = content.split('\n');
  const subject = lines[0].replace('Subject:', '').trim();
  const body = lines.slice(1).join('\n').trim();
  return { subject, body };
};

const EmailPreviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getAccessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [emailData, setEmailData] = useState({ subject: '', body: '' });
  const [isEditing, setIsEditing] = useState(false);
  
  // Get location state with email data
  const state = location.state as LocationState;
  
  // If there's no state, redirect to the form
  useEffect(() => {
    if (!state) {
      navigate('/dashboard');
      return;
    }
    
    const { generatedContent } = state;
    setEmailData(parseEmail(generatedContent));
  }, [state, navigate]);
  
  // If there's no state, return early
  if (!state) {
    return null;
  }
  
  const { recipientEmail } = state;
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };
  
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailData({
      ...emailData,
      subject: e.target.value,
    });
  };
  
  const handleBodyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailData({
      ...emailData,
      body: e.target.value,
    });
  };
  
  const handleSendConfirmation = () => {
    setShowDialog(true);
  };
  
  const handleCloseDialog = () => {
    setShowDialog(false);
  };
  
  const handleSendEmail = async () => {
    setShowDialog(false);
    setLoading(true);
    
    try {
      const token = getAccessToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/emails/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: recipientEmail,
          subject: emailData.subject,
          body: emailData.body,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
      
      // Show success message
      setSnackbarSeverity('success');
      setSnackbarMessage('Email sent successfully!');
      setShowSnackbar(true);
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error sending email:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage('Failed to send email. Please try again.');
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSnackbarClose = () => {
    setShowSnackbar(false);
  };
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Email Preview
          </Typography>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditToggle}
            disabled={loading}
          >
            {isEditing ? 'Done Editing' : 'Edit Email'}
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          To: {recipientEmail}
        </Typography>
        
        {isEditing ? (
          <TextField
            fullWidth
            label="Subject"
            value={emailData.subject}
            onChange={handleSubjectChange}
            margin="normal"
            disabled={loading}
          />
        ) : (
          <Typography variant="subtitle1" gutterBottom>
            Subject: {emailData.subject}
          </Typography>
        )}
        
        <Box sx={{ mt: 3, mb: 3 }}>
          {isEditing ? (
            <TextField
              fullWidth
              label="Email Body"
              value={emailData.body}
              onChange={handleBodyChange}
              multiline
              rows={15}
              disabled={loading}
            />
          ) : (
            <Paper 
              variant="outlined" 
              sx={{ p: 3, maxHeight: '400px', overflow: 'auto' }}
            >
              <div dangerouslySetInnerHTML={{ __html: emailData.body }} />
            </Paper>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/dashboard')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
            onClick={handleSendConfirmation}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Email'}
          </Button>
        </Box>
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={showDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Confirm Email</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to send this email to {recipientEmail}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSendEmail} color="primary" autoFocus>
            Yes, Send It
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success/Error Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EmailPreviewPage; 