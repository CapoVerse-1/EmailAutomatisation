import { Request, Response } from 'express';
import { generateEmail } from '../services/openaiService';
import { sendEmail } from '../services/gmailService';
import { EmailType } from '../types/emailTypes';
import { v4 as uuidv4 } from 'uuid';
import { emailStorage } from '../services/storageService';

// Generate email content using OpenAI
export const generateEmailContent = async (req: Request, res: Response) => {
  try {
    const { companyName, companyDescription, recipientEmail, emailType } = req.body;

    if (!companyName || !companyDescription || !recipientEmail || !emailType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate email type
    if (!Object.values(EmailType).includes(emailType as EmailType)) {
      return res.status(400).json({ error: 'Invalid email type' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const emailContent = await generateEmail(
      companyName,
      companyDescription,
      emailType as EmailType
    );

    return res.json({ 
      subject: emailContent.subject,
      body: emailContent.body,
      to: recipientEmail
    });
  } catch (error: any) {
    console.error('Error generating email:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate email content' });
  }
};

// Send email using Gmail API
export const sendEmailMessage = async (req: Request, res: Response) => {
  try {
    const { subject, body, to } = req.body;

    if (!subject || !body || !to) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get token from user object
    const accessToken = req.user.accessToken;
    if (!accessToken) {
      return res.status(401).json({ error: 'No access token available' });
    }

    // Send email using Gmail API
    const result = await sendEmail(accessToken, to, subject, body);

    // Store the sent email in our database
    const emailRecord = {
      id: uuidv4(),
      userId,
      to,
      subject,
      body,
      sentAt: new Date().toISOString(),
      messageId: result.messageId
    };
    
    await emailStorage.addEmail(emailRecord);

    return res.json({ success: true, messageId: result.messageId });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: error.message || 'Failed to send email' });
  }
};

// Get user's email history
export const getEmailHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Get emails for the current user
    const emails = emailStorage.getUserEmails(userId);
    
    // Format emails for the frontend
    const formattedEmails = emails.map(email => ({
      id: email.id,
      to: email.to,
      subject: email.subject,
      snippet: email.body.substring(0, 100) + (email.body.length > 100 ? '...' : ''),
      sentAt: email.sentAt
    }));
    
    return res.json(formattedEmails);
  } catch (error: any) {
    console.error('Error fetching email history:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch email history' });
  }
}; 