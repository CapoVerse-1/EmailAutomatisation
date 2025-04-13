import { google } from 'googleapis';
import authService from './authService';

class GmailService {
  private gmail: any;

  constructor() {
    // Initialize the Gmail API client
    this.initializeClient();
  }

  /**
   * Initialize Gmail API client with OAuth credentials
   */
  private initializeClient(): void {
    try {
      const auth = authService.getOAuth2Client();
      this.gmail = google.gmail({ version: 'v1', auth });
    } catch (error) {
      console.error('Error initializing Gmail client:', error);
    }
  }

  /**
   * Send an email using Gmail API
   */
  async sendEmail(to: string, subject: string, body: string): Promise<any> {
    try {
      // Create the email message in base64 encoded format
      const emailContent = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        body
      ].join('\n');

      const encodedMessage = Buffer.from(emailContent)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Send the email
      const result = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      return result.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Get user email address
   */
  async getUserEmail(): Promise<string> {
    try {
      const profile = await this.gmail.users.getProfile({
        userId: 'me',
      });
      return profile.data.emailAddress;
    } catch (error) {
      console.error('Error getting user email:', error);
      throw error;
    }
  }

  /**
   * Get sent emails
   */
  async getSentEmails(maxResults = 10): Promise<any[]> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        labelIds: ['SENT'],
        maxResults,
      });

      const messages = response.data.messages || [];
      const emails = [];

      for (const message of messages) {
        const email = await this.gmail.users.messages.get({
          userId: 'me',
          id: message.id,
        });
        emails.push(email.data);
      }

      return emails;
    } catch (error) {
      console.error('Error getting sent emails:', error);
      throw error;
    }
  }
}

export default new GmailService(); 