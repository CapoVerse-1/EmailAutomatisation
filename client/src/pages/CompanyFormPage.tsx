import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  SelectChangeEvent,
  Divider,
  Alert,
} from '@mui/material';

interface FormData {
  companyName: string;
  companyDescription: string;
  recipientEmail: string;
  emailType: string;
}

// Sample email generation response
const SAMPLE_EMAIL_RESPONSE = `Subject: Introducing Our Innovative Solutions to Enhance Your Business

Dear [Recipient],

I hope this email finds you well. I am reaching out from [Company Name] to introduce our services that I believe could significantly benefit your business operations.

[Company Name] specializes in providing cutting-edge solutions tailored to help businesses like yours streamline processes, increase productivity, and achieve sustainable growth. Our team of experienced professionals works closely with clients to understand their unique needs and develop customized strategies.

Some of our key offerings include:
- Advanced analytics and reporting tools to provide actionable insights
- Integrated workflow solutions to enhance team collaboration
- Scalable infrastructure designed to grow with your business
- Dedicated support and consulting to ensure optimal implementation

I would welcome the opportunity to discuss how [Company Name] can address your specific challenges and contribute to your business success. Would you be available for a brief call next week to explore this further?

Thank you for your time and consideration. I look forward to potentially working with you.

Best regards,
[Your Name]
[Company Name]
[Contact Information]`;

const CompanyFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    companyDescription: '',
    recipientEmail: '',
    emailType: 'marketing',
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    
    if (!formData.companyDescription.trim()) {
      newErrors.companyDescription = 'Company description is required';
    } else if (formData.companyDescription.trim().length < 50) {
      newErrors.companyDescription = 'Description should be at least 50 characters';
    }
    
    if (!formData.recipientEmail.trim()) {
      newErrors.recipientEmail = 'Recipient email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.recipientEmail.trim())) {
      newErrors.recipientEmail = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to preview page with the form data and generated content
      navigate('/email-preview', { 
        state: { 
          ...formData, 
          generatedContent: SAMPLE_EMAIL_RESPONSE.replace(/\[Company Name\]/g, formData.companyName)
        } 
      });
    } catch (error) {
      console.error('Error generating email:', error);
      alert('Failed to generate email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          Create Email Campaign
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="body1" paragraph>
          Fill in the details below to generate a personalized marketing email.
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 4 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="companyName"
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={handleTextFieldChange}
            error={!!errors.companyName}
            helperText={errors.companyName}
            disabled={loading}
            sx={{ mb: 3 }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="recipientEmail"
            label="Recipient Email"
            name="recipientEmail"
            type="email"
            value={formData.recipientEmail}
            onChange={handleTextFieldChange}
            error={!!errors.recipientEmail}
            helperText={errors.recipientEmail}
            disabled={loading}
            sx={{ mb: 3 }}
          />
          
          <FormControl fullWidth margin="normal" disabled={loading} sx={{ mb: 3 }}>
            <InputLabel id="email-type-label">Email Type</InputLabel>
            <Select
              labelId="email-type-label"
              id="emailType"
              name="emailType"
              value={formData.emailType}
              label="Email Type"
              onChange={handleSelectChange}
            >
              <MenuItem value="marketing">Marketing Email</MenuItem>
              <MenuItem value="follow-up">Follow-up Email</MenuItem>
              <MenuItem value="introduction">Introduction Email</MenuItem>
            </Select>
            <FormHelperText>Select the type of email you want to generate</FormHelperText>
          </FormControl>
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="companyDescription"
            label="Company Description"
            name="companyDescription"
            multiline
            rows={6}
            value={formData.companyDescription}
            onChange={handleTextFieldChange}
            error={!!errors.companyDescription}
            helperText={errors.companyDescription || "Provide a detailed description of your company, products/services, and what makes you unique."}
            disabled={loading}
            sx={{ mb: 4 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              size="large"
              disabled={loading}
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : null}
            >
              {loading ? 'Generating...' : 'Generate Email'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CompanyFormPage; 