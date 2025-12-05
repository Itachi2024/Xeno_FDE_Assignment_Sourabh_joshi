# API Reference

Complete reference for all API endpoints in the Xeno Shopify Insights application.

---

## Base URL

**Local Development:**
```
http://localhost:5000
```

**Production:**
```
https://your-backend.railway.app
```

**Environment Variable:**
```env
# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Note:** Do NOT include `/api` in the base URL. The `/api` prefix is added in the route definitions.

---

## Authentication Endpoints

### Register User
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

**Errors:**
- `400` - User already exists
- `500` - Server error

---

### Login User
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

**Errors:**
- `401` - Invalid credentials
- `500` - Server error

---

## Tenant Management Endpoints

### Get All Tenants
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

**Errors:**
- `401` - Unauthorized (missing/invalid token)
- `500` - Server error

---

### Create Tenant
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
  "userId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:**
- `401` - Unauthorized
- `500` - Server error

---

## Shopify Integration Endpoints

### Manual Sync
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

**Errors:**
- `401` - Unauthorized
- `404` - Tenant not found
- `500` - Sync failed

---

### Webhook Handler
```http
POST /api/shopify/webhook
X-Shopify-Topic: orders/create
X-Shopify-Shop-Domain: mystore.myshopify.com
X-Shopify-Hmac-Sha256: signature
Content-Type: application/json

{
  // Shopify webhook payload
}
```

**Response (200):**
```
Webhook received
```

**Note:** This endpoint is called by Shopify, not by the frontend.

---

## Insights Endpoints

### Get Overview Metrics
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

**Errors:**
- `401` - Unauthorized
- `500` - Server error

---

### Get Orders by Date
```http
GET /api/insights/{tenantId}/orders-by-date?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

**Query Parameters:**
- `startDate` (optional) - Start date in YYYY-MM-DD format
- `endDate` (optional) - End date in YYYY-MM-DD format

**Response (200):**
```json
[
  {
    "orderDate": "2024-01-01T00:00:00.000Z",
    "_sum": {
      "totalPrice": 1500.00
    },
    "_count": 15
  }
]
```

**Errors:**
- `401` - Unauthorized
- `500` - Server error

---

### Get Top Customers
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

**Errors:**
- `401` - Unauthorized
- `500` - Server error

---

### Get Advanced Analytics
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
  "orderStatusDistribution": [
    {
      "name": "paid",
      "value": 120
    },
    {
      "name": "pending",
      "value": 30
    }
  ],
  "topProducts": [
    {
      "title": "Product A",
      "revenue": 5000.00
    }
  ],
  "customerSegments": [
    {
      "name": "VIP Customers",
      "description": "Spent over $1,000",
      "count": 15,
      "avgSpend": 2500.00
    },
    {
      "name": "Regular Customers",
      "description": "Spent $100 - $1,000",
      "count": 45,
      "avgSpend": 450.00
    },
    {
      "name": "New Customers",
      "description": "Spent under $100",
      "count": 90,
      "avgSpend": 45.00
    }
  ],
  "repeatCustomerRate": 45.5,
  "avgDaysBetweenOrders": 30
}
```

**Errors:**
- `401` - Unauthorized
- `500` - Server error

---

## Health Check

### Check Server Health
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

## Error Responses

All endpoints may return the following error format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

---

## Authentication Flow

### 1. Register or Login
```javascript
// Register
const response = await axios.post(`${API_URL}/api/auth/register`, {
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe'
});

// Or Login
const response = await axios.post(`${API_URL}/api/auth/login`, {
  email: 'user@example.com',
  password: 'password123'
});

const { token, user } = response.data;
```

### 2. Store Token
```javascript
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));
```

### 3. Use Token in Requests
```javascript
const token = localStorage.getItem('token');

const response = await axios.get(`${API_URL}/api/tenants`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

---

## Frontend API Usage Examples

### AuthForm Component
```javascript
const { data } = await axios.post(
  `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
  { email, password }
);
```

### Dashboard Component
```javascript
const token = localStorage.getItem('token');
const config = { headers: { Authorization: `Bearer ${token}` } };

// Get tenants
const { data } = await axios.get(
  `${process.env.NEXT_PUBLIC_API_URL}/api/tenants`,
  config
);

// Get insights
const overview = await axios.get(
  `${process.env.NEXT_PUBLIC_API_URL}/api/insights/${tenantId}/overview`,
  config
);
```

---

## Rate Limiting (Future)

Currently no rate limiting is implemented. For production, consider:

- 100 requests per 15 minutes per IP
- 1000 requests per hour per user
- Separate limits for sync operations

---

## CORS Configuration

The backend allows requests from:
- `http://localhost:3000` (development)
- Your production frontend domain (configure in production)

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@xeno.com","password":"demo123"}'
```

### Get Tenants (with token)
```bash
curl -X GET http://localhost:5000/api/tenants \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Overview
```bash
curl -X GET http://localhost:5000/api/insights/TENANT_ID/overview \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Testing with Postman

### Setup
1. Create new collection "Xeno Shopify API"
2. Add environment variable `baseUrl` = `http://localhost:5000`
3. Add environment variable `token` (will be set after login)

### Requests

**1. Register/Login**
- Method: POST
- URL: `{{baseUrl}}/api/auth/login`
- Body (JSON):
  ```json
  {
    "email": "demo@xeno.com",
    "password": "demo123"
  }
  ```
- Tests (to save token):
  ```javascript
  pm.environment.set("token", pm.response.json().token);
  ```

**2. Get Tenants**
- Method: GET
- URL: `{{baseUrl}}/api/tenants`
- Headers: `Authorization: Bearer {{token}}`

**3. Get Insights**
- Method: GET
- URL: `{{baseUrl}}/api/insights/{{tenantId}}/overview`
- Headers: `Authorization: Bearer {{token}}`

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/xeno_shopify"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
SHOPIFY_API_KEY="your-shopify-api-key"
SHOPIFY_API_SECRET="your-shopify-api-secret"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Important:** 
- Do NOT include `/api` in `NEXT_PUBLIC_API_URL`
- The `/api` prefix is added in the route definitions
- For production, use your deployed backend URL

---

## API Versioning (Future)

Currently using unversioned API. For future versions:

```
/api/v1/auth/login
/api/v1/tenants
/api/v1/insights/{tenantId}/overview
```

---

## WebSocket Support (Future)

For real-time updates, consider adding WebSocket support:

```javascript
// Connect to WebSocket
const socket = io(API_URL);

// Listen for sync updates
socket.on('sync:progress', (data) => {
  console.log('Sync progress:', data);
});

// Listen for data updates
socket.on('data:updated', (data) => {
  console.log('Data updated:', data);
});
```

---

## Summary

### All Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login user |
| GET | /api/tenants | Yes | Get user's stores |
| POST | /api/tenants | Yes | Add new store |
| POST | /api/shopify/sync/:tenantId | Yes | Manual sync |
| POST | /api/shopify/webhook | No | Webhook handler |
| GET | /api/insights/:tenantId/overview | Yes | Overview metrics |
| GET | /api/insights/:tenantId/orders-by-date | Yes | Orders by date |
| GET | /api/insights/:tenantId/top-customers | Yes | Top customers |
| GET | /api/insights/:tenantId/advanced | Yes | Advanced analytics |
| GET | /health | No | Health check |

---

**Total Endpoints:** 11  
**Authenticated Endpoints:** 8  
**Public Endpoints:** 3

---

For more information, see:
- DOCUMENTATION.md - Technical documentation
- ARCHITECTURE.md - Architecture diagrams
- DEPLOYMENT.md - Deployment guide
