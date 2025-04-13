import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Divider,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  Step,
  Stepper,
  StepLabel,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ArticleIcon from '@mui/icons-material/Article';
import { styled } from '@mui/material/styles';
import * as XLSX from 'xlsx';

// Sample email generation for each company
const generateEmail = (company: CompanyData) => {
  return `Subject: Introducing Our Solutions to ${company.companyName}

Dear ${company.recipientName || 'Team'},

I hope this email finds you well. I am reaching out from Our Company to introduce our services that I believe could significantly benefit ${company.companyName}.

Based on our research about your business: ${company.companyDescription}

Our solutions can help address these specific needs and provide the following benefits:
- Improved efficiency and productivity
- Cost reduction and ROI
- Enhanced customer experience

Would you be available for a brief call next week to discuss how we can help ${company.companyName} achieve its goals?

Thank you for your time and consideration.

Best regards,
Your Name
Your Contact Information`;
};

// Interface for company data from Excel
interface CompanyData {
  companyName: string;
  recipientEmail: string;
  recipientName?: string;
  companyDescription: string;
  emailType: string;
}

const Input = styled('input')({
  display: 'none',
});

const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(6),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'border-color 0.2s ease-in-out',
  backgroundColor: theme.palette.background.default,
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

const BulkEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateExcelData = (data: any[]): CompanyData[] => {
    // Check if required fields are present
    const requiredFields = ['companyName', 'recipientEmail', 'companyDescription', 'emailType'];
    const validData: CompanyData[] = [];
    
    let hasErrors = false;
    data.forEach((row, index) => {
      // Skip empty rows
      if (!row.companyName && !row.recipientEmail) return;
      
      const missingFields = requiredFields.filter(field => !row[field]);
      if (missingFields.length > 0) {
        setError(`Row ${index + 2}: Missing required fields: ${missingFields.join(', ')}`);
        hasErrors = true;
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.recipientEmail)) {
        setError(`Row ${index + 2}: Invalid email format: ${row.recipientEmail}`);
        hasErrors = true;
        return;
      }
      
      // Validate email type
      const validEmailTypes = ['marketing', 'follow-up', 'introduction'];
      if (!validEmailTypes.includes(row.emailType)) {
        row.emailType = 'marketing'; // Default to marketing if invalid
      }
      
      validData.push(row as CompanyData);
    });
    
    if (hasErrors) return [];
    return validData;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    // Check file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
      setError('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }
    
    setLoading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error('Failed to read file');
        
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          setError('The Excel file is empty or has no valid data');
          setLoading(false);
          return;
        }
        
        const validatedData = validateExcelData(jsonData);
        if (validatedData.length === 0) {
          setLoading(false);
          return; // Error already set in validateExcelData
        }
        
        setCompanies(validatedData);
        setActiveStep(1);
        setLoading(false);
      } catch (err) {
        console.error('Error parsing Excel file:', err);
        setError('Failed to parse the Excel file. Please check the format.');
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading the file');
      setLoading(false);
    };
    
    reader.readAsBinaryString(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setError(null);
    
    const files = event.dataTransfer.files;
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Check file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
      setError('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }
    
    // Trigger file input change
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      
      // Manually trigger onChange since React doesn't detect the files change
      const event = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    }
  };

  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleGenerateEmails = async () => {
    setLoading(true);
    
    try {
      // Process each company and generate an email for each
      const processedCompanies = companies.map(company => ({
        ...company,
        generatedContent: generateEmail(company)
      }));
      
      // For a real implementation, you would call your AI service here
      // In this demo, we'll just wait a bit to simulate API processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to the preview page with all generated emails
      navigate('/bulk-email-preview', { state: { companies: processedCompanies } });
    } catch (error) {
      console.error('Error generating emails:', error);
      setError('Failed to generate emails. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create template data for Excel file
    const templateData = [
      {
        companyName: 'Acme Inc.',
        recipientEmail: 'contact@acmeinc.com',
        recipientName: 'John Smith', // Optional
        companyDescription: 'Acme Inc. is a leading provider of innovative software solutions for small businesses.',
        emailType: 'marketing' // marketing, follow-up, or introduction
      },
      {
        companyName: 'TechWorld Corp',
        recipientEmail: 'info@techworld.com',
        recipientName: 'Sarah Johnson', // Optional
        companyDescription: 'TechWorld specializes in enterprise IT infrastructure and cloud computing services.',
        emailType: 'introduction'
      }
    ];
    
    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    
    // Write to file and trigger download
    XLSX.writeFile(workbook, 'email_campaign_template.xlsx');
  };

  const steps = ['Upload Excel File', 'Review Data', 'Generate Emails'];

  return (
    <Container maxWidth="md">
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mt: 4,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Bulk Email Campaign
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === 0 && (
          <>
            <Typography variant="body1" paragraph>
              Upload an Excel file with company information to generate personalized emails for multiple recipients at once.
            </Typography>
            
            <Box sx={{ mt: 3, mb: 4 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <AlertTitle>Excel File Format</AlertTitle>
                Your Excel file should include the following columns:
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="companyName - Name of the company (required)" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="recipientEmail - Email address of the recipient (required)" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="recipientName - Name of the recipient (optional)" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="companyDescription - Description of the company's business (required)" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="emailType - Type of email: marketing, follow-up, or introduction (required)" />
                  </ListItem>
                </List>
                <Box sx={{ mt: 1 }}>
                  <Link 
                    component="button"
                    variant="body2"
                    onClick={handleDownloadTemplate}
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <InsertDriveFileIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Download Excel Template
                  </Link>
                </Box>
              </Alert>
            </Box>
            
            <Input
              accept=".xlsx, .xls"
              id="excel-file-upload"
              type="file"
              onChange={handleFileUpload}
              ref={fileInputRef}
            />
            <UploadBox
              onClick={handleClickUpload}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <CloudUploadIcon fontSize="large" color="primary" sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Drop Excel File Here or Click to Upload
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supports .xlsx and .xls files
              </Typography>
            </UploadBox>
            
            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}
          </>
        )}
        
        {activeStep === 1 && (
          <>
            <Typography variant="h5" gutterBottom>
              Review Company Data
            </Typography>
            
            <Typography variant="body1" paragraph>
              Found {companies.length} companies in your Excel file. Review the data before generating emails.
            </Typography>
            
            <Paper 
              variant="outlined" 
              sx={{ 
                mt: 3, 
                mb: 3,
                maxHeight: '350px',
                overflow: 'auto',
                p: 2
              }}
            >
              {companies.map((company, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    mb: 2, 
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {company.companyName}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
                    <Box sx={{ mr: 4, mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Recipient
                      </Typography>
                      <Typography variant="body2">
                        {company.recipientName || 'Not specified'} ({company.recipientEmail})
                      </Typography>
                    </Box>
                    <Box sx={{ mr: 4, mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Email Type
                      </Typography>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {company.emailType}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Company Description
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {company.companyDescription.length > 100
                        ? `${company.companyDescription.substring(0, 100)}...`
                        : company.companyDescription}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Paper>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setActiveStep(0);
                  setCompanies([]);
                }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                disabled={loading || companies.length === 0}
                onClick={handleGenerateEmails}
                startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <ArticleIcon />}
              >
                {loading ? 'Generating...' : 'Generate Emails'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default BulkEmailPage; 