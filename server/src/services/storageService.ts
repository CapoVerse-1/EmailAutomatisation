import fs from 'fs';
import path from 'path';

// Define the storage paths
const DATA_DIR = path.join(process.cwd(), 'data');
const EMAILS_FILE = path.join(DATA_DIR, 'emails.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Define data types
export interface EmailRecord {
  id: string;
  to: string;
  subject: string;
  body: string;
  userId: string;
  sentAt: string;
  messageId?: string;
}

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp
}

// Initialize the data directory and files if they don't exist
const initStorage = () => {
  // Create data directory if it doesn't exist
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Create emails file if it doesn't exist
  if (!fs.existsSync(EMAILS_FILE)) {
    fs.writeFileSync(EMAILS_FILE, JSON.stringify([]));
  }

  // Create sessions file if it doesn't exist
  if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify([]));
  }
};

// Initialize storage on module load
initStorage();

/**
 * Email storage functions
 */
export const emailStorage = {
  // Get all emails
  getEmails: (): EmailRecord[] => {
    try {
      const data = fs.readFileSync(EMAILS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading emails file:', error);
      return [];
    }
  },

  // Get emails for a specific user
  getUserEmails: (userId: string): EmailRecord[] => {
    try {
      const emails = emailStorage.getEmails();
      return emails.filter(email => email.userId === userId);
    } catch (error) {
      console.error('Error getting user emails:', error);
      return [];
    }
  },

  // Add a new email
  addEmail: (email: EmailRecord): EmailRecord => {
    try {
      const emails = emailStorage.getEmails();
      emails.push(email);
      fs.writeFileSync(EMAILS_FILE, JSON.stringify(emails, null, 2));
      return email;
    } catch (error) {
      console.error('Error adding email:', error);
      throw error;
    }
  },

  // Get email by ID
  getEmailById: (id: string): EmailRecord | null => {
    try {
      const emails = emailStorage.getEmails();
      return emails.find(email => email.id === id) || null;
    } catch (error) {
      console.error('Error getting email by ID:', error);
      return null;
    }
  },
};

/**
 * Session storage functions
 */
export const sessionStorage = {
  // Get all sessions
  getSessions: (): UserSession[] => {
    try {
      const data = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading sessions file:', error);
      return [];
    }
  },

  // Get session by user ID
  getUserSession: (userId: string): UserSession | null => {
    try {
      const sessions = sessionStorage.getSessions();
      return sessions.find(session => session.userId === userId) || null;
    } catch (error) {
      console.error('Error getting user session:', error);
      return null;
    }
  },

  // Add or update a session
  saveSession: (session: UserSession): UserSession => {
    try {
      const sessions = sessionStorage.getSessions();
      const existingIndex = sessions.findIndex(s => s.userId === session.userId);
      
      if (existingIndex >= 0) {
        // Update existing session
        sessions[existingIndex] = session;
      } else {
        // Add new session
        sessions.push(session);
      }
      
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
      return session;
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  },

  // Remove a session
  removeSession: (userId: string): boolean => {
    try {
      const sessions = sessionStorage.getSessions();
      const filteredSessions = sessions.filter(session => session.userId !== userId);
      
      if (sessions.length === filteredSessions.length) {
        return false; // No session was removed
      }
      
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(filteredSessions, null, 2));
      return true;
    } catch (error) {
      console.error('Error removing session:', error);
      return false;
    }
  },

  // Clean expired sessions
  cleanExpiredSessions: (): number => {
    try {
      const sessions = sessionStorage.getSessions();
      const now = Math.floor(Date.now() / 1000);
      const validSessions = sessions.filter(session => session.expiresAt > now);
      
      const removedCount = sessions.length - validSessions.length;
      
      if (removedCount > 0) {
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(validSessions, null, 2));
      }
      
      return removedCount;
    } catch (error) {
      console.error('Error cleaning expired sessions:', error);
      return 0;
    }
  },
};

export default {
  emailStorage,
  sessionStorage,
}; 