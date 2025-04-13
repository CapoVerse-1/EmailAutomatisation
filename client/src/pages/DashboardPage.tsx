import React, { useState } from 'react';
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
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import PeopleIcon from '@mui/icons-material/People';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import DescriptionIcon from '@mui/icons-material/Description';

// Dummy email data for display
const dummyEmails = [
  {
    id: '1',
    subject: 'Introduction to Our Services',
    to: 'client@example.com',
    date: '2025-04-12T10:30:00',
    snippet: 'Hello, I wanted to introduce our company and the services we offer that might benefit your business...'
  },
  {
    id: '2',
    subject: 'Follow Up: Product Demo',
    to: 'prospect@company.com',
    date: '2025-04-10T14:45:00',
    snippet: 'I hope you enjoyed our product demonstration yesterday. I wanted to follow up with some additional information...'
  },
  {
    id: '3',
    subject: 'Special Offer for Existing Customers',
    to: 'customer@business.org',
    date: '2025-04-05T09:15:00',
    snippet: 'As a valued customer, we\'re pleased to offer you exclusive early access to our newest feature...'
  }
];

// Stats cards data
const statCards = [
  { 
    title: 'Emails Sent', 
    value: '12', 
    icon: <EmailIcon fontSize="large" color="primary" />,
    description: 'Total emails sent this month' 
  },
  { 
    title: 'Recipients', 
    value: '8', 
    icon: <PeopleIcon fontSize="large" color="primary" />,
    description: 'Unique recipients reached' 
  },
  { 
    title: 'Open Rate', 
    value: '75%', 
    icon: <ShowChartIcon fontSize="large" color="primary" />,
    description: 'Average email open rate' 
  }
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [emails] = useState(dummyEmails);

  const handleCreateEmail = () => {
    navigate('/create-email');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Email Marketing Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateEmail}
              size="large"
            >
              Create New Email
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EmailIcon />}
              onClick={() => navigate('/bulk-email')}
              size="large"
            >
              Bulk Email
            </Button>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          {statCards.map((card, index) => (
            <Card 
              key={index} 
              elevation={0} 
              sx={{ 
                flex: { xs: '1 1 100%', md: '1 1 30%' }, 
                borderRadius: 2, 
                border: '1px solid', 
                borderColor: 'divider' 
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ mr: 2 }}>
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {card.value}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {card.title}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
        
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Recent Emails
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          {emails.length === 0 ? (
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
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Subject</TableCell>
                    <TableCell>Recipient</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Preview</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {emails.map((email) => (
                    <TableRow key={email.id} hover>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                        {email.subject}
                      </TableCell>
                      <TableCell>{email.to}</TableCell>
                      <TableCell>{formatDate(email.date)}</TableCell>
                      <TableCell>
                        <Typography noWrap sx={{ maxWidth: 250, opacity: 0.8 }}>
                          {email.snippet}
                        </Typography>
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