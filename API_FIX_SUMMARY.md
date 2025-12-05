# API URL Fix Summary

## ✅ What Was Fixed

All frontend API calls now correctly use the `/api/` prefix in their endpoints.

---

## 🔧 Changes Made

### 1. AuthForm Component (`frontend/src/components/AuthForm.js`)

**Before:**
```javascript
const endpoint = isLogin ? '/auth/login' : '/auth/register';
const { data } = await axios.post(
  `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
  formData
);
```

**After:**
```javascript
const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
const { data } = await axios.post(
  `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
  formData
);
```

---

### 2. Dashboard Page (`frontend/src/app/dashboard/page.js`)

**Before:**
```javascript
// Tenants endpoint was correct
await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants`, ...)

// Shopify sync was missing /api/
await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/shopify/sync/${selectedTenant.id}`, ...)
```

**After:**
```javascript
// Both now correct
await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants`, ...)
await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/shopify/sync/${selectedTenant.id}`, ...)
```

---

### 3. Dashboard Component (`frontend/src/components/Dashboard.js`)

**Before:**
```javascript
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

axios.get(`${baseUrl}/insights/${tenant.id}/overview`, config)
axios.get(`${baseUrl}/insights/${tenant.id}/top-customers`, config)
axios.get(`${baseUrl}/insights/${tenant.id}/orders-by-date?...`, config)
axios.get(`${baseUrl}/insights/${tenant.id}/advanced`, config)
```

**After:**
```javascript
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

axios.get(`${baseUrl}/api/insights/${tenant.id}/overview`, config)
axios.get(`${baseUrl}/api/insights/${tenant.id}/top-customers`, config)
axios.get(`${baseUrl}/api/insights/${tenant.id}/orders-by-date?...`, config)
axios.get(`${baseUrl}/api/insights/${tenant.id}/advanced`, config)
```

---

## 📝 Environment Variable Configuration

### Correct Format

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**NOT:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api  ❌
```

### Why?

The `/api` prefix is added in the route definitions, not in the base URL. This allows for:
- Cleaner configuration
- Easier to change API versioning in the future
- Consistent with REST API best practices

---

## ✅ All API Endpoints Now Use

### Authentication
- ✅ `POST ${API_URL}/api/auth/register`
- ✅ `POST ${API_URL}/api/auth/login`

### Tenants
- ✅ `GET ${API_URL}/api/tenants`
- ✅ `POST ${API_URL}/api/tenants`

### Shopify
- ✅ `POST ${API_URL}/api/shopify/sync/:tenantId`
- ✅ `POST ${API_URL}/api/shopify/webhook`

### Insights
- ✅ `GET ${API_URL}/api/insights/:tenantId/overview`
- ✅ `GET ${API_URL}/api/insights/:tenantId/orders-by-date`
- ✅ `GET ${API_URL}/api/insights/:tenantId/top-customers`
- ✅ `GET ${API_URL}/api/insights/:tenantId/advanced`

---

## 🧪 Testing

### Test Locally

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Login:**
   - Open http://localhost:3000
   - Login with demo@xeno.com / demo123
   - Should successfully authenticate

4. **Test Dashboard:**
   - Should see 3 stores in dropdown
   - Should see analytics data
   - Should be able to switch stores

### Test API Directly

```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@xeno.com","password":"demo123"}'

# Get tenants (replace TOKEN)
curl http://localhost:5000/api/tenants \
  -H "Authorization: Bearer TOKEN"
```

---

## 🚀 Production Configuration

### Backend (Railway/Render)

Environment variables:
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=production
```

### Frontend (Vercel)

Environment variable:
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

**Note:** Use your actual deployed backend URL, without `/api` suffix.

---

## 📚 Documentation Updated

Created new file: **API_REFERENCE.md**
- Complete API endpoint documentation
- Request/response examples
- Authentication flow
- Testing examples with cURL and Postman

---

## ✅ Verification Checklist

- [x] All frontend API calls use `/api/` prefix
- [x] Environment variable format is correct
- [x] AuthForm uses `/api/auth/login` and `/api/auth/register`
- [x] Dashboard uses `/api/tenants`
- [x] Shopify sync uses `/api/shopify/sync/:tenantId`
- [x] Insights endpoints use `/api/insights/:tenantId/...`
- [x] Documentation updated
- [x] API reference created

---

## 🎯 Summary

**Fixed:** 7 API endpoint calls  
**Files Modified:** 3 frontend files  
**Documentation Added:** API_REFERENCE.md  

All API calls now follow the correct pattern:
```
${NEXT_PUBLIC_API_URL}/api/{route}/{params}
```

Where `NEXT_PUBLIC_API_URL` is just the base URL without `/api`.

---

**Status:** ✅ All API calls are now correct and consistent!
