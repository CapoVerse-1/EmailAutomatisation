import express, { Request, Response } from 'express';
import openaiService from '../services/openaiService';
import gmailService from '../services/gmailService';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * Generate email content using OpenAI
 */
router.post('/generate', authenticateToken, async (req: Request, res: Response) => {
  const { companyName, companyDescription, emailType } = req.body;

  if (!companyName || !companyDescription) {
    return res.status(400).json({ error: 'Company name and description are required' });
  }

  try {
    const emailContent = await openaiService.generateEmailContent(
      companyName,
      companyDescription,
      emailType || 'marketing'
    );

    res.json({ emailContent });
  } catch (error) {
    console.error('Error generating email:', error);
    res.status(500).json({ error: 'Failed to generate email content' });
  }
});

/**
 * Send email using Gmail API
 */
router.post('/send', authenticateToken, async (req: Request, res: Response) => {
  const { to, subject, body } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Email recipient, subject, and body are required' });
  }

  try {
    const result = await gmailService.sendEmail(to, subject, body);
    res.json({ 
      success: true, 
      messageId: result.id,
      message: 'Email sent successfully' 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

/**
 * Get sent emails
 */
router.get('/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const emails = await gmailService.getSentEmails();
    res.json({ emails });
  } catch (error) {
    console.error('Error fetching email history:', error);
    res.status(500).json({ error: 'Failed to fetch email history' });
  }
});

export default router; 