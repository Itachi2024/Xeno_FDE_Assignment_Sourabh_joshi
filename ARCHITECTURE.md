# System Architecture Diagram

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                         Web Browser                               │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │  │
│  │  │   Login    │  │ Dashboard  │  │  Analytics │  │   Tenant  │ │  │
│  │  │   Page     │  │    Page    │  │   Charts   │  │  Manager  │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └───────────┘ │  │
│  │                      Next.js 14 + React                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS (REST API)
                                    │ JWT Authentication
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                              │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      Express.js API Server                        │  │
│  │                                                                    │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │  │
│  │  │    Auth     │  │   Tenant    │  │  Insights   │             │  │
│  │  │   Routes    │  │   Routes    │  │   Routes    │             │  │
│  │  │  /api/auth  │  │/api/tenants │  │/api/insights│             │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │  │
│  │                                                                    │  │
│  │  ┌─────────────┐  ┌─────────────┐                               │  │
│  │  │  Shopify    │  │  Webhook    │                               │  │
│  │  │   Routes    │  │   Handler   │                               │  │
│  │  │/api/shopify │  │             │                               │  │
│  │  └─────────────┘  └─────────────┘                               │  │
│  │                                                                    │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │              Middleware Layer                             │   │  │
│  │  │  • JWT Authentication                                     │   │  │
│  │  │  • Request Validation                                     │   │  │
│  │  │  • Error Handling                                         │   │  │
│  │  │  • CORS Configuration                                     │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      Background Services                          │  │
│  │                                                                    │  │
│  │  ┌─────────────────┐         ┌─────────────────┐               │  │
│  │  │  Sync Scheduler │         │  Shopify Sync   │               │  │
│  │  │  (node-cron)    │────────▶│    Service      │               │  │
│  │  │  Every 6 hours  │         │                 │               │  │
│  │  └─────────────────┘         └─────────────────┘               │  │
│  │                                      │                           │  │
│  │                                      │ Fetches data              │  │
│  │                                      ▼                           │  │
│  │                              ┌─────────────────┐                │  │
│  │                              │  Shopify API    │                │  │
│  │                              │    Client       │                │  │
│  │                              └─────────────────┘                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Prisma ORM
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                    │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      PostgreSQL Database                          │  │
│  │                                                                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │  │
│  │  │  Users   │  │ Tenants  │  │Customers │  │  Orders  │        │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │  │
│  │                                                                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                       │  │
│  │  │ Products │  │OrderItems│  │  Events  │                       │  │
│  │  └──────────┘  └──────────┘  └──────────┘                       │  │
│  │                                                                    │  │
│  │  Indexes: tenantId, shopifyId, orderDate, customerId            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Backup & Replication
                                    ▼
                          ┌──────────────────────┐
                          │   Backup Storage     │
                          └──────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                                │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Shopify Admin API                              │  │
│  │                                                                    │  │
│  │  • GET /admin/api/2024-01/customers.json                         │  │
│  │  • GET /admin/api/2024-01/orders.json                            │  │
│  │  • GET /admin/api/2024-01/products.json                          │  │
│  │  • Webhooks: orders/create, customers/create, etc.               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. User Authentication Flow

```
┌──────┐                ┌──────────┐              ┌──────────┐
│Client│                │  Backend │              │ Database │
└──┬───┘                └────┬─────┘              └────┬─────┘
   │                         │                         │
   │ POST /api/auth/login    │                         │
   │ {email, password}       │                         │
   ├────────────────────────▶│                         │
   │                         │                         │
   │                         │ Query user by email     │
   │                         ├────────────────────────▶│
   │                         │                         │
   │                         │ User record             │
   │                         │◀────────────────────────┤
   │                         │                         │
   │                         │ Verify password         │
   │                         │ (bcrypt.compare)        │
   │                         │                         │
   │                         │ Generate JWT token      │
   │                         │                         │
   │ {user, token}           │                         │
   │◀────────────────────────┤                         │
   │                         │                         │
   │ Store token in          │                         │
   │ localStorage            │                         │
   │                         │                         │
```

### 2. Shopify Data Sync Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│Scheduler │         │  Sync    │         │ Shopify  │         │ Database │
│(Cron Job)│         │ Service  │         │   API    │         │          │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                     │                     │
     │ Trigger sync       │                     │                     │
     │ (every 6 hours)    │                     │                     │
     ├───────────────────▶│                     │                     │
     │                    │                     │                     │
     │                    │ Get all tenants     │                     │
     │                    ├────────────────────────────────────────────▶
     │                    │                     │                     │
     │                    │ Tenant list         │                     │
     │                    │◀────────────────────────────────────────────
     │                    │                     │                     │
     │                    │ For each tenant:    │                     │
     │                    │                     │                     │
     │                    │ GET /customers.json │                     │
     │                    ├────────────────────▶│                     │
     │                    │                     │                     │
     │                    │ Customer data       │                     │
     │                    │◀────────────────────┤                     │
     │                    │                     │                     │
     │                    │ Upsert customers    │                     │
     │                    ├────────────────────────────────────────────▶
     │                    │                     │                     │
     │                    │ GET /products.json  │                     │
     │                    ├────────────────────▶│                     │
     │                    │                     │                     │
     │                    │ Product data        │                     │
     │                    │◀────────────────────┤                     │
     │                    │                     │                     │
     │                    │ Upsert products     │                     │
     │                    ├────────────────────────────────────────────▶
     │                    │                     │                     │
     │                    │ GET /orders.json    │                     │
     │                    ├────────────────────▶│                     │
     │                    │                     │                     │
     │                    │ Order data          │                     │
     │                    │◀────────────────────┤                     │
     │                    │                     │                     │
     │                    │ Upsert orders       │                     │
     │                    │ + order items       │                     │
     │                    ├────────────────────────────────────────────▶
     │                    │                     │                     │
     │ Sync complete      │                     │                     │
     │◀───────────────────┤                     │                     │
     │                    │                     │                     │
