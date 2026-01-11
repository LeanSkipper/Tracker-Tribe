# OAuth Setup Guide

## Required Environment Variables

Add these to your `.env` file:

```env
# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"  # Change to production URL when deploying
NEXTAUTH_SECRET="your-random-secret-here"  # Generate with: openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# LinkedIn OAuth
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://tracker-tribe.vercel.app/api/auth/callback/google` (production)
7. Copy Client ID and Client Secret to `.env`

## LinkedIn OAuth Setup

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create a new app
3. In "Auth" tab, add redirect URLs:
   - `http://localhost:3000/api/auth/callback/linkedin` (development)
   - `https://tracker-tribe.vercel.app/api/auth/callback/linkedin` (production)
4. Request access to "Sign In with LinkedIn" product
5. Copy Client ID and Client Secret to `.env`

## Vercel Deployment

Add all environment variables in Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable for Production, Preview, and Development
4. Redeploy after adding variables

## Testing OAuth Locally

1. Set up environment variables in `.env`
2. Run `npm run dev`
3. Navigate to `http://localhost:3000/auth/signin`
4. Click "Continue with Google" or "Continue with LinkedIn"
5. Verify successful authentication and redirect to `/obeya`
