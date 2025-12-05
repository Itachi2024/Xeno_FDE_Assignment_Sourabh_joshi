# Xeno Shopify Insights - Multi-tenant Data Ingestion & Analytics

A full-stack application that ingests Shopify store data and provides analytics insights with multi-tenant support.

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Next.js   │─────▶│  Express API │─────▶│ PostgreSQL  │
│  Frontend   │      │   Backend    │      │  Database   │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Shopify API  │
                     │  + Webhooks  │
                     └──────────────┘
```

## 🚀 Features

- ✅ Email authentication (register/login)
- ✅ Multi-tenant store management
- ✅ Shopify data ingestion (customers, orders, products)
- ✅ Real-time sync via webhooks
- ✅ Scheduled data sync (every 6 hours)
- ✅ Advanced analytics dashboard with:
  - Total customers, orders, revenue with growth metrics
  - Revenue & order trends with date filtering
  - Top 5 customers by spend
  - Order status distribution (pie chart)
  - Top products by revenue (bar chart)
  - Customer segmentation (VIP/Regular/New)
  - Growth metrics and KPIs
- ✅ Tenant data isolation
- ✅ Demo data seeding

## 📦 Tech Stack

**Backend:**
- Node.js + Express.js
- Prisma ORM
- PostgreSQL
- JWT authentication
- node-cron for scheduling

**Frontend:**
- Next.js 14
- React
- Recharts for visualizations
- Axios for API calls

## 🛠️ Quick Setup (5 minutes)

### Prerequisites
- Node.js 18+
- PostgreSQL database

### 1. Clone and Install

```bash
# Install all dependencies
npm run install:all
```

### 2. Database Setup

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your database credentials:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/xeno_shopify"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
```

Run migrations and seed demo data:
```bash
npm run db:migrate
npm run db:seed
```

### 3. Frontend Setup

```bash
cd ../frontend
cp .env.local.example .env.local
```

The `.env.local` should contain:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Run Development Servers

```bash
# From root directory
npm run dev

# Or separately:
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 5. Access the App

Open `http://localhost:3000` and login with:
- **Email**: demo@xeno.com
- **Password**: demo123

You'll see 3 pre-populated stores with sample data! 🎉

## 🎮 Demo Credentials

After running the seed script, you can login with:

- **Email**: demo@xeno.com
- **Password**: demo123

**Pre-populated Demo Stores:**
1. **Fashion Boutique** - Clothing and accessories
2. **Tech Gadgets Store** - Electronics and tech accessories
3. **Home & Living** - Home decor and furnishings

Each store has 5 products, 5 customers, and multiple orders with realistic data!

## 📊 Database Schema

### Key Models:
- **User**: Authentication and tenant ownership
- **Tenant**: Shopify store configuration
- **Customer**: Synced customer data
- **Order**: Order records with line items
- **Product**: Product catalog
- **Event**: Custom events (cart abandoned, etc.)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Tenants
- `GET /api/tenants` - List user's stores
- `POST /api/tenants` - Add new store

### Shopify
- `POST /api/shopify/sync/:tenantId` - Manual sync
- `POST /api/shopify/webhook` - Webhook handler

### Insights
- `GET /api/insights/:tenantId/overview` - Overview metrics
- `GET /api/insights/:tenantId/orders-by-date` - Orders with date filter
- `GET /api/insights/:tenantId/top-customers` - Top 5 customers

## 🔐 Multi-tenancy

Data isolation is achieved through:
1. Tenant ID in all data models
2. Row-level filtering in queries
3. User-tenant relationship validation
4. Unique constraints on (shopifyId, tenantId)

## 📝 Assumptions

1. Using Shopify Admin API (not Storefront API)
2. Access tokens are manually obtained from Shopify admin
3. Single currency per store (USD default)
4. Sync runs every 6 hours automatically
5. Basic authentication (no OAuth flow)

## 🚀 Deployment

### Backend (Railway/Render)
1. Connect GitHub repo
2. Set environment variables
3. Deploy from `backend` directory

### Frontend (Vercel)
1. Import GitHub repo
2. Set root directory to `frontend`
3. Add environment variables
4. Deploy

### Database
- Use managed PostgreSQL (Railway, Supabase, or Neon)

## 🔄 Next Steps for Production

1. **Security:**
   - Implement Shopify OAuth flow
   - Add rate limiting
   - Encrypt access tokens at rest
   - Add CORS whitelist

2. **Scalability:**
   - Add Redis for caching
   - Implement job queue (Bull/BullMQ)
   - Database connection pooling
   - Horizontal scaling

3. **Features:**
   - Real-time webhook processing
   - Advanced analytics (cohort analysis, LTV)
   - Export functionality
   - Email notifications
   - Custom event tracking

4. **Monitoring:**
   - Error tracking (Sentry)
   - Performance monitoring
   - Logging (Winston/Pino)
   - Uptime monitoring

## 📄 License

MIT
