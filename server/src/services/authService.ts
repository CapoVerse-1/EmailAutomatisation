import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

class AuthService {
  private oAuth2Client: OAuth2Client;

  constructor() {
    this.oAuth2Client = new OAuth2Client(
      CLIENT_ID,
      CLIENT_SECRET,
      'http://localhost:3001/api/auth/google/callback'
    );
  }

  /**
   * Get the Google authentication URL
   */
  getAuthUrl(): string {
    return this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });
  }

  /**
   * Get token from Google OAuth code
   */
  async getToken(code: string): Promise<any> {
    const { tokens } = await this.oAuth2Client.getToken(code);
    this.oAuth2Client.setCredentials(tokens);
    await this.saveToken(tokens);
    return tokens;
  }

  /**
   * Save token to disk
   */
  private async saveToken(token: any): Promise<void> {
    try {
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log(`Token stored to ${TOKEN_PATH}`);
    } catch (err) {
      console.error('Failed to save token:', err);
      throw err;
    }
  }

  /**
   * Load saved token from disk
   */
  loadSavedToken(): boolean {
    try {
      if (fs.existsSync(TOKEN_PATH)) {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
        this.oAuth2Client.setCredentials(token);
        return true;
      }
    } catch (err) {
      console.error('Failed to load token:', err);
    }
    return false;
  }

  /**
   * Get OAuth2Client instance with credentials
   */
  getOAuth2Client(): OAuth2Client {
    return this.oAuth2Client;
  }

  /**
   * Verify an ID token
   */
  async verifyIdToken(idToken: string): Promise<any> {
    try {
      const ticket = await this.oAuth2Client.verifyIdToken({
        idToken,
        audience: CLIENT_ID
      });
      const payload = ticket.getPayload();
      return payload;
    } catch (error) {
      console.error('Error verifying ID token:', error);
      throw error;
    }
  }
}

export default new AuthService(); 