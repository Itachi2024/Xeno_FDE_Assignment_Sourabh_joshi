// src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import tenantRoutes from './routes/tenant.js';
import shopifyRoutes from './routes/shopify.js';
import insightsRoutes from './routes/insights.js';
import { startSyncScheduler } from './services/scheduler.js';
import debugRoutes from "./routes/debug.js";


dotenv.config();
console.log("[ENV-DEBUG] DATABASE_URL present?", !!process.env.DATABASE_URL);
console.log(
  "[ENV-DEBUG] DATABASE_URL preview:",
  (process.env.DATABASE_URL || "")
    .slice(0, 80)
    .replace(/:[^:]+@/, "/:*****@")
);


const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins - update these as needed
const allowedOrigins = [
  'https://xeno-trial-3.vercel.app', // production frontend
  'http://localhost:3000',           // local dev
];

// Prevent edge caching of CORS responses (helps avoid stale preflight responses)
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// CORS options — echo the exact origin when allowed (required when credentials: true)
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., server-to-server or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, origin);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Apply CORS middleware BEFORE body parser and routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight

// Built-in body parser
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/shopify', shopifyRoutes);
app.use('/api/insights', insightsRoutes);
app.use("/debug", debugRoutes);


// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start scheduler for periodic sync
startSyncScheduler();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
