import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Divider,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuth } from '../contexts/AuthContext';

interface EmailData {
  id: string;
  snippet: string;
  subject?: string;
  to?: string;
  date?: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { getAccessToken, user } = useAuth();
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('You must be logged in');
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/emails/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch email history');
      }
      
      const data = await response.json();
      
      // Process and format the emails
      const processedEmails = data.emails.map((email: any) => {
        // Extract headers
        const headers = email.payload?.headers || [];
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No subject';
        const to = headers.find((h: any) => h.name === 'To')?.value || 'No recipient';
        const date = new Date(parseInt(email.internalDate)).toLocaleString();
        
        return {
          id: email.id,
          snippet: email.snippet || 'No content preview available',
          subject,
          to,
          date,
        };
      });
      
      setEmails(processedEmails);
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError((error as Error).message || 'Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleCreateEmail = () => {
    navigate('/create-email');
  };

  const handleRefresh = () => {
    fetchEmails();
  };

  const handleViewEmail = (id: string) => {
    // This would ideally navigate to a detailed view of the email
    // For now, just log the ID
    console.log('View email:', id);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Email Dashboard
          </Typography>
          <Box>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} disabled={loading} sx={{ mr: 1 }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateEmail}
            >
              Create New Email
            </Button>
          </Box>
        </Box>
        
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Welcome, {user?.name || 'User'}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1">
            From here you can create new marketing emails and view your sent emails.
          </Typography>
        </Paper>
        
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Sent Emails
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : emails.length === 0 ? (
            <Box sx={{ my: 4, textAlign: 'center' }}>
              <Typography variant="body1" gutterBottom>
                No emails sent yet.
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleCreateEmail}
                sx={{ mt: 2 }}
              >
                Create Your First Email
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Subject</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Preview</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {emails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell component="th" scope="row">
                        {email.subject}
                      </TableCell>
                      <TableCell>{email.to}</TableCell>
                      <TableCell>{email.date}</TableCell>
                      <TableCell>
                        <Typography noWrap sx={{ maxWidth: 250 }}>
                          {email.snippet}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleViewEmail(email.id)}
                          aria-label="view"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default DashboardPage; 