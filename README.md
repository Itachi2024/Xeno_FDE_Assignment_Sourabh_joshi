# 🚀 Xeno Shopify Insights

> **Multi-tenant Shopify Data Ingestion & Analytics Platform**

A production-ready, full-stack application that helps enterprise retailers onboard, integrate, and analyze their Shopify customer data with advanced analytics and beautiful visualizations.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748)](https://www.prisma.io/)

---

## ⚡ Quick Reference

```bash
# Install dependencies
npm run install:all

# Setup backend
cd backend && cp .env.example .env
npm run db:migrate && npm run db:seed

# Setup frontend
cd ../frontend && cp .env.local.example .env.local

# Run application
npm run dev

# Access at http://localhost:3000
# Login: demo@xeno.com / demo123
```

**📚 Full Documentation:** [START_HERE.md](./START_HERE.md) | [QUICKSTART.md](./QUICKSTART.md)

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#️-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Shopify Setup](#-shopify-setup)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Demo Credentials](#-demo-credentials)

---

## ✨ Features

### 🔐 Authentication & Security
- Email-based authentication with JWT tokens
- Bcrypt password hashing (10 rounds)
- Protected API routes
- Multi-tenant data isolation

### 🏪 Multi-Tenant Management
- Manage multiple Shopify stores per user
- Complete data isolation between tenants
- Easy store switching
- Secure tenant ownership validation

### 📊 Advanced Analytics Dashboard
- **KPI Cards**: Total customers, orders, revenue, customer LTV
- **Revenue Trends**: Area chart with date range filtering
- **Order Distribution**: Pie chart showing order statuses
- **Top Products**: Bar chart of best-selling products
- **Top Customers**: Table of highest spenders
- **Customer Segments**: VIP, Regular, and New customer breakdown
- **Growth Metrics**: Revenue growth, customer growth, repeat rate

### 🔄 Data Synchronization
- Shopify Admin API integration
- Automated sync every 6 hours (node-cron)
- Manual sync on-demand
- Syncs customers, orders, and products
- Error handling and logging

### 🎨 User Experience
- Clean, modern interface with gradient designs
- Responsive layout
- Loading states and error messages
- Smooth transitions
- Intuitive navigation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│                    http://localhost:3000                     │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js 14 Frontend (React)               │ │
│  │  • Authentication Pages (Login/Register)               │ │
│  │  • Dashboard with Analytics                            │ │
│  │  • Recharts Visualizations                             │ │
│  │  • Multi-tenant Store Selector                         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            │ JWT Authentication
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                       │
│                    http://localhost:5000                     │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Express.js Backend (Node.js)                 │ │
│  │                                                          │ │
│  │  Routes:                                                │ │
│  │  • /api/auth      → Authentication (JWT)               │ │
│  │  • /api/tenants   → Store Management                   │ │
│  │  • /api/shopify   → Shopify Integration & Sync         │ │
│  │  • /api/insights  → Analytics & Metrics                │ │
│  │                                                          │ │
│  │  Services:                                              │ │
│  │  • Shopify Sync Service (API Integration)              │ │
│  │  • Scheduler (node-cron, every 6 hours)                │ │
│  │  • Authentication Middleware (JWT)                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Prisma ORM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        DATA LAYER                            │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              PostgreSQL Database                        │ │
│  │                                                          │ │
│  │  Tables:                                                │ │
│  │  • User        → Authentication                         │ │
│  │  • Tenant      → Shopify Stores                         │ │
│  │  • Customer    → Customer Data (multi-tenant)           │ │
│  │  • Order       → Order Data (multi-tenant)              │ │
│  │  • OrderItem   → Order Line Items                       │ │
│  │  • Product     → Product Catalog (multi-tenant)         │ │
│  │  • Event       → Custom Events                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                        │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Shopify Admin API (2024-01)               │ │
│  │  • GET /customers.json                                 │ │
│  │  • GET /orders.json                                    │ │
│  │  • GET /products.json                                  │ │
│  │  • Webhooks (orders/create, customers/create, etc.)   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5.7
- **Authentication**: JWT + bcrypt
- **Scheduling**: node-cron
- **API Client**: Axios

### Frontend
- **Framework**: Next.js 14
- **UI Library**: React 18
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Styling**: CSS-in-JS

### DevOps
- **Version Control**: Git
- **Package Manager**: npm
- **Database Migrations**: Prisma Migrate
- **Environment**: dotenv

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:
- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ installed and running ([Download](https://www.postgresql.org/download/))
- **Git** installed ([Download](https://git-scm.com/))
- A code editor (VS Code recommended)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/xeno-shopify-insights.git
cd xeno-shopify-insights
```

### Step 2: Install Dependencies

```bash
# Install all dependencies (backend + frontend)
npm run install:all
```

This will install dependencies for both backend and frontend.

### Step 3: Setup Backend

#### 3.1 Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/xeno_shopify"

# JWT Secret (generate a strong random string)
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long"

# Server Port
PORT=5000

# Shopify Configuration (optional for demo)
SHOPIFY_API_KEY="your-shopify-api-key"
SHOPIFY_API_SECRET="your-shopify-api-secret"
SHOPIFY_SCOPES="read_products,read_orders,read_customers"
```

**Generate JWT Secret:**
```bash
# On Mac/Linux
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### 3.2 Setup Database

```bash
# Create database (if not exists)
createdb xeno_shopify

# Run migrations
npm run db:migrate

# Seed demo data (creates 3 stores with sample data)
npm run db:seed
```

**What gets seeded:**
- 1 demo user (demo@xeno.com / demo123)
- 3 demo stores (Fashion Boutique, Tech Gadgets, Home & Living)
- 15 products (5 per store)
- 15 customers (5 per store)
- Multiple orders with realistic data

### Step 4: Setup Frontend

```bash
cd ../frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Note:** Do NOT include `/api` in the URL. It's added automatically in the code.

### Step 5: Run the Application

#### Option 1: Run Both Servers Together (Recommended)

```bash
# From project root
npm run dev
```

This starts both backend and frontend simultaneously.

#### Option 2: Run Servers Separately

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Server runs on http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm run dev
# App runs on http://localhost:3000
```

### Step 6: Access the Application

1. Open your browser to **http://localhost:3000**
2. You'll see the login page
3. Login with demo credentials:
   - **Email**: `demo@xeno.com`
   - **Password**: `demo123`
4. Explore the 3 pre-populated stores! 🎉

---

## 🛍️ Shopify Setup

To connect your own Shopify store:

### Option 1: Using Demo Data (Recommended for Testing)

The application comes with 3 pre-populated demo stores. Just run `npm run db:seed` and login with `demo@xeno.com` / `demo123`.

### Option 2: Connect Real Shopify Store

#### Step 1: Create Shopify Development Store

1. Go to [Shopify Partners](https://partners.shopify.com/)
2. Sign up for a free account
3. Click **Stores** → **Add store** → **Development store**
4. Fill in store details and create

#### Step 2: Add Sample Data to Your Store

1. Go to your Shopify admin
2. Add some products:
   - **Products** → **Add product**
   - Add at least 5 products with prices
3. Add some customers:
   - **Customers** → **Add customer**
   - Add at least 5 customers with emails
4. Create some orders:
   - **Orders** → **Create order**
   - Create at least 10 orders

#### Step 3: Get Shopify API Credentials

**Method A: Using Custom App (Recommended)**

1. In Shopify admin, go to **Settings** → **Apps and sales channels**
2. Click **Develop apps** → **Allow custom app development**
3. Click **Create an app**
4. Name it "Xeno Insights"
5. Go to **Configuration** tab
6. Under **Admin API access scopes**, select:
   - `read_customers`
   - `read_orders`
   - `read_products`
7. Click **Save**
8. Go to **API credentials** tab
9. Click **Install app**
10. Copy the **Admin API access token** (starts with `shpat_`)

**Method B: Using Private App (Legacy)**

1. In Shopify admin, go to **Apps**
2. Click **Manage private apps** (at bottom)
3. Click **Create new private app**
4. Fill in app details
5. Under **Admin API**, select:
   - Read access for Customers
   - Read access for Orders
   - Read access for Products
6. Click **Save**
7. Copy the **Admin API access token**

#### Step 4: Add Store to Application

1. Login to the application
2. Click **"Add Store"** button
3. Fill in the form:
   - **Store Name**: My Shopify Store
   - **Shopify Domain**: `your-store.myshopify.com`
   - **Access Token**: `shpat_xxxxxxxxxxxxx` (from Step 3)
4. Click **"Add Store"**
5. Click **"Sync Data"** to import your Shopify data

#### Step 5: Verify Data Sync

1. Check the dashboard for your store
2. You should see:
   - Total customers count
   - Total orders count
   - Total revenue
   - Charts with your data

### Automated Sync

The application automatically syncs data every 6 hours. You can also:
- Click **"Sync Data"** button for manual sync
- Set up Shopify webhooks for real-time updates (see Advanced Setup)

### Troubleshooting Shopify Connection

**Error: "Invalid access token"**
- Verify the token is correct
- Ensure token hasn't expired
- Check you have the required scopes

**Error: "Can't connect to Shopify"**
- Verify the domain is correct (format: `store.myshopify.com`)
- Check your internet connection
- Ensure Shopify store is active

**No data showing after sync**
- Check backend logs for errors
- Verify your store has products, customers, and orders
- Try manual sync again

---

## 🎮 Demo Credentials

After running `npm run db:seed`, you can login with:

**Email:** `demo@xeno.com`  
**Password:** `demo123`

### Pre-populated Demo Stores

#### 1. Fashion Boutique
- **Products**: Summer Dress, Leather Jacket, Designer Handbag, Sunglasses, Running Shoes
- **Customers**: Emma Wilson, James Brown, Sophia Davis, Oliver Miller, Ava Garcia
- **Orders**: 15-25 orders per customer with realistic data

#### 2. Tech Gadgets Store
- **Products**: Wireless Earbuds, Smart Watch, Laptop Stand, USB-C Hub, Mechanical Keyboard
- **Customers**: Liam Johnson, Isabella Martinez, Noah Anderson, Mia Taylor, Ethan Thomas
- **Orders**: 10-20 orders per customer with realistic data

#### 3. Home & Living
- **Products**: Ceramic Vase, Throw Pillow Set, Wall Art Canvas, Scented Candles, Coffee Table Book
- **Customers**: Charlotte White, William Harris, Amelia Clark, Benjamin Lewis, Harper Walker
- **Orders**: 8-15 orders per customer with realistic data

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│    User     │
│─────────────│
│ id (PK)     │
│ email       │
│ password    │
│ name        │
│ createdAt   │
└─────────────┘
       │
       │ 1:N (owns)
       ▼
┌─────────────┐
│   Tenant    │
│─────────────│
│ id (PK)     │
│ name        │
│ shopifyDomain│
│ accessToken │
│ userId (FK) │
└─────────────┘
       │
       ├──────────┬──────────┬──────────┐
       │ 1:N      │ 1:N      │ 1:N      │ 1:N
       ▼          ▼          ▼          ▼
┌──────────┐ ┌────────┐ ┌─────────┐ ┌───────┐
│ Customer │ │ Order  │ │ Product │ │ Event │
│──────────│ │────────│ │─────────│ │───────│
│ id (PK)  │ │ id (PK)│ │ id (PK) │ │ id    │
│shopifyId │ │shopifyId│ │shopifyId│ │type   │
│tenantId  │ │tenantId│ │tenantId │ │data   │
│email     │ │customerId│ │title   │ └───────┘
│firstName │ │orderNum│ │price    │
│lastName  │ │total   │ └─────────┘
│totalSpent│ │date    │
└──────────┘ └────────┘
                 │
                 │ 1:N
                 ▼
           ┌───────────┐
           │ OrderItem │
           │───────────│
           │ id (PK)   │
           │ orderId   │
           │ productId │
           │ quantity  │
           │ price     │
           └───────────┘
```

### Table Definitions

#### User
```sql
- id: UUID (Primary Key)
- email: String (Unique)
- password: String (Hashed with bcrypt)
- name: String
- createdAt: DateTime
- updatedAt: DateTime
```

#### Tenant
```sql
- id: UUID (Primary Key)
- name: String
- shopifyDomain: String (Unique)
- shopifyAccessToken: String
- userId: UUID (Foreign Key → User)
- createdAt: DateTime
- updatedAt: DateTime
```

#### Customer
```sql
- id: UUID (Primary Key)
- shopifyId: String
- tenantId: UUID (Foreign Key → Tenant)
- email: String
- firstName: String
- lastName: String
- ordersCount: Integer
- totalSpent: Float
- createdAt: DateTime
- updatedAt: DateTime
- UNIQUE(shopifyId, tenantId)
```

#### Order
```sql
- id: UUID (Primary Key)
- shopifyId: String
- tenantId: UUID (Foreign Key → Tenant)
- customerId: UUID (Foreign Key → Customer)
- orderNumber: String
- totalPrice: Float
- currency: String
- financialStatus: String
- fulfillmentStatus: String
- orderDate: DateTime
- createdAt: DateTime
- updatedAt: DateTime
- UNIQUE(shopifyId, tenantId)
```

#### Product
```sql
- id: UUID (Primary Key)
- shopifyId: String
- tenantId: UUID (Foreign Key → Tenant)
- title: String
- vendor: String
- productType: String
- price: Float
- createdAt: DateTime
- updatedAt: DateTime
- UNIQUE(shopifyId, tenantId)
```

#### OrderItem
```sql
- id: UUID (Primary Key)
- orderId: UUID (Foreign Key → Order)
- productId: UUID (Foreign Key → Product)
- title: String
- quantity: Integer
- price: Float
- createdAt: DateTime
```

### Multi-Tenancy Implementation

Data isolation is achieved through:
1. **Tenant ID in all data models** - Every customer, order, and product has a tenantId
2. **Row-level filtering** - All queries automatically filter by tenantId
3. **Composite unique keys** - (shopifyId, tenantId) prevents duplicates per tenant
4. **User-tenant relationship** - Users can only access their own tenants
5. **JWT token validation** - Ensures user owns the tenant before operations

---

## 🔌 API Documentation

### Base URL
```
Local: http://localhost:5000
Production: https://your-app.onrender.com
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token-here"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token-here"
}
```

---

### Tenant Management Endpoints

#### Get All Stores
```http
GET /api/tenants
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Fashion Boutique",
    "shopifyDomain": "fashion-boutique.myshopify.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Add New Store
```http
POST /api/tenants
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My Store",
  "shopifyDomain": "mystore.myshopify.com",
  "shopifyAccessToken": "shpat_xxxxxxxxxxxxx"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "My Store",
  "shopifyDomain": "mystore.myshopify.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### Shopify Integration Endpoints

#### Manual Sync
```http
POST /api/shopify/sync/{tenantId}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Sync completed successfully"
}
```

#### Webhook Handler
```http
POST /api/shopify/webhook
X-Shopify-Topic: orders/create
X-Shopify-Shop-Domain: mystore.myshopify.com
Content-Type: application/json
```

---

### Analytics Endpoints

#### Get Overview Metrics
```http
GET /api/insights/{tenantId}/overview
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "totalCustomers": 150,
  "totalOrders": 450,
  "totalRevenue": 45000.00
}
```

#### Get Orders by Date
```http
GET /api/insights/{tenantId}/orders-by-date?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "orderDate": "2024-01-01T00:00:00.000Z",
    "_sum": { "totalPrice": 1500.00 },
    "_count": 15
  }
]
```

#### Get Top Customers
```http
GET /api/insights/{tenantId}/top-customers
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "email": "customer@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "totalSpent": 5000.00,
    "ordersCount": 25
  }
]
```

#### Get Advanced Analytics
```http
GET /api/insights/{tenantId}/advanced
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "newCustomersThisMonth": 25,
  "revenueThisMonth": 12000.00,
  "revenueGrowth": 15.5,
  "customerGrowth": 10.2,
  "orderStatusDistribution": [...],
  "topProducts": [...],
  "customerSegments": [...],
  "repeatCustomerRate": 45.5,
  "avgDaysBetweenOrders": 30
}
```

### Health Check
```http
GET /health
```

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🚀 Deployment

### Quick Deploy Options

#### Option 1: Railway + Vercel (Recommended)
- **Backend**: Railway ($5 credit, no sleep)
- **Frontend**: Vercel (free)
- **Database**: Railway PostgreSQL (included)
- **Setup Time**: ~11 minutes
- **Cost**: Free first month

#### Option 2: Render + Vercel
- **Backend**: Render (free, sleeps after 15 min)
- **Frontend**: Vercel (free)
- **Database**: Supabase (free, forever)
- **Setup Time**: ~20 minutes
- **Cost**: $0

### Deployment Guides

- **Complete Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Render Specific**: See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
- **Platform Comparison**: See [DEPLOYMENT_COMPARISON.md](./DEPLOYMENT_COMPARISON.md)

### Environment Variables

**Backend:**
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
PORT=5000
NODE_ENV=production
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

---

## 📚 Documentation

### Complete Documentation (25+ Files)

- **[START_HERE.md](./START_HERE.md)** - Your starting point
- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute setup
- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Technical deep dive
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture diagrams
- **[API_REFERENCE.md](./API_REFERENCE.md)** - Complete API docs
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide
- **[RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)** - Render guide
- **[DEMO_VIDEO_SCRIPT.md](./DEMO_VIDEO_SCRIPT.md)** - Video guide
- **[FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)** - Submission checklist
- **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - All docs index

---

## 🧪 Testing

### Run Tests

```bash
# Backend tests (if implemented)
cd backend
npm test

# Frontend tests (if implemented)
cd frontend
npm test
```

### Manual Testing

Follow the comprehensive [TESTING_GUIDE.md](./TESTING_GUIDE.md) which includes:
- 26 test cases
- API endpoint testing
- Frontend testing
- Integration testing
- Browser testing

---

## 🛠️ Development Commands

### Backend Commands

```bash
cd backend

# Development
npm run dev              # Start dev server with nodemon

# Database
npm run db:migrate       # Run migrations
npm run db:generate      # Generate Prisma client
npm run db:seed          # Seed demo data
npm run db:studio        # Open Prisma Studio (DB GUI)

# Production
npm start                # Start production server
```

### Frontend Commands

```bash
cd frontend

# Development
npm run dev              # Start Next.js dev server

# Production
npm run build            # Build for production
npm start                # Start production server
```

### Root Commands

```bash
# Run both servers
npm run dev              # Start backend + frontend

# Install all dependencies
npm run install:all      # Install backend + frontend deps
```

---

## 🔒 Security Features

- **Authentication**: JWT tokens with 7-day expiry
- **Password Hashing**: bcrypt with 10 rounds
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **CORS**: Configured for specific origins
- **Environment Variables**: Sensitive data in .env files
- **Multi-tenant Isolation**: Row-level data filtering
- **Input Validation**: Request validation on all endpoints

---

## 📈 Performance & Scalability

### Current Architecture
- Suitable for: 1-100 tenants
- Single server instance
- Direct database connections
- Synchronous processing

### Scaling Path

**Phase 1: Optimize (100-1,000 tenants)**
- Add Redis caching
- Database connection pooling
- Query optimization
- CDN for static assets

**Phase 2: Horizontal Scale (1,000-10,000 tenants)**
- Multiple API instances
- Load balancer
- Job queue (Bull/RabbitMQ)
- Read replicas
- Microservices architecture

**Phase 3: Enterprise (10,000+ tenants)**
- Kubernetes orchestration
- Database sharding
- Event-driven architecture
- Multi-region deployment
- Auto-scaling policies

---

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run db:generate
npm run dev
```

**Frontend shows "undefined/tenants":**
- Check `frontend/.env.local` exists
- Verify `NEXT_PUBLIC_API_URL=http://localhost:5000`
- Restart frontend server

**Database connection failed:**
- Verify `DATABASE_URL` in `backend/.env`
- Check PostgreSQL is running
- Test connection: `psql $DATABASE_URL`

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built for the **Xeno Forward Deployed Engineer (FDE) Internship** assignment
- Shopify Admin API for data integration
- Next.js and React for the frontend framework
- Prisma for the excellent ORM
- Recharts for beautiful visualizations

---

## 📞 Support

For questions or issues:
- Check the [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)
- Review [TROUBLESHOOTING](./QUICKSTART.md#troubleshooting) section
- Open an issue on GitHub

---

## 🌟 Project Stats

```
Total Files:            60+
Lines of Code:          3,000+
Documentation Pages:    25+
API Endpoints:          11
Database Tables:        7
Demo Stores:            3
Features:               50+
Setup Time:             5 minutes
```

---

**Built with ❤️ for Xeno**

*Ready to help enterprise retailers leverage their data!* 🚀
