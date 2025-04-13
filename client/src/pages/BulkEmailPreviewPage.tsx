import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardActions,
  TextField,
  Pagination,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ReplayIcon from '@mui/icons-material/Replay';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';

interface CompanyData {
  companyName: string;
  recipientEmail: string;
  recipientName?: string;
  companyDescription: string;
  emailType: string;
  generatedContent: string;
}

interface ProcessedCompany extends CompanyData {
  subject: string;
  body: string;
  isEditing: boolean;
  isSending: boolean;
  isSent: boolean;
  isRejected: boolean;
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

const BulkEmailPreviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<ProcessedCompany | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sendAllLoading, setSendAllLoading] = useState(false);
  
  // Initialize processed companies with parsed emails
  const [processedCompanies, setProcessedCompanies] = useState<ProcessedCompany[]>([]);
  
  // If there's no state, redirect to the form
  useEffect(() => {
    const stateData = location.state as { companies: CompanyData[] } | null;
    
    if (!stateData || !stateData.companies || stateData.companies.length === 0) {
      navigate('/bulk-email');
      return;
    }
    
    // Process companies
    const initialProcessed = stateData.companies.map(company => {
      const { subject, body } = parseEmail(company.generatedContent);
      return {
        ...company,
        subject,
        body,
        isEditing: false,
        isSending: false,
        isSent: false,
        isRejected: false
      };
    });
    
    setProcessedCompanies(initialProcessed);
  }, [location.state, navigate]);
  
  // Filter and paginate emails
  const filteredEmails = processedCompanies.filter(company => {
    // Apply status filter
    if (filter === 'pending' && (company.isSent || company.isRejected)) return false;
    if (filter === 'sent' && !company.isSent) return false;
    if (filter === 'rejected' && !company.isRejected) return false;
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        company.companyName.toLowerCase().includes(term) ||
        company.recipientEmail.toLowerCase().includes(term) ||
        company.subject.toLowerCase().includes(term)
      );
    }
    
    return true;
  });
  
  // Pagination
  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);
  const currentEmails = filteredEmails.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  const handleFilterChange = (event: React.SyntheticEvent, newValue: 'all' | 'pending' | 'sent' | 'rejected') => {
    setFilter(newValue);
    setPage(1); // Reset to first page when filter changes
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when search changes
  };
  
  const handleEditToggle = (index: number) => {
    const newProcessedCompanies = [...processedCompanies];
    newProcessedCompanies[index].isEditing = !newProcessedCompanies[index].isEditing;
    setProcessedCompanies(newProcessedCompanies);
  };
  
  const handleSubjectChange = (index: number, value: string) => {
    const newProcessedCompanies = [...processedCompanies];
    newProcessedCompanies[index].subject = value;
    setProcessedCompanies(newProcessedCompanies);
  };
  
  const handleBodyChange = (index: number, value: string) => {
    const newProcessedCompanies = [...processedCompanies];
    newProcessedCompanies[index].body = value;
    setProcessedCompanies(newProcessedCompanies);
  };
  
  const handleSendConfirmation = (company: ProcessedCompany) => {
    setCurrentEmail(company);
    setShowDialog(true);
  };
  
  const handleCloseDialog = () => {
    setShowDialog(false);
    setCurrentEmail(null);
  };
  
  const handleSendEmail = async () => {
    if (!currentEmail) return;
    
    setShowDialog(false);
    
    // Find index of current email
    const index = processedCompanies.findIndex(c => c.recipientEmail === currentEmail.recipientEmail);
    if (index === -1) return;
    
    // Update state to show sending
    const newProcessedCompanies = [...processedCompanies];
    newProcessedCompanies[index].isSending = true;
    setProcessedCompanies(newProcessedCompanies);
    
    try {
      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update state to show sent
      const updatedCompanies = [...newProcessedCompanies];
      updatedCompanies[index].isSending = false;
      updatedCompanies[index].isSent = true;
      setProcessedCompanies(updatedCompanies);
      
      // Show success message
      setSnackbarSeverity('success');
      setSnackbarMessage(`Email to ${currentEmail.companyName} sent successfully!`);
      setShowSnackbar(true);
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Update state to show error
      const updatedCompanies = [...newProcessedCompanies];
      updatedCompanies[index].isSending = false;
      setProcessedCompanies(updatedCompanies);
      
      // Show error message
      setSnackbarSeverity('error');
      setSnackbarMessage(`Failed to send email to ${currentEmail.companyName}. Please try again.`);
      setShowSnackbar(true);
    }
  };
  
  const handleSendAll = async () => {
    setSendAllLoading(true);
    setSnackbarSeverity('info');
    setSnackbarMessage('Processing all emails. This may take a moment...');
    setShowSnackbar(true);
    
    try {
      // Get all pending emails
      const pendingEmails = processedCompanies.filter(
        company => !company.isSent && !company.isRejected && !company.isSending
      );
      
      if (pendingEmails.length === 0) {
        setSnackbarSeverity('warning');
        setSnackbarMessage('No pending emails to send');
        setShowSnackbar(true);
        setSendAllLoading(false);
        return;
      }
      
      // Mark all as sending
      const newProcessedCompanies = [...processedCompanies];
      pendingEmails.forEach(email => {
        const index = processedCompanies.findIndex(c => c.recipientEmail === email.recipientEmail);
        if (index !== -1) {
          newProcessedCompanies[index].isSending = true;
        }
      });
      setProcessedCompanies(newProcessedCompanies);
      
      // Simulate sending emails in sequence with slight delays
      for (let i = 0; i < pendingEmails.length; i++) {
        const email = pendingEmails[i];
        const index = processedCompanies.findIndex(c => c.recipientEmail === email.recipientEmail);
        
        if (index !== -1) {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Update status
          const updatedCompanies = [...newProcessedCompanies];
          updatedCompanies[index].isSending = false;
          updatedCompanies[index].isSent = true;
          setProcessedCompanies(updatedCompanies);
        }
      }
      
      // Show success message
      setSnackbarSeverity('success');
      setSnackbarMessage(`Successfully sent ${pendingEmails.length} emails`);
      setShowSnackbar(true);
    } catch (error) {
      console.error('Error sending emails:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage('Failed to send all emails. Please try again.');
      setShowSnackbar(true);
    } finally {
      setSendAllLoading(false);
    }
  };
  
  const handleRejectEmail = (index: number) => {
    const newProcessedCompanies = [...processedCompanies];
    newProcessedCompanies[index].isRejected = true;
    setProcessedCompanies(newProcessedCompanies);
    
    setSnackbarSeverity('info');
    setSnackbarMessage(`Email to ${newProcessedCompanies[index].companyName} marked as rejected`);
    setShowSnackbar(true);
  };
  
  const handleUnrejectEmail = (index: number) => {
    const newProcessedCompanies = [...processedCompanies];
    newProcessedCompanies[index].isRejected = false;
    setProcessedCompanies(newProcessedCompanies);
  };
  
  const handleSnackbarClose = () => {
    setShowSnackbar(false);
  };
  
  // Calculate statistics for companies
  const stats = {
    total: processedCompanies.length,
    sent: processedCompanies.filter(c => c.isSent).length,
    pending: processedCompanies.filter(c => !c.isSent && !c.isRejected).length,
    rejected: processedCompanies.filter(c => c.isRejected).length,
  };
  
  if (processedCompanies.length === 0) {
    return (
      <Container maxWidth="md">
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mt: 4, 
            borderRadius: 2, 
            border: '1px solid', 
            borderColor: 'divider',
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" gutterBottom>
            Loading...
          </Typography>
          <CircularProgress sx={{ mt: 2 }} />
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mt: 4, 
          mb: 2,
          borderRadius: 2, 
          border: '1px solid', 
          borderColor: 'divider' 
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Bulk Email Preview
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={sendAllLoading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
            onClick={handleSendAll}
            disabled={sendAllLoading || stats.pending === 0}
          >
            {sendAllLoading ? 'Sending...' : `Send All (${stats.pending})`}
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Stats and filters */}
        <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' } }}>
          <Box sx={{ display: 'flex', gap: 2, mb: { xs: 2, md: 0 } }}>
            <Chip 
              label={`Total: ${stats.total}`} 
              color="default" 
              variant="outlined"
            />
            <Chip 
              label={`Pending: ${stats.pending}`} 
              color="primary" 
              variant="outlined"
            />
            <Chip 
              label={`Sent: ${stats.sent}`} 
              color="success" 
              variant="outlined"
            />
            <Chip 
              label={`Rejected: ${stats.rejected}`} 
              color="error" 
              variant="outlined"
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search companies..."
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ mr: 2, width: '220px' }}
            />
            
            <Tabs 
              value={filter} 
              onChange={handleFilterChange} 
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="All" value="all" />
              <Tab label="Pending" value="pending" />
              <Tab label="Sent" value="sent" />
              <Tab label="Rejected" value="rejected" />
            </Tabs>
          </Box>
        </Box>
        
        {/* Email list */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {currentEmails.map((company, index) => {
            const originalIndex = processedCompanies.findIndex(c => c.recipientEmail === company.recipientEmail);
            
            return (
              <Box key={company.recipientEmail} sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: '100%', 
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid',
                    borderColor: company.isSent 
                      ? 'success.light' 
                      : company.isRejected 
                      ? 'error.light' 
                      : 'divider',
                    position: 'relative',
                  }}
                >
                  {company.isSent && (
                    <Chip 
                      icon={<CheckCircleIcon />} 
                      label="Sent" 
                      color="success" 
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10,
                      }}
                    />
                  )}
                  
                  {company.isRejected && (
                    <Chip 
                      icon={<CloseIcon />} 
                      label="Rejected" 
                      color="error" 
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10,
                      }}
                    />
                  )}
                  
                  <CardContent sx={{ flexGrow: 1, pt: company.isSent || company.isRejected ? 5 : 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {company.companyName}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      To: {company.recipientName ? `${company.recipientName} <${company.recipientEmail}>` : company.recipientEmail}
                    </Typography>
                    
                    {company.isEditing ? (
                      <TextField
                        fullWidth
                        label="Subject"
                        value={company.subject}
                        onChange={(e) => handleSubjectChange(originalIndex, e.target.value)}
                        margin="normal"
                        size="small"
                        disabled={company.isSending}
                      />
                    ) : (
                      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 500 }}>
                        Subject: {company.subject}
                      </Typography>
                    )}
                    
                    {company.isEditing ? (
                      <TextField
                        fullWidth
                        label="Email Body"
                        value={company.body}
                        onChange={(e) => handleBodyChange(originalIndex, e.target.value)}
                        multiline
                        rows={8}
                        margin="normal"
                        disabled={company.isSending}
                      />
                    ) : (
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          mt: 2, 
                          height: '150px', 
                          overflow: 'auto',
                          whiteSpace: 'pre-wrap',
                          fontSize: '0.875rem'
                        }}
                      >
                        {company.body.substring(0, 300)}
                        {company.body.length > 300 && '...'}
                      </Paper>
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Box>
                      {!company.isSent && !company.isRejected && (
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditToggle(originalIndex)}
                          disabled={company.isSending}
                        >
                          {company.isEditing ? 'Done' : 'Edit'}
                        </Button>
                      )}
                      
                      {company.isRejected && (
                        <Button
                          size="small"
                          startIcon={<ReplayIcon />}
                          onClick={() => handleUnrejectEmail(originalIndex)}
                        >
                          Restore
                        </Button>
                      )}
                    </Box>
                    
                    <Box>
                      {!company.isSent && !company.isRejected && (
                        <>
                          <Tooltip title="Reject this email">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleRejectEmail(originalIndex)}
                              disabled={company.isSending}
                              sx={{ mr: 1 }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={company.isSending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                            onClick={() => handleSendConfirmation(company)}
                            disabled={company.isSending}
                          >
                            {company.isSending ? 'Sending...' : 'Send'}
                          </Button>
                        </>
                      )}
                    </Box>
                  </CardActions>
                </Card>
              </Box>
            );
          })}
        </Box>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
            />
          </Box>
        )}
        
        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/bulk-email')}
          >
            Back to Import
          </Button>
          
          <Button 
            variant="outlined" 
            color="inherit" 
            onClick={() => navigate('/')}
          >
            Go to Dashboard
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
            Are you sure you want to send this email to {currentEmail?.companyName} ({currentEmail?.recipientEmail})?
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

export default BulkEmailPreviewPage; 