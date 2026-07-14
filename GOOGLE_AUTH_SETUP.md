# Google Authentication Setup Guide

## Overview
This app uses NextAuth.js v5 (beta) with Google OAuth for authentication.

## Setup Steps

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - Development: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://yourdomain.com/api/auth/callback/google`
   - Click "Create"
   - Copy the Client ID and Client Secret

### 2. Configure Environment Variables

Update the `.env.local` file with your credentials:

```env
# Generate a secret key (run: openssl rand -base64 32)
AUTH_SECRET=your-generated-secret-key

# Google OAuth credentials from step 1
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Base URL
NEXTAUTH_URL=http://localhost:3000
```

### 3. Generate AUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

Copy the output and paste it as your `AUTH_SECRET` value.

### 4. Test the Authentication

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/login`
3. Click "Sign in with Google"
4. Complete the Google sign-in flow
5. You should be redirected back to the home page

## Features Implemented

- ✅ Google Sign-In on login page
- ✅ Google Sign-Up on register page
- ✅ Session management with NextAuth
- ✅ Protected checkout (requires authentication)
- ✅ User menu in navbar with sign-out
- ✅ Redirect to original page after login

## File Structure

```
opac-labs-nextjs/
├── auth.ts                          # NextAuth configuration
├── app/
│   ├── api/auth/[...nextauth]/
│   │   └── route.ts                 # NextAuth API route
│   ├── login/page.tsx               # Login page with Google Sign-In
│   └── register/page.tsx            # Register page with Google Sign-Up
├── components/
│   ├── SessionProvider.tsx          # Session provider wrapper
│   └── Navbar.tsx                   # Updated with session check
└── .env.local                       # Environment variables
```

## Next Steps

1. Set up a database (MongoDB, PostgreSQL, etc.) to store user data
2. Add user profile page
3. Implement order history
4. Add email verification
5. Set up production OAuth credentials

## Troubleshooting

### "Configuration error" on sign-in
- Check that `AUTH_SECRET` is set in `.env.local`
- Verify Google credentials are correct

### Redirect URI mismatch
- Ensure the redirect URI in Google Console matches exactly:
  `http://localhost:3000/api/auth/callback/google`

### Session not persisting
- Clear browser cookies and try again
- Check that SessionProvider wraps your app in layout.tsx
