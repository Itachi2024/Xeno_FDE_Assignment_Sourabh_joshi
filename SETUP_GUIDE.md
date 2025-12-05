# Complete Setup Guide - Xeno Shopify Insights

## Step-by-Step Installation

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 2. Set Up PostgreSQL Database

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (if not installed)
# Windows: Download from https://www.postgresql.org/download/windows/
# Mac: brew install postgresql

# Create database
psql -U postgres
CREATE DATABASE xeno_shopify;
\q
```

**Option B: Cloud Database (Recommended)**
- [Neon](https://neon.tech) - Free tier available
- [Supabase](https://supabase.com) - Free tier available
- [Railway](https://railway.app) - Free tier available

### 3. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/xeno_shopify"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=5000

# Shopify credentials (get from Shopify Partner Dashboard)
SHOPIFY_API_KEY="your-api-key"
SHOPIFY_API_SECRET="your-api-secret"
SHOPIFY_SCOPES="read_products,read_orders,read_customers"
```

### 4. Run Database Migrations

```bash
cd backend
npm run db:generate
npm run db:migrate
```

### 5. Configure Frontend Environment

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 6. Start Development Servers

**Option A: Run both servers together**
```bash
# From root directory
npm run dev
```

**Option B: Run separately**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 7. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database Studio: `cd backend && npm run db:studio`

## Setting Up Shopify Development Store

### 1. Create Shopify Partner Account
1. Go to https://partners.shopify.com/
2. Sign up for free
3. Create a development store

### 2. Create Custom App
1. In your development store admin
2. Go to Settings → Apps and sales channels → Develop apps
3. Click "Create an app"
4. Name it "Xeno Insights"
5. Configure Admin API scopes:
   - `read_customers`
   - `read_orders`
   - `read_products`
6. Install the app
7. Copy the Admin API access token

### 3. Add Dummy Data
1. Go to Products → Add product (create 5-10 products)
2. Go to Customers → Add customer (create 5-10 customers)
3. Go to Orders → Create order (create 10-20 orders)

### 4. Connect to Your App
1. Register/Login at http://localhost:3000
2. Click "Add Store"
3. Enter:
   - Store Name: "My Test Store"
   - Shopify Domain: `your-store.myshopify.com`
   - Access Token: (paste from step 2.7)
4. Click "Sync Data"

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
cd backend
npx prisma db push
```

### Port Already in Use
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Change port in backend/.env
PORT=5001
```

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Prisma Client Issues
```bash
cd backend
npm run db:generate
```

## Testing the Application

### 1. Authentication
- Register a new user
- Login with credentials
- Verify JWT token in localStorage

### 2. Tenant Management
- Add a Shopify store
- View list of stores
- Switch between stores

### 3. Data Sync
- Click "Sync Data" button
- Check backend logs for sync progress
- Verify data in dashboard

### 4. Analytics
- View overview metrics
- Filter orders by date range
- Check top customers table

## Deployment Guide

### Backend Deployment (Railway)

1. Create account at https://railway.app
2. Create new project → Deploy from GitHub
3. Select your repository
4. Set root directory: `backend`
5. Add environment variables:
   ```
   DATABASE_URL=(Railway will provide)
   JWT_SECRET=your-secret
   SHOPIFY_API_KEY=your-key
   SHOPIFY_API_SECRET=your-secret
   ```
6. Deploy

### Frontend Deployment (Vercel)

1. Create account at https://vercel.com
2. Import GitHub repository
3. Set root directory: `frontend`
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
   ```
5. Deploy

### Database (Neon/Supabase)

1. Create PostgreSQL database
2. Copy connection string
3. Update DATABASE_URL in Railway

## Next Steps

1. ✅ Complete setup and test locally
2. ✅ Add dummy data to Shopify store
3. ✅ Test data sync functionality
4. ✅ Deploy to production
5. ✅ Record demo video
6. ✅ Update README with deployment URLs
7. ✅ Submit assignment

## Useful Commands

```bash
# Database
npm run db:migrate      # Run migrations
npm run db:generate     # Generate Prisma client
npm run db:studio       # Open Prisma Studio

# Development
npm run dev            # Start both servers
npm run dev:backend    # Start backend only
npm run dev:frontend   # Start frontend only

# Production
npm run build          # Build for production
npm start              # Start production server
```

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Review backend logs
3. Check browser console for frontend errors
4. Verify environment variables are set correctly
