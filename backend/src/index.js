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

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app'
  ]
}));
app.use(express.json());

// Routes
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
