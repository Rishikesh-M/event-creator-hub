# Deployment Guide - Vercel

This guide will help you deploy your EventSiteCMS to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Git repository connected to your Vercel account

## Steps to Deploy

### 1. Prepare Your Project

Your project is ready for deployment! All backend services are already running on Lovable Cloud (Supabase).

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure your project:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 3. Add Environment Variables

In your Vercel project settings, add these environment variables:

```
VITE_SUPABASE_URL=https://fubeocwfevkfopcoavvp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1YmVvY3dmZXZrZm9wY29hdnZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzOTUyOTAsImV4cCI6MjA3ODk3MTI5MH0.x58K9gUvvlYTSlqq6QeMyLTo-gRRp0H7DsnynzCKOBU
VITE_SUPABASE_PROJECT_ID=fubeocwfevkfopcoavvp
```

### 4. Deploy!

Click "Deploy" and Vercel will automatically build and deploy your application.

## Setting Up Instant Publish (Vercel Deploy Hook)

This enables the "Publish" button in your Event Builder to automatically trigger Vercel deployments.

### Step 1: Create a Deploy Hook in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Git** → **Deploy Hooks**
3. Click **Create Hook**
4. Configure the hook:
   - **Hook Name:** `instant-publish` (or any name you prefer)
   - **Git Branch:** `main` (or your default branch)
5. Click **Create Hook**
6. **Copy the generated webhook URL** (it looks like: `https://api.vercel.com/v1/integrations/deploy/...`)

### Step 2: Add Deploy Hook to Environment Variables

#### For Lovable Deployment:
1. In Lovable, open your project settings
2. Go to **Secrets** or **Environment Variables**
3. Add a new secret:
   - **Name:** `VERCEL_DEPLOY_HOOK`
   - **Value:** Paste the webhook URL you copied from Vercel
4. Save the changes

#### For Vercel Deployment:
1. In Vercel, go to your project **Settings** → **Environment Variables**
2. Add a new environment variable:
   - **Key:** `VERCEL_DEPLOY_HOOK`
   - **Value:** Paste the webhook URL
   - **Environment:** Select all (Production, Preview, Development)
3. Click **Save**
4. **Important:** Redeploy your application after adding the variable

### Step 3: Test the Instant Publish

1. Go to your Event Builder in the application
2. Click the **Publish** button
3. Your event will be published and Vercel will automatically start a new deployment
4. You can monitor the deployment progress in your Vercel dashboard

### How It Works

When you click "Publish" in the Event Builder:
1. The event's `is_published` status is updated in the database
2. A POST request is sent to `/api/deploy`
3. The edge function triggers the Vercel Deploy Hook
4. Vercel automatically rebuilds and deploys your site with the updated event

## Post-Deployment

### Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain and follow the DNS configuration instructions

### Automatic Deployments

Vercel automatically deploys:
- **Production:** Every push to your `main` branch
- **Preview:** Every push to other branches or pull requests
- **Instant Publish:** When you click "Publish" in the Event Builder (after setting up Deploy Hook)

## Security Notes

✅ **Encrypted PII:** All sensitive user data (emails, phones, names) in registrations is encrypted using AES-256
✅ **JWT Authentication:** Supabase handles authentication with secure JWT tokens
✅ **RLS Policies:** Database access is protected by Row-Level Security policies
✅ **Backend Functions:** Edge functions are automatically deployed with your Lovable Cloud backend

## Troubleshooting

### Build Fails
- Ensure all dependencies are in `package.json`
- Check build logs for specific errors
- Verify environment variables are set correctly

### Authentication Issues
- Verify Supabase environment variables are correct
- Check that your Supabase project is active

### Registration Form Not Working
- Ensure the `submit-registration` edge function is deployed
- Check browser console for any CORS errors
- Verify the encryption key is set in Supabase secrets

## Support

For more help:
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