```

### 3. Dashboard Analytics Flow

```
┌──────┐              ┌──────────┐              ┌──────────┐
│Client│              │  Backend │              │ Database │
└──┬───┘              └────┬─────┘              └────┬─────┘
   │                       │                         │
   │ GET /insights/        │                         │
   │ {tenantId}/overview   │                         │
   ├──────────────────────▶│                         │
   │                       │                         │
   │                       │ Verify JWT token        │
   │                       │ Check tenant ownership  │
   │                       │                         │
   │                       │ COUNT customers         │
   │                       ├────────────────────────▶│
   │                       │                         │
   │                       │ COUNT orders            │
   │                       ├────────────────────────▶│
   │                       │                         │
   │                       │ SUM order.totalPrice    │
   │                       ├────────────────────────▶│
   │                       │                         │
   │                       │ Aggregated results      │
   │                       │◀────────────────────────┤
   │                       │                         │
   │ {totalCustomers,      │                         │
   │  totalOrders,         │                         │
   │  totalRevenue}        │                         │
   │◀──────────────────────┤                         │
   │                       │                         │
   │ Render charts         │                         │
   │ (Recharts)            │                         │
   │                       │                         │
```

## Multi-Tenancy Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Multi-Tenant Isolation                    │
└─────────────────────────────────────────────────────────────┘

User A                          User B
  │                               │
  ├─ Tenant 1 (Store A)          ├─ Tenant 3 (Store C)
  │   ├─ Customers               │   ├─ Customers
  │   ├─ Orders                  │   ├─ Orders
  │   └─ Products                │   └─ Products
  │                               │
  └─ Tenant 2 (Store B)          └─ Tenant 4 (Store D)
      ├─ Customers                   ├─ Customers
      ├─ Orders                      ├─ Orders
      └─ Products                    └─ Products

┌─────────────────────────────────────────────────────────────┐
│              Data Isolation Mechanisms                       │
│                                                               │
│  1. Tenant ID in every table                                │
│  2. Row-level filtering in all queries                      │
│  3. Composite unique keys (shopifyId + tenantId)            │
│  4. User-tenant ownership validation                        │
│  5. JWT token contains userId for authorization             │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Production Setup                        │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   Cloudflare │
                    │      CDN     │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
    ┌──────────────────┐      ┌──────────────────┐
    │  Vercel (Frontend)│      │ Railway (Backend)│
    │                  │      │                  │
    │  • Next.js App   │      │  • Express API   │
    │  • Static Assets │      │  • Cron Jobs     │
    │  • Edge Functions│      │  • Webhooks      │
    └──────────────────┘      └────────┬─────────┘
                                       │
                                       │
                              ┌────────┴─────────┐
                              │                  │
                              ▼                  ▼
                    ┌──────────────┐   ┌──────────────┐
                    │  PostgreSQL  │   │    Redis     │
                    │  (Supabase)  │   │  (Optional)  │
                    │              │   │              │
                    │  • Primary DB│   │  • Caching   │
                    │  • Backups   │   │  • Sessions  │
                    └──────────────┘   └──────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
└─────────────────────────────────────────────────────────────┘

Layer 1: Network Security
  • HTTPS/TLS encryption
  • CORS configuration
  • Rate limiting

Layer 2: Authentication
  • JWT tokens (7-day expiry)
  • Bcrypt password hashing (10 rounds)
  • Secure token storage

Layer 3: Authorization
  • User-tenant ownership validation
  • Role-based access control (future)
  • API endpoint protection

Layer 4: Data Security
  • Encrypted Shopify tokens
  • SQL injection prevention (Prisma)
  • Input validation
  • XSS protection

Layer 5: Monitoring
  • Error logging
  • Audit trails
  • Anomaly detection (future)
```

## Scalability Considerations

```
Current Architecture (MVP)
  • Single server instance
  • Direct database connections
  • Synchronous processing
  • Suitable for: 1-100 tenants

Future Scalability Path
  ├─ Phase 1: Optimize (100-1000 tenants)
  │   ├─ Add Redis caching
  │   ├─ Database connection pooling
  │   ├─ Query optimization
  │   └─ CDN for static assets
  │
  ├─ Phase 2: Scale Horizontally (1000-10000 tenants)
  │   ├─ Multiple API server instances
  │   ├─ Load balancer
  │   ├─ Job queue (Bull/RabbitMQ)
  │   ├─ Read replicas
  │   └─ Microservices architecture
  │
  └─ Phase 3: Enterprise Scale (10000+ tenants)
      ├─ Kubernetes orchestration
      ├─ Database sharding
      ├─ Event-driven architecture
      ├─ Multi-region deployment
      └─ Auto-scaling policies
```
