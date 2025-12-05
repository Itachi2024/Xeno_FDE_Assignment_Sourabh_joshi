// src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import tenantRoutes from './routes/tenant.js';
import shopifyRoutes from './routes/shopify.js';
import insightsRoutes from './routes/insights.js';
import { startSyncScheduler } from './services/scheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins - update these as needed
const allowedOrigins = [
  'https://xeno-trial-3.vercel.app', // production frontend
  'http://localhost:3000',           // local dev
];

// CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (e.g., mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: Origin not allowed'), false);
  },
  credentials: true, // set to true if you use cookies / authentication that requires credentials
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Apply CORS middleware BEFORE your routes
app.use(cors(corsOptions));

// Ensure preflight requests are handled
app.options('*', cors(corsOptions));

// Built-in body parser
app.use(express.json());

// Routes (after CORS and body parser)
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/shopify', shopifyRoutes);
app.use('/api/insights', insightsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start scheduler for periodic sync
startSyncScheduler();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
