# Deployment Guide - Crimsons Study Squad

This project is now configured for deployment on **Railway**, **Render**, and **Netlify**.

## Prerequisites

- Node.js 18+
- MySQL database (or cloud database service)
- Git repository pushed to GitHub

---

## Deployment Instructions

### Option 1: Railway (Recommended for Full Stack)

**Deploy Backend + Database + Frontend**

1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect and run `railway.json`
6. Add environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your_secret_key
   SENDGRID_API_KEY=your_sendgrid_key
   GOOGLE_CLIENT_SECRET=your_google_secret
   ```
7. Railway will automatically provision MySQL database and generate `DATABASE_URL`

**Backend URL will be**: `https://your-project.railway.app`

---

### Option 2: Render (Alternative Full Stack)

**Deploy Backend + Database**

1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click "New +" → "Web Service" or "Blueprint"
4. If using Blueprint (recommended):
   - Connect your GitHub repo
   - Render auto-reads `render.yaml`
   - Renders services automatically
   
5. If manual setup:
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start` (from study-group-backend folder)
   - **Root Directory**: `study-group-backend`
   
6. Add environment variables in Render dashboard

**Backend URL will be**: `https://your-backend.onrender.com`
**Frontend URL will be**: `https://your-frontend.onrender.com`

---

### Option 3: Netlify (Frontend Only)

**Deploy Frontend + Use External Backend**

1. Go to [netlify.com](https://netlify.com)
2. Sign in with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select your GitHub repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Root directory**: `.` (project root)

6. Add environment variables in Netlify dashboard:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_GOOGLE_API_KEY=your_google_api_key
   ```

7. Deploy!

**Frontend URL will be**: `https://your-site.netlify.app`

---

## Environment Variables for Cloud Deployment

### Railway/Render Production `.env`
```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com

# Database (Railway auto-generates DATABASE_URL)
DATABASE_URL=mysql://user:password@host:port/database

# Services
JWT_SECRET=your_super_secret_key
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
SENDGRID_API_KEY=SG.your_sendgrid_key
EMAIL_FROM=your-email@example.com
```

### Netlify Production `.env`
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_API_KEY=your_google_api_key
```

---

## Database Setup

### For Railway
- Railway auto-provisions MySQL
- Use the generated `DATABASE_URL` environment variable
- No manual setup needed

### For Render
- Add MySQL database in Render dashboard
- Generate connection string from Render
- Set as `DATABASE_URL` environment variable

### For Self-Hosted MySQL
1. Create database: `study_group`
2. Import schema from `study_group (2).sql`
3. Set individual env vars (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT)

---

## Deployment Checklist

- [ ] Push all code to GitHub
- [ ] Update `GOOGLE_CLIENT_SECRET` in production env vars
- [ ] Update `SENDGRID_API_KEY` for email functionality
- [ ] Set `JWT_SECRET` to a strong random string
- [ ] Verify database is accessible from deployed backend
- [ ] Test API endpoints after deployment
- [ ] Verify frontend can communicate with backend
- [ ] Enable HTTPS (auto-enabled on Railway/Render/Netlify)
- [ ] Set custom domain if desired

---

## Troubleshooting

### "Database connection failed"
- Check `DATABASE_URL` or individual DB env vars are set correctly
- Ensure database exists and is accessible
- Verify database user has proper permissions

### "CORS errors"
- Check `FRONTEND_URL` matches your deployed frontend domain
- Ensure backend is using `getAllowedOrigins()` function

### "Socket.io connection issues"
- Ensure websocket protocol is enabled
- Try with polling transport as fallback (already enabled)
- Check firewall isn't blocking WebSocket connections

### "File uploads not working"
- Current implementation uses ephemeral storage (files lost on restart)
- For production, recommend moving uploads to cloud storage (AWS S3, Cloudinary)
- See upgrade notes below

---

## Future Upgrades for Production

1. **Cloud File Storage**
   - Replace local multer with AWS S3 or Cloudinary
   - Update upload endpoint to return cloud URLs

2. **Database Backups**
   - Enable automated backups on Railway/Render
   - Schedule regular exports

3. **Monitoring & Logging**
   - Add error tracking (Sentry)
   - Enable application monitoring

4. **API Rate Limiting**
   - Add rate limiting middleware to prevent abuse

5. **SSL Certificates**
   - Already auto-enabled on Railway/Render/Netlify

---

## Quick Start Deploy

### 1. Railway (Fastest)
```bash
# Just connect your GitHub repo - that's it!
# Railway handles everything automatically
```

### 2. Render + Netlify
```bash
# Backend: Create web service, point to study-group-backend folder
# Frontend: Create static site, point to root folder with netlify.toml
# Connect them via VITE_API_URL environment variable
```

---

For questions or issues, check the official documentation:
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Netlify Docs](https://docs.netlify.com)
