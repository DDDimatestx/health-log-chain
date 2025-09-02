# MedJournal - Production Deployment Guide

## Prerequisites

Before you begin, make sure you have:
- Node.js (version 18 or higher)
- Git
- Visual Studio Code (or any code editor)
- A hosting provider account (Vercel, Netlify, or your own server)

## Step 1: Download and Setup Project

### 1.1 Download from GitHub
1. Go to your GitHub repository
2. Click the green "Code" button
3. Select "Download ZIP"
4. Extract the ZIP file to your desired location

### 1.2 Alternative: Clone with Git
```bash
git clone [your-github-repo-url]
cd medjournal
```

## Step 2: Install Dependencies and Setup

### 2.1 Open in Visual Studio Code
1. Open Visual Studio Code
2. File → Open Folder
3. Select your project folder

### 2.2 Install Node.js Dependencies
Open terminal in VS Code (Terminal → New Terminal) and run:

```bash
npm install
```

### 2.3 Environment Setup
Create a `.env` file in the root directory with:

```env
VITE_SUPABASE_PROJECT_ID="qxytudjaeswvwmnyrxal"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eXR1ZGphZXN3dndtbnlyeGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDk5MDcsImV4cCI6MjA3MjMyNTkwN30.7olG2er5E29O3JCEpJ8jawq1jnHtKt23nbg_-uCJRj0"
VITE_SUPABASE_URL="https://qxytudjaeswvwmnyrxal.supabase.co"
```

## Step 3: Build for Production

### 3.1 Run Development Server (Optional Test)
```bash
npm run dev
```
Visit `http://localhost:8080` to test the application locally.

### 3.2 Build Production Version
```bash
npm run build
```

This creates a `dist` folder with optimized production files.

### 3.3 Preview Production Build (Optional)
```bash
npm run preview
```

## Step 4: Deployment Options

### Option A: Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel --prod
```

4. **Set Environment Variables in Vercel:**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add all the environment variables from your `.env` file

### Option B: Deploy to Netlify

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Login to Netlify:**
```bash
netlify login
```

3. **Deploy:**
```bash
netlify deploy --prod --dir=dist
```

4. **Set Environment Variables:**
   - Go to Netlify dashboard
   - Site settings → Environment variables
   - Add all environment variables

### Option C: Deploy to Your Own Server

1. **Upload the `dist` folder** to your server's web directory
2. **Configure web server** (Apache/Nginx) to serve the files
3. **Set up environment variables** on your server

## Step 5: Configure Your Domain (Optional)

### For Vercel:
1. Go to your project dashboard
2. Settings → Domains
3. Add your custom domain

### For Netlify:
1. Site settings → Domain management
2. Add custom domain

## Step 6: Post-Deployment Configuration

### 6.1 Update Smart Contract (If needed)
If you deploy a new smart contract:
1. Update `CONTRACT_ADDRESS` in `src/hooks/useWallet.ts`
2. Rebuild and redeploy

### 6.2 Configure CORS (If using custom API)
Make sure your backend APIs allow requests from your domain.

## Step 7: Testing Production

1. **Test Wallet Connection**: Connect MetaMask wallet
2. **Test Journal Entry**: Create a health journal entry
3. **Test AI Analysis**: Verify AI analysis works
4. **Test Blockchain Recording**: Submit entry to blockchain
5. **Test History**: Check if entries are saved and displayed

## Important Notes

### Security Considerations:
- ✅ All sensitive data is encrypted in Supabase
- ✅ Smart contract addresses are public (safe to expose)
- ✅ Environment variables are properly configured
- ✅ User data is tied to wallet addresses (decentralized)

### Performance Optimization:
- ✅ Static files are optimized in build process
- ✅ Images are compressed and optimized
- ✅ Code is minified and tree-shaken
- ✅ CDN deployment for global performance

### Monitoring:
1. Set up error tracking (Sentry recommended)
2. Monitor transaction costs on blockchain
3. Check Supabase usage and limits
4. Monitor website performance

## Troubleshooting

### Common Issues:

1. **Build Errors:**
   ```bash
   npm run lint
   npm run type-check
   ```

2. **Environment Variables Not Working:**
   - Check `.env` file format
   - Restart development server
   - Verify deployment platform settings

3. **Wallet Connection Issues:**
   - Ensure MetaMask is installed
   - Check network settings (Sepolia testnet)
   - Verify contract address is correct

4. **Database Connection Issues:**
   - Check Supabase credentials
   - Verify RLS policies are set up correctly
   - Check network connectivity

### Support:
- Check console errors in browser developer tools
- Review deployment logs in your hosting platform
- Test individual components in development mode

## Maintenance

### Regular Tasks:
1. **Update Dependencies** (monthly):
   ```bash
   npm update
   npm audit fix
   ```

2. **Monitor Costs:**
   - Supabase usage
   - Blockchain transaction costs
   - Hosting costs

3. **Backup Data:**
   - Export Supabase data regularly
   - Keep smart contract source code backed up

### Security Updates:
- Keep dependencies updated
- Monitor for security advisories
- Review smart contract for potential issues

---

## Quick Command Reference

```bash
# Setup
npm install

# Development
npm run dev

# Build
npm run build

# Deploy (Vercel)
vercel --prod

# Deploy (Netlify)
netlify deploy --prod --dir=dist

# Check for issues
npm run lint
npm run type-check
```

Your MedJournal application is now ready for production use! 🚀