# Firebase Authentication Setup Guide

## Overview
This app uses Firebase Authentication with Google Sign-In.

## Setup Steps

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `OPAC Labs` (or your preferred name)
4. Disable Google Analytics (optional, you can enable it if needed)
5. Click "Create project"

### 2. Enable Google Authentication

1. In your Firebase project, go to **Build** → **Authentication**
2. Click "Get started"
3. Go to the **Sign-in method** tab
4. Click on "Google" in the providers list
5. Toggle the "Enable" switch
6. Enter a project support email (your email)
7. Click "Save"

### 3. Register Your Web App

1. In Firebase Console, click the **gear icon** (⚙️) next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps" section
4. Click the **Web icon** (`</>`)
5. Register app:
   - App nickname: `OPAC Labs Web`
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"
6. Copy the Firebase configuration object

### 4. Get Your Firebase Config

You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 5. Update .env.local

Copy the values from your Firebase config and paste them into `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### 6. Configure Authorized Domains (for production)

1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Add your production domain (e.g., `opaclabs.com`)
3. `localhost` is already authorized by default for development

### 7. Test the Authentication

1. Start your development server:
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
- ✅ Firebase Authentication with real-time auth state
- ✅ Protected checkout (requires authentication)
- ✅ User menu in navbar with sign-out
- ✅ Redirect to original page after login
- ✅ Persistent authentication across page refreshes

## File Structure

```
opac-labs-nextjs/
├── lib/
│   └── firebase.ts                  # Firebase configuration
├── contexts/
│   └── FirebaseAuthContext.tsx      # Auth context provider
├── app/
│   ├── login/page.tsx               # Login with Google
│   ├── register/page.tsx            # Register with Google
│   ├── cart/page.tsx                # Protected checkout
│   └── layout.tsx                   # Wrapped with FirebaseAuthProvider
├── components/
│   └── Navbar.tsx                   # Shows user info & sign out
└── .env.local                       # Firebase credentials
```

## Quick Setup Checklist

- [ ] Create Firebase project
- [ ] Enable Google Authentication
- [ ] Register web app in Firebase
- [ ] Copy Firebase config values
- [ ] Update `.env.local` with your Firebase credentials
- [ ] Test sign-in at `/login`

## Next Steps

1. Set up Firestore database for storing user data and orders
2. Add user profile page
3. Implement order history
4. Add email/password authentication (optional)
5. Set up Firebase Cloud Functions for backend logic

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Check that all environment variables in `.env.local` are set correctly
- Restart your development server after updating `.env.local`

### "Firebase: Error (auth/unauthorized-domain)"
- Add your domain to Authorized domains in Firebase Console
- For localhost, it should work by default

### Sign-in popup blocked
- Allow popups for localhost in your browser
- Or use redirect method instead of popup (requires code change)
