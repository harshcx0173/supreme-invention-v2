# Deployment Setup Guide

## Issues Fixed

### 1. OAuth Redirect URI Mismatch Error
The error "redirect_uri_mismatch" occurs because your Google OAuth callback URL doesn't match what's configured in Google Cloud Console.

### 2. Server Route Not Found Error
The server was deployed but routes weren't accessible due to CORS and session configuration issues.

## Steps to Fix

### Step 1: Update Google Cloud Console OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID and click **Edit**
4. In **Authorized redirect URIs**, add these URLs:
   ```
   https://supreme-invention-v2.onrender.com/auth/google/callback
   http://localhost:5000/auth/google/callback
   ```
5. Click **Save**

### Step 2: Update Environment Variables on Render

In your Render dashboard, update these environment variables:

```
NODE_ENV=production
GOOGLE_CALLBACK_URL=https://supreme-invention-v2.onrender.com/auth/google/callback
MONGODB_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
```

### Step 3: Update Frontend Domain

If you have a frontend deployed, update the callback redirect URL in `server/routes/auth.js`:

```javascript
res.redirect(process.env.NODE_ENV === 'production' 
  ? 'https://your-frontend-domain.com/dashboard' // Replace with your actual frontend URL
  : 'http://localhost:3000/dashboard');
```

### Step 4: Test Your Deployment

1. Visit: `https://supreme-invention-v2.onrender.com/`
   - Should show: `{"message":"Server is running!","environment":"production","timestamp":"..."}`

2. Test OAuth: `https://supreme-invention-v2.onrender.com/auth/google`
   - Should redirect to Google OAuth

3. Test health endpoint: `https://supreme-invention-v2.onrender.com/health`
   - Should show server status

## Common Issues and Solutions

### Issue: Still getting "Route not found"
- Check if your Render service is actually running
- Verify environment variables are set correctly
- Check Render logs for any startup errors

### Issue: OAuth still fails
- Double-check the redirect URI in Google Cloud Console
- Ensure the callback URL exactly matches: `https://supreme-invention-v2.onrender.com/auth/google/callback`
- Check that your Google Client ID and Secret are correct in Render environment variables

### Issue: CORS errors
- The server now allows both localhost and production domains
- Update the CORS configuration in `server/index.js` if you have a different frontend domain

## Next Steps

1. Deploy your frontend (if not already done)
2. Update the callback redirect URL to point to your frontend domain
3. Test the complete OAuth flow
4. Set up your MongoDB database (if using Atlas, make sure to whitelist Render's IP addresses)

## Testing Checklist

- [ ] Server responds at root endpoint
- [ ] Health endpoint works
- [ ] Google OAuth redirects properly
- [ ] OAuth callback works
- [ ] User authentication works
- [ ] All API endpoints are accessible
