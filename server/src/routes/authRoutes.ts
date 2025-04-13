import express, { Request, Response } from 'express';
import authService from '../services/authService';
import jwt from 'jsonwebtoken';
import { refreshToken } from '../middleware/authMiddleware';

const router = express.Router();

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'email_marketing_secret_key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Route to initiate Google OAuth authentication
 */
router.get('/google', (req: Request, res: Response) => {
  try {
    const authUrl = authService.getAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Google auth:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * Google OAuth callback route
 */
router.get('/google/callback', async (req: Request, res: Response) => {
  const { code } = req.query;
  
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    // Exchange code for tokens
    const tokens = await authService.getToken(code);
    
    // Create a JWT for our app
    const token = jwt.sign(
      { 
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token
      }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // Create a refresh token with longer expiry
    const refreshTokenValue = jwt.sign(
      { 
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Redirect to frontend with the tokens
    res.redirect(`${FRONTEND_URL}/auth-callback?token=${token}&refreshToken=${refreshTokenValue}`);
  } catch (error) {
    console.error('Error in Google callback:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * Verify JWT token route
 */
router.post('/verify', async (req: Request, res: Response) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    // Verify the JWT
    const decoded = jwt.verify(token, JWT_SECRET) as { access_token: string };
    
    // Get user info from Google
    const userInfo = await authService.verifyIdToken(decoded.access_token);
    
    res.json({ 
      authenticated: true,
      user: {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ authenticated: false, error: 'Invalid token' });
  }
});

/**
 * Refresh token route
 */
router.post('/refresh', refreshToken);

export default router; 