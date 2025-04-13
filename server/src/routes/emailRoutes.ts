import express from 'express';
import { generateEmailContent, sendEmailMessage, getEmailHistory } from '../controllers/emailController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Protect all email routes with authentication
router.use(authenticate);

// Generate email content
router.post('/generate', generateEmailContent);

// Send email
router.post('/send', sendEmailMessage);

// Get email history
router.get('/history', getEmailHistory);

export default router; 