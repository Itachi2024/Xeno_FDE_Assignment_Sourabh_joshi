# Xeno Shopify Insights - Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Multi-tenancy Implementation](#multi-tenancy-implementation)
6. [Sync Strategy](#sync-strategy)
7. [Production Considerations](#production-considerations)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Auth Pages  │  │  Dashboard   │  │  Components  │      │
│  │  (Next.js)   │  │   (React)    │  │  (Recharts)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Backend Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Routes  │  │Insights API  │  │ Shopify Sync │      │
│  │   (JWT)      │  │  (Express)   │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  Scheduler   │  │   Webhooks   │                        │
│  │ (node-cron)  │  │   Handler    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Prisma ORM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Database Layer                           │
│                    PostgreSQL                                │
│  ┌──────────────────────────────────────────────────┐       │
│  │  Users │ Tenants │ Customers │ Orders │ Products │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│                     Shopify Admin API                        │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 14 (React framework with SSR)
- Recharts (Data visualization)
- Axios (HTTP client)
- date-fns (Date manipulation)

**Backend:**
- Node.js + Express.js
- Prisma ORM (Database abstraction)
- JWT (Authentication)
- node-cron (Task scheduling)
- @shopify/shopify-api (Shopify integration)

**Database:**
- PostgreSQL (Relational database)

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│    User     │
│─────────────│
│ id (PK)     │
│ email       │
│ password    │
│ name        │
└─────────────┘
       │
       │ 1:N
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
└──────────┘ └────────┘ └─────────┘ └───────┘
                 │
                 │ 1:N
                 ▼
           ┌───────────┐
           │ OrderItem │
           └───────────┘
```

### Table Definitions

#### User
```sql
- id: UUID (Primary Key)
- email: String (Unique)
- password: String (Hashed)
- name: String
- createdAt: DateTime
- updatedAt: DateTime
```

#### Tenant
```sql
- id: UUID (Primary Key)
- name: String
- shopifyDomain: String (Unique)
- shopifyAccessToken: String (Encrypted)
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

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token"
}
```

#### POST /api/auth/login
Authenticate existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token"
}
```

### Tenant Management Endpoints

#### GET /api/tenants
Get all tenants for authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "My Store",
    "shopifyDomain": "mystore.myshopify.com",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /api/tenants
Create a new tenant (Shopify store).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "name": "My Store",
  "shopifyDomain": "mystore.myshopify.com",
  "shopifyAccessToken": "shpat_xxxxx"
}
```

### Shopify Integration Endpoints

#### POST /api/shopify/sync/:tenantId
Manually trigger data sync for a tenant.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "Sync completed successfully"
}
```

#### POST /api/shopify/webhook
Receive Shopify webhooks (public endpoint).

**Headers:**
```
X-Shopify-Topic: orders/create
X-Shopify-Shop-Domain: mystore.myshopify.com
X-Shopify-Hmac-Sha256: <signature>
```

### Insights Endpoints

#### GET /api/insights/:tenantId/overview
Get overview metrics for a tenant.

**Response:**
```json
{
  "totalCustomers": 150,
  "totalOrders": 450,
  "totalRevenue": 45000.00
}
```

#### GET /api/insights/:tenantId/orders-by-date
Get orders grouped by date with optional filtering.

**Query Parameters:**
- startDate: YYYY-MM-DD
- endDate: YYYY-MM-DD

**Response:**
```json
[
  {
    "orderDate": "2024-01-01",
    "_sum": { "totalPrice": 1500.00 },
    "_count": 15
  }
]
```

#### GET /api/insights/:tenantId/top-customers
Get top 5 customers by total spend.

**Response:**
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

#### GET /api/insights/:tenantId/advanced
Get advanced analytics metrics.

**Response:**
```json
{
  "newCustomersThisMonth": 25,
  "revenueThisMonth": 12000.00,
  "revenueGrowth": 15.5,
  "customerGrowth": 10.2,
  "orderStatusDistribution": [
    { "name": "paid", "value": 120 },
    { "name": "pending", "value": 30 }
  ],
  "topProducts": [
    { "title": "Product A", "revenue": 5000.00 }
  ],
  "customerSegments": [
    {
      "name": "VIP Customers",
      "description": "Spent over $1,000",
      "count": 15,
      "avgSpend": 2500.00
    }
  ],
  "repeatCustomerRate": 45.5,
  "avgDaysBetweenOrders": 30
}
```

---

## Data Models

### Shopify Data Mapping

#### Customer Mapping
```javascript
Shopify Customer → Database Customer
{
  id → shopifyId
  email → email
  first_name → firstName
  last_name → lastName
  orders_count → ordersCount
  total_spent → totalSpent
}
```

#### Order Mapping
```javascript
Shopify Order → Database Order
{
  id → shopifyId
  order_number → orderNumber
  total_price → totalPrice
  currency → currency
  financial_status → financialStatus
  fulfillment_status → fulfillmentStatus
  created_at → orderDate
  customer.id → customerId (lookup)
  line_items → OrderItem[] (separate table)
}
```

#### Product Mapping
```javascript
Shopify Product → Database Product
{
  id → shopifyId
  title → title
  vendor → vendor
  product_type → productType
  variants[0].price → price
}
```

---

## Multi-tenancy Implementation

### Data Isolation Strategy

1. **Tenant Identifier**: Every data table includes a `tenantId` foreign key
2. **Query Filtering**: All queries automatically filter by `tenantId`
3. **Unique Constraints**: Composite unique keys on `(shopifyId, tenantId)`
4. **User-Tenant Relationship**: Users can own multiple tenants

### Example Query Pattern
```javascript
// Always include tenantId in queries
const customers = await prisma.customer.findMany({
  where: { tenantId: tenant.id }
});

// Upsert with composite unique key
await prisma.customer.upsert({
  where: {
    shopifyId_tenantId: {
      shopifyId: shopifyCustomer.id,
      tenantId: tenant.id
    }
  },
  update: { /* ... */ },
  create: { /* ... */ }
});
```

### Security Considerations

1. **Authorization**: Verify user owns tenant before operations
2. **Token Encryption**: Store Shopify access tokens encrypted
3. **API Rate Limiting**: Implement per-tenant rate limits
4. **Audit Logging**: Track all data access by tenant

---

## Sync Strategy

### Sync Methods

#### 1. Manual Sync
- Triggered by user via dashboard
- Immediate execution
- Full data refresh

#### 2. Scheduled Sync
- Runs every 6 hours via node-cron
- Automatic for all active tenants
- Incremental updates

#### 3. Webhook Sync (Future)
- Real-time updates from Shopify
- Event-driven architecture
- Specific entity updates

### Sync Process Flow

```
1. Fetch Shopify Access Token
2. Initialize Shopify API Client
3. Sync Customers
   ├─ Fetch from Shopify API
   ├─ Upsert to Database
   └─ Update customer metrics
4. Sync Products
   ├─ Fetch from Shopify API
   └─ Upsert to Database
5. Sync Orders
   ├─ Fetch from Shopify API
   ├─ Lookup Customer ID
   ├─ Upsert Order
   └─ Create Order Items
6. Log Completion
```

### Error Handling

- Per-tenant error isolation
- Retry logic for transient failures
- Error logging and notifications
- Graceful degradation

---

## Production Considerations

### Security Enhancements

1. **OAuth Flow**: Implement Shopify OAuth instead of manual tokens
2. **Token Encryption**: Encrypt access tokens at rest
3. **HTTPS Only**: Enforce SSL/TLS
4. **Rate Limiting**: Add express-rate-limit
5. **Input Validation**: Use Joi or Zod for request validation
6. **CORS Configuration**: Whitelist specific origins

### Scalability Improvements

1. **Database Optimization**
   - Add indexes on frequently queried columns
   - Implement connection pooling
   - Use read replicas for analytics

2. **Caching Layer**
   - Redis for session management
   - Cache frequently accessed data
   - Implement cache invalidation strategy

3. **Job Queue**
   - Use Bull/BullMQ for async processing
   - Separate sync jobs from API requests
   - Implement job prioritization

4. **Horizontal Scaling**
   - Stateless API design
   - Load balancer configuration
   - Session store in Redis

### Monitoring & Observability

1. **Error Tracking**: Sentry or Rollbar
2. **Performance Monitoring**: New Relic or DataDog
3. **Logging**: Winston with log aggregation
4. **Uptime Monitoring**: Pingdom or UptimeRobot
5. **Metrics Dashboard**: Grafana + Prometheus

### Deployment Strategy

1. **CI/CD Pipeline**
   - GitHub Actions or GitLab CI
   - Automated testing
   - Staged deployments

2. **Environment Management**
   - Development, Staging, Production
   - Environment-specific configs
   - Secret management (AWS Secrets Manager)

3. **Database Migrations**
   - Prisma migrate in CI/CD
   - Backup before migrations
   - Rollback strategy

### Cost Optimization

1. **Database**: Use managed PostgreSQL (Supabase, Neon)
2. **Hosting**: Railway, Render, or Fly.io for backend
3. **Frontend**: Vercel or Netlify (free tier)
4. **CDN**: Cloudflare for static assets
5. **Monitoring**: Start with free tiers

---

## Assumptions Made

1. **Shopify API Version**: Using 2024-01 API version
2. **Single Currency**: Each store operates in one currency
3. **Access Tokens**: Manually obtained from Shopify admin
4. **Data Volume**: Optimized for small to medium stores (<10k orders)
5. **Sync Frequency**: 6-hour interval is sufficient
6. **Authentication**: Email/password is acceptable (no SSO)
7. **Browser Support**: Modern browsers only (ES6+)
8. **Time Zone**: All timestamps in UTC

---

## Known Limitations

1. **No OAuth Flow**: Requires manual token generation
2. **Limited Webhook Support**: Basic implementation only
3. **No Real-time Updates**: Relies on periodic sync
4. **Basic Analytics**: Advanced metrics need more computation
5. **No Export Functionality**: Data export not implemented
6. **Single Region**: No multi-region deployment
7. **No Mobile App**: Web-only interface

---

## Future Enhancements

1. **Advanced Analytics**
   - Cohort analysis
   - Customer lifetime value prediction
   - Churn prediction
   - Product recommendation engine

2. **Automation**
   - Automated email campaigns
   - Customer segmentation rules
   - Alert notifications

3. **Integrations**
   - Multiple e-commerce platforms
   - Marketing tools (Mailchimp, SendGrid)
   - CRM systems

4. **UI/UX**
   - Mobile responsive design
   - Dark mode
   - Customizable dashboards
   - Export to PDF/Excel

---

## License

MIT License - See LICENSE file for details
