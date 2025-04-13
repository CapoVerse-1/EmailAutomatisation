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
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface FormData {
  companyName: string;
  companyDescription: string;
  recipientEmail: string;
  emailType: string;
}

const CompanyFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { getAccessToken } = useAuth();
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
      const token = getAccessToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/emails/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: formData.companyName,
          companyDescription: formData.companyDescription,
          emailType: formData.emailType,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate email');
      }
      
      const data = await response.json();
      
      // Navigate to preview page with the form data and generated content
      navigate('/email-preview', { 
        state: { 
          ...formData, 
          generatedContent: data.emailContent 
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
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Email Campaign
        </Typography>
        
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
          />
          
          <FormControl fullWidth margin="normal" disabled={loading}>
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
          />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
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