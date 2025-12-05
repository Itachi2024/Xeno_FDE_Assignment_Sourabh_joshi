# Deployment Guide

Complete guide to deploy the Xeno Shopify Insights application to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment](#post-deployment)
7. [Monitoring](#monitoring)

---

## Prerequisites

- GitHub account
- Vercel account (for frontend)
- Railway/Render account (for backend)
- Supabase/Neon account (for database)
- Shopify development store

---

## Database Setup

### Option 1: Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database provisioning
4. Go to Settings → Database
5. Copy the connection string (URI format)
6. Save it as `DATABASE_URL`

### Option 2: Neon

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Save it as `DATABASE_URL`

### Option 3: Railway PostgreSQL

1. In Railway dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Copy the connection string from variables
4. Save it as `DATABASE_URL`

---

## Backend Deployment

### Option 1: Railway (Recommended)

#### Step 1: Prepare Repository
```bash
# Ensure your code is pushed to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### Step 2: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select "backend" as root directory

#### Step 3: Configure Build Settings
- **Root Directory**: `backend`
- **Build Command**: `npm install && npx prisma generate`
- **Start Command**: `npm start`

#### Step 4: Add Environment Variables
Go to Variables tab and add:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000
SHOPIFY_API_KEY=your-shopify-api-key
SHOPIFY_API_SECRET=your-shopify-api-secret
SHOPIFY_SCOPES=read_products,read_orders,read_customers
NODE_ENV=production
```

#### Step 5: Run Database Migrations
In Railway dashboard:
1. Go to your service
2. Click "Settings" → "Deploy"
3. Add deployment command: `npx prisma migrate deploy`

Or use Railway CLI:
```bash
railway login
railway link
railway run npx prisma migrate deploy
```

#### Step 6: Deploy
Railway will automatically deploy. Check logs for any errors.

### Option 2: Render

#### Step 1: Create Web Service
1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: xeno-shopify-backend
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`

#### Step 2: Add Environment Variables
Same as Railway (see above)

#### Step 3: Deploy
Click "Create Web Service"

---

## Frontend Deployment

### Vercel (Recommended)

#### Step 1: Prepare Frontend
Ensure `frontend/.env.local` is NOT committed (it's in .gitignore)

#### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: .next

#### Step 3: Add Environment Variables
In Vercel project settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
```

**Important**: Replace `your-backend-url` with your actual Railway backend URL

#### Step 4: Deploy
Click "Deploy". Vercel will build and deploy automatically.

#### Step 5: Update Backend CORS
After deployment, update backend CORS to allow your Vercel domain:

```javascript
// backend/src/index.js
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app'
  ]
}));
```

---

## Environment Variables

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-key-min-32-chars` |
| `PORT` | Server port | `5000` |
| `SHOPIFY_API_KEY` | Shopify app API key | `abc123...` |
| `SHOPIFY_API_SECRET` | Shopify app secret | `xyz789...` |
| `SHOPIFY_SCOPES` | Required Shopify permissions | `read_products,read_orders,read_customers` |
| `NODE_ENV` | Environment | `production` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.example.com/api` |

---

## Post-Deployment

### 1. Verify Backend Health
```bash
curl https://your-backend-url.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Test Authentication
```bash
curl -X POST https://your-backend-url.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "name": "Test User"
  }'
```

### 3. Access Frontend
Visit your Vercel URL: `https://your-app.vercel.app`

### 4. Create First Tenant
1. Register/login to the app
2. Click "Add Store"
3. Enter Shopify store details
4. Click "Sync Data"

### 5. Verify Cron Job
Check Railway logs to ensure the scheduler is running:
```
📅 Sync scheduler started (runs every 6 hours)
```

---

## Shopify App Setup

### Create Shopify App

1. Go to Shopify Partners dashboard
2. Click "Apps" → "Create app"
3. Choose "Custom app"
4. Fill in app details:
   - **App name**: Xeno Insights
   - **App URL**: Your backend URL
   - **Allowed redirection URL(s)**: Your backend URL + `/api/auth/callback`

### Configure API Scopes

Select the following scopes:
- `read_customers`
- `read_orders`
- `read_products`
- `read_inventory` (optional)

### Get Access Token

For development/testing:
1. Install app on your dev store
2. Go to Apps → Your App → API credentials
3. Copy the Admin API access token
4. Use this token when adding a tenant

### Setup Webhooks (Optional)

1. In Shopify admin → Settings → Notifications → Webhooks
2. Add webhooks:
   - **orders/create**: `https://your-backend-url/api/shopify/webhook`
   - **customers/create**: `https://your-backend-url/api/shopify/webhook`
   - **products/create**: `https://your-backend-url/api/shopify/webhook`

---

## Monitoring

### Railway Monitoring

1. **Logs**: Railway dashboard → Your service → Logs
2. **Metrics**: Check CPU, Memory, Network usage
3. **Alerts**: Set up in Railway settings

### Vercel Monitoring

1. **Analytics**: Vercel dashboard → Analytics
2. **Logs**: Vercel dashboard → Deployments → View logs
3. **Performance**: Check Core Web Vitals

### Database Monitoring

#### Supabase
1. Go to Database → Logs
2. Monitor query performance
3. Check connection pool usage

#### Neon
1. Dashboard → Monitoring
2. Check query statistics
3. Monitor storage usage

### Application Monitoring (Optional)

#### Sentry for Error Tracking

1. Create account at [sentry.io](https://sentry.io)
2. Install Sentry:
```bash
npm install @sentry/node @sentry/nextjs
```

3. Configure backend:
```javascript
// backend/src/index.js
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

4. Configure frontend:
```javascript
// frontend/sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "your-sentry-dsn",
});
```

---

## Troubleshooting

### Backend Issues

#### Database Connection Errors
```
Error: Can't reach database server
```

**Solution**:
- Verify `DATABASE_URL` is correct
- Check database is running
- Ensure IP whitelist includes Railway IPs

#### Migration Errors
```
Error: Migration failed
```

**Solution**:
```bash
railway run npx prisma migrate reset
railway run npx prisma migrate deploy
```

#### Port Binding Errors
```
Error: Port 5000 is already in use
```

**Solution**:
- Railway automatically assigns ports
- Use `process.env.PORT` in code
- Don't hardcode port numbers

### Frontend Issues

#### API Connection Errors
```
GET /undefined/tenants 404
```

**Solution**:
- Verify `NEXT_PUBLIC_API_URL` is set in Vercel
- Redeploy after adding environment variables
- Check backend URL is accessible

#### CORS Errors
```
Access to fetch blocked by CORS policy
```

**Solution**:
- Add Vercel domain to backend CORS whitelist
- Redeploy backend after changes

### Shopify Sync Issues

#### Authentication Errors
```
Error: Invalid access token
```

**Solution**:
- Verify Shopify access token is correct
- Check token hasn't expired
- Ensure required scopes are granted

#### Rate Limiting
```
Error: 429 Too Many Requests
```

**Solution**:
- Implement exponential backoff
- Reduce sync frequency
- Use Shopify Plus for higher limits

---

## Backup Strategy

### Database Backups

#### Automated (Supabase)
- Daily automatic backups
- 7-day retention
- Point-in-time recovery

#### Manual Backup
```bash
# Using pg_dump
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Code Backups
- GitHub repository (version control)
- Tag releases: `git tag v1.0.0`
- Keep deployment history in Railway/Vercel

