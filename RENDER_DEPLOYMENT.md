# Render Deployment Guide

Complete step-by-step guide to deploy your Xeno Shopify Insights backend to Render.

---

## 🚀 Quick Deploy (5 minutes)

### Prerequisites
- GitHub account with your code pushed
- Render account (free tier available)
- PostgreSQL database (we'll create one on Render)

---

## Step 1: Create PostgreSQL Database on Render

### 1.1 Go to Render Dashboard
1. Visit [render.com](https://render.com)
2. Sign up or log in
3. Click **"New +"** button
4. Select **"PostgreSQL"**

### 1.2 Configure Database
```
Name: xeno-shopify-db
Database: xeno_shopify
User: xeno_user
Region: Oregon (or closest to you)
Plan: Free
```

### 1.3 Create Database
1. Click **"Create Database"**
2. Wait for provisioning (1-2 minutes)
3. Once ready, go to database page
4. Copy the **"Internal Database URL"** (starts with `postgresql://`)
5. Save this URL - you'll need it for the backend

---

## Step 2: Deploy Backend to Render

### 2.1 Create Web Service
1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your GitHub repository
4. Select your repository

### 2.2 Configure Web Service

**Basic Settings:**
```
Name: xeno-shopify-backend
Region: Oregon (same as database)
Branch: main
Root Directory: backend
Runtime: Node
```

**Build & Deploy:**
```
Build Command: npm install && npx prisma generate && npx prisma migrate deploy
Start Command: npm start
```

**Instance Type:**
```
Plan: Free
```

### 2.3 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | `postgresql://...` | Paste the Internal Database URL from Step 1.3 |
| `JWT_SECRET` | `your-super-secret-jwt-key-min-32-chars` | Generate a strong random string |
| `PORT` | `5000` | Port number |
| `NODE_ENV` | `production` | Environment |
| `SHOPIFY_API_KEY` | `your-key` | Optional - for Shopify integration |
| `SHOPIFY_API_SECRET` | `your-secret` | Optional - for Shopify integration |

**Generate JWT_SECRET:**
```bash
# On Mac/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or just use a long random string
# Example: my-super-secret-jwt-key-change-this-in-production-12345
```

### 2.4 Deploy
1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Watch the logs for any errors
4. Wait for deployment to complete (3-5 minutes)

---

## Step 3: Migrations Run Automatically

**Good news!** Migrations run automatically during deployment because we configured the build command to include:

```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

### 3.1 Verify Migrations

After deployment completes:
1. Check the deployment logs
2. Look for: `✓ Migrations applied successfully`
3. If you see errors, see troubleshooting below

### 3.2 Seed Demo Data (Optional)

**Note:** Render free tier doesn't have Shell access, so we'll seed data differently.

**Option 1: Add Seed to Build Command (Recommended)**

1. Go to your Render service settings
2. Update Build Command to:
   ```bash
   npm install && npx prisma generate && npx prisma migrate deploy && npm run db:seed
   ```
3. Click "Save Changes"
4. Manually trigger a new deployment

**Option 2: Create a Seed Endpoint (Alternative)**

Add a temporary endpoint to seed data:

```javascript
// backend/src/routes/seed.js
import express from 'express';
import { execSync } from 'child_process';

const router = express.Router();

router.post('/seed-data', async (req, res) => {
  try {
    // Only allow in development or with secret key
    if (process.env.NODE_ENV === 'production' && 
        req.headers['x-seed-secret'] !== process.env.SEED_SECRET) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    execSync('npm run db:seed', { stdio: 'inherit' });
    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

Then call it once:
```bash
curl -X POST https://your-app.onrender.com/api/seed-data \
  -H "x-seed-secret: your-secret-key"
```

**Option 3: Seed Locally, Then Deploy**

1. Run locally with production database:
   ```bash
   DATABASE_URL="your-render-db-url" npm run db:seed
   ```
2. This seeds the production database directly

**Recommended:** Use Option 1 (add to build command) for automatic seeding on first deploy.

---

## Step 4: Verify Deployment

### 4.1 Check Health Endpoint

Visit: `https://your-app-name.onrender.com/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 4.2 Test API

```bash
# Test login
curl -X POST https://your-app-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@xeno.com","password":"demo123"}'
```

Should return user and token.

---

## Step 5: Update Frontend

### 5.1 Update Vercel Environment Variable

1. Go to your Vercel project
2. Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL`:
   ```
   NEXT_PUBLIC_API_URL=https://your-app-name.onrender.com
   ```
4. Redeploy frontend

### 5.2 Update CORS in Backend

Your backend is already configured to allow your Vercel domain. If you need to add more domains, update `backend/src/index.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app',
    'https://your-custom-domain.com'
  ]
}));
```

Then commit and push to trigger a new deployment.

---

## 🔧 Troubleshooting

### Issue: Build Fails

**Error:** `Cannot find module 'prisma'`

**Solution:**
1. Check that `prisma` is in `dependencies` (not `devDependencies`)
2. Update `backend/package.json`:
   ```json
   "dependencies": {
     "@prisma/client": "^5.7.0",
     "prisma": "^5.7.0"
   }
   ```
3. Commit and push

---

### Issue: Database Connection Failed

**Error:** `Can't reach database server`

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Use **Internal Database URL** (not External)
3. Check database is running in Render dashboard
4. Ensure database and web service are in same region

---

### Issue: Migrations Fail

**Error:** `Migration failed to apply`

**Solution:**

**Option 1: Reset Database (Development)**
```bash
# In Render Shell
npx prisma migrate reset
npx prisma migrate deploy
npm run db:seed
```

**Option 2: Manual Migration**
```bash
# In Render Shell
npx prisma db push
```

---

### Issue: Port Binding Error

**Error:** `Port 5000 is already in use`

**Solution:**
Render automatically assigns ports. Make sure your code uses `process.env.PORT`:

```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

### Issue: Environment Variables Not Loading

**Error:** `JWT_SECRET is not defined`

**Solution:**
1. Go to Render dashboard → Your service
2. Click **"Environment"** tab
3. Verify all variables are set
4. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

### Issue: CORS Errors

**Error:** `Access to fetch blocked by CORS policy`

**Solution:**
1. Add your Vercel domain to CORS whitelist
2. Update `backend/src/index.js`
3. Commit and push
4. Wait for deployment

---

## 📊 Monitoring

### View Logs

1. Go to Render dashboard → Your service
2. Click **"Logs"** tab
3. Monitor real-time logs
4. Filter by log level

### Check Metrics

1. Go to **"Metrics"** tab
2. View:
   - CPU usage
   - Memory usage
   - Request count
   - Response time

### Set Up Alerts

1. Go to **"Settings"** → **"Notifications"**
2. Add email for alerts
3. Configure alert thresholds

---

## 🔄 Continuous Deployment

### Auto-Deploy on Push

Render automatically deploys when you push to your main branch:

1. Make changes locally
2. Commit: `git commit -m "Update feature"`
3. Push: `git push origin main`
4. Render detects push and deploys automatically
5. Monitor deployment in Render dashboard

### Manual Deploy

1. Go to Render dashboard → Your service
2. Click **"Manual Deploy"**
3. Select **"Deploy latest commit"**
4. Wait for deployment

---

## 🔐 Security Best Practices

### 1. Secure Environment Variables

- ✅ Never commit `.env` files
- ✅ Use strong JWT_SECRET (32+ characters)
- ✅ Rotate secrets regularly
- ✅ Use different secrets for dev/prod

### 2. Database Security

- ✅ Use Internal Database URL (not External)
- ✅ Enable SSL connections
- ✅ Regular backups
- ✅ Limit database access

### 3. API Security

- ✅ Enable CORS only for trusted domains
- ✅ Implement rate limiting (future)
- ✅ Use HTTPS only
- ✅ Validate all inputs

---

## 💰 Cost Optimization

### Free Tier Limits

**Web Service (Free):**
- 750 hours/month
- 512 MB RAM
- Shared CPU
- Sleeps after 15 min inactivity
- ❌ No Shell access
- ❌ No persistent disk
- ✅ Auto-deploy on push
- ✅ HTTPS included

**PostgreSQL (Free):**
- 1 GB storage
- 90 days retention
- Expires after 90 days
- ❌ No Shell access
- ✅ External connections allowed
- ✅ Backups (manual only)

### Workarounds for Free Tier

**No Shell Access:**
- Use build commands for migrations
- Add seed to build command
- Connect to database locally
- Use database GUI tools

**Service Sleeps:**
- First request takes 30-60s
- Use a ping service (UptimeRobot)
- Upgrade to paid plan ($7/month)

**Database Expires (90 days):**
- Export data before expiration
- Upgrade to paid plan ($7/month)
- Use alternative (Supabase, Neon)

### Upgrade Options

**Web Service ($7/month):**
- Always on (no sleep)
- 512 MB RAM
- Shared CPU

**PostgreSQL ($7/month):**
- 1 GB storage
- No expiration
- Daily backups

---

## 🚀 Performance Optimization

### 1. Enable Caching

Add Redis for caching (future enhancement):
```bash
# In Render, create Redis instance
# Update backend to use Redis
```

### 2. Database Optimization

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_tenant_id ON "Customer"("tenantId");
CREATE INDEX idx_order_date ON "Order"("orderDate");
```

### 3. Connection Pooling

Prisma handles this automatically, but you can configure:

```javascript
// backend/src/prismaClient.js
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error', 'warn'],
});
```

---

## 📦 Backup Strategy

### Automatic Backups (Paid Plan)

Render provides daily backups on paid plans:
1. Go to database page
2. Click **"Backups"** tab
3. View backup history
4. Restore from backup if needed

### Manual Backup

```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Import database
psql $DATABASE_URL < backup.sql
```

### Backup to S3 (Advanced)

Set up automated backups to AWS S3:
```bash
# Install AWS CLI
# Configure S3 bucket
# Create backup script
# Schedule with cron
```

---

## 🔄 Database Migrations

### Development Workflow

1. **Make schema changes locally:**
   ```bash
   cd backend
   # Edit prisma/schema.prisma
   npx prisma migrate dev --name add_new_field
   ```

2. **Test locally:**
   ```bash
   npm run dev
   # Test the changes
   ```

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add new field to schema"
   git push origin main
   ```

4. **Render auto-deploys:**
   - Runs `npx prisma migrate deploy`
   - Applies migrations automatically

### Manual Migration on Render

**Note:** Render free tier doesn't have Shell access.

**If auto-migration fails:**

**Option 1: Update Build Command**
1. Go to service settings
2. Ensure build command includes:
   ```bash
   npm install && npx prisma generate && npx prisma migrate deploy
   ```
3. Trigger manual deployment

**Option 2: Use Prisma Studio Locally**
1. Connect to production database locally:
   ```bash
   DATABASE_URL="your-render-db-url" npx prisma studio
   ```
2. Verify schema and data

**Option 3: Direct Database Connection**
1. Use the External Database URL from Render
2. Connect with a PostgreSQL client (pgAdmin, DBeaver, etc.)
3. Run migrations manually if needed

---

## 🧪 Testing Production

### Test Endpoints

```bash
# Health check
curl https://your-app.onrender.com/health

# Login
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@xeno.com","password":"demo123"}'

# Get tenants (replace TOKEN)
curl https://your-app.onrender.com/api/tenants \
  -H "Authorization: Bearer TOKEN"
```

### Load Testing (Optional)

Use tools like Apache Bench or k6:

```bash
# Install Apache Bench
# Test endpoint
ab -n 1000 -c 10 https://your-app.onrender.com/health
```

---

## 📈 Scaling

### Horizontal Scaling

Render doesn't support horizontal scaling on free tier. For production:

1. Upgrade to paid plan
2. Enable auto-scaling
3. Configure min/max instances
4. Set up load balancer

### Vertical Scaling

Upgrade instance size:
1. Go to service settings
2. Change instance type
3. Redeploy

---

## �  Keep Service Awake (Free Tier)

### Problem: Service Sleeps After 15 Minutes

On Render free tier, your service sleeps after 15 minutes of inactivity. First request takes 30-60 seconds to wake up.

### Solution 1: Use a Ping Service (Recommended)

**UptimeRobot (Free):**
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up for free account
3. Add new monitor:
   - Type: HTTP(s)
   - URL: `https://your-app.onrender.com/health`
   - Interval: 5 minutes
4. This keeps your service awake

**Cron-job.org (Free):**
1. Go to [cron-job.org](https://cron-job.org)
2. Create free account
3. Create new cron job:
   - URL: `https://your-app.onrender.com/health`
   - Interval: Every 5 minutes

### Solution 2: Frontend Ping

Add to your frontend to ping backend periodically:

```javascript
// frontend/src/app/layout.js
useEffect(() => {
  // Ping backend every 5 minutes to keep it awake
  const interval = setInterval(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
      .catch(() => {}); // Ignore errors
  }, 5 * 60 * 1000); // 5 minutes

  return () => clearInterval(interval);
}, []);
```

### Solution 3: Upgrade to Paid Plan

- $7/month for always-on service
- No sleep
- Faster response times

---

## 🔍 Debugging

### View Real-time Logs

```bash
# In Render dashboard
# Go to Logs tab
# Filter by:
# - Error
# - Warning
# - Info
```

### Common Log Messages

**Success:**
```
🚀 Server running on port 10000
📅 Sync scheduler started
```

**Errors:**
```
❌ Database connection failed
❌ Migration failed
❌ Port already in use
```

### Debug Mode

Enable detailed logging:

1. Add environment variable:
   ```
   DEBUG=*
   ```
2. Redeploy
3. Check logs for detailed output

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain

1. Go to service settings
2. Click **"Custom Domains"**
3. Add your domain
4. Update DNS records:
   ```
   Type: CNAME
   Name: api (or @)
   Value: your-app.onrender.com
   ```
5. Wait for DNS propagation (5-30 minutes)
6. SSL certificate auto-generated

---

## 📝 Environment Variables Reference

### Required Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection string |
| `JWT_SECRET` | `random-32-char-string` | JWT signing secret |
| `PORT` | `5000` | Server port (auto-assigned by Render) |
| `NODE_ENV` | `production` | Environment mode |

### Optional Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `SHOPIFY_API_KEY` | `abc123...` | Shopify app API key |
| `SHOPIFY_API_SECRET` | `xyz789...` | Shopify app secret |
| `SHOPIFY_SCOPES` | `read_products,read_orders` | Required permissions |
| `DEBUG` | `*` | Enable debug logging |

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] All tests passing locally
- [ ] Environment variables documented
- [ ] Database schema finalized
- [ ] CORS configured correctly

### During Deployment
- [ ] Database created on Render
- [ ] Web service created
- [ ] Environment variables set
- [ ] Build completed successfully
- [ ] Migrations applied
- [ ] Service is running

### Post-Deployment
- [ ] Health endpoint accessible
- [ ] API endpoints working
- [ ] Database connected
- [ ] Frontend can connect
- [ ] Demo data seeded (optional)
- [ ] Logs show no errors
- [ ] CORS working correctly

---

## 🎯 Quick Reference

### Render URLs

**Dashboard:** https://dashboard.render.com  
**Your Service:** https://your-app.onrender.com  
**Health Check:** https://your-app.onrender.com/health  
**API Base:** https://your-app.onrender.com/api

### Common Commands (Render Shell)

```bash
# Run migrations
npx prisma migrate deploy

# Seed database
npm run db:seed

# View Prisma Studio (not available in Render Shell)
# Use local: npm run db:studio

# Check Node version
node --version

# Check npm version
npm --version

# View environment variables
env | grep DATABASE_URL
```

---

## 🆘 Support

### Render Support

- **Documentation:** https://render.com/docs
- **Community:** https://community.render.com
- **Status:** https://status.render.com
- **Support:** support@render.com

### Project Support

- Check **TROUBLESHOOTING.md**
- Review **DEPLOYMENT.md**
- Check GitHub Issues
- Review logs in Render dashboard

---

## 🎉 Success!

If you've completed all steps:

✅ Backend deployed to Render  
✅ Database hosted on Render  
✅ Migrations applied  
✅ Environment variables set  
✅ Health check passing  
✅ API endpoints working  

**Your backend is live!** 🚀

Next steps:
1. Deploy frontend to Vercel
2. Update frontend API URL
3. Test end-to-end
4. Record demo video
5. Submit assignment

---

## 📚 Additional Resources

### Render Documentation
- [Node.js Deployment](https://render.com/docs/deploy-node-express-app)
- [PostgreSQL](https://render.com/docs/databases)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Custom Domains](https://render.com/docs/custom-domains)

### Prisma Documentation
- [Deployment](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-render)
- [Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Connection Pooling](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)

---

**Deployment Time:** ~10 minutes  
**Difficulty:** Easy  
**Cost:** Free tier available

Good luck with your deployment! 🚀