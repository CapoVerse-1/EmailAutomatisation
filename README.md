# Email Marketing Automation Web Application

This web application is an automated email marketing tool that helps create and send personalized marketing emails to potential clients.

## Features

- AI-generated customized marketing emails based on company information
- Google OAuth authentication for Gmail integration
- Review and edit emails before sending
- Email tracking dashboard
- Send emails directly through Gmail

## Technology Stack

- **Frontend**: React with TypeScript, Material UI
- **Backend**: Node.js with Express, TypeScript
- **APIs**: OpenAI API, Gmail API
- **Authentication**: Google OAuth 2.0

## Getting Started

### Prerequisites

- Node.js & npm
- Google Cloud project with Gmail API enabled
- OpenAI API key

### Installation

1. Clone the repository
   ```
   git clone https://github.com/CapoVerse-1/EmailAutomatisation.git
   ```

2. Install frontend dependencies
   ```
   cd client
   npm install
   ```

3. Install backend dependencies
   ```
   cd ../server
   npm install
   ```

4. Set up environment variables (see `.env.example` files)

5. Start the development servers
   ```
   # Backend
   cd server
   npm run dev
   
   # Frontend (in another terminal)
   cd client
   npm start
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