---

## Scaling Considerations

### When to Scale

Monitor these metrics:
- Response time > 1 second
- CPU usage > 80%
- Memory usage > 80%
- Database connections > 80% of pool

### Horizontal Scaling

#### Railway
1. Go to Settings → Scaling
2. Increase replicas
3. Add load balancer

#### Database
1. Enable connection pooling
2. Add read replicas
3. Consider database sharding

### Vertical Scaling

#### Railway
1. Upgrade plan for more resources
2. Increase memory/CPU limits

---

## Security Checklist

- [ ] HTTPS enabled on all endpoints
- [ ] JWT secret is strong (32+ characters)
- [ ] Database credentials are secure
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (Prisma handles this)
- [ ] XSS protection enabled
- [ ] Shopify tokens encrypted at rest
- [ ] Environment variables not committed to Git
- [ ] Regular dependency updates
- [ ] Security headers configured

---

## Cost Estimation

### Free Tier (Development)
- **Vercel**: Free (Hobby plan)
- **Railway**: $5/month (500 hours)
- **Supabase**: Free (500MB database)
- **Total**: ~$5/month

### Production (Small Scale)
- **Vercel**: $20/month (Pro plan)
- **Railway**: $20/month (Pro plan)
- **Supabase**: $25/month (Pro plan)
- **Total**: ~$65/month

### Production (Medium Scale)
- **Vercel**: $20/month
- **Railway**: $50/month (multiple services)
- **Supabase**: $100/month (larger database)
- **Monitoring**: $29/month (Sentry)
- **Total**: ~$199/month

---

## Maintenance

### Regular Tasks

**Daily**:
- Check error logs
- Monitor sync job success rate

**Weekly**:
- Review performance metrics
- Check database size
- Update dependencies

**Monthly**:
- Security audit
- Backup verification
- Cost optimization review

### Update Process

1. Create feature branch
2. Test locally
3. Deploy to staging (optional)
4. Deploy to production
5. Monitor for issues
6. Rollback if needed

---

## Support

For issues or questions:
- Check logs in Railway/Vercel dashboard
- Review error messages in Sentry
- Consult Shopify API documentation
- Check GitHub issues

---

## Next Steps

After successful deployment:
1. ✅ Test all features end-to-end
2. ✅ Set up monitoring and alerts
3. ✅ Configure automated backups
4. ✅ Document any custom configurations
5. ✅ Create demo video
6. ✅ Submit assignment

Good luck! 🚀
