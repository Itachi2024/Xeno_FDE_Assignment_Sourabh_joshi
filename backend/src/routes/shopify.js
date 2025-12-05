import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { syncShopifyData } from '../services/shopifySync.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

router.post('/sync/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const tenant = await prisma.tenant.findFirst({
      where: { id: tenantId, userId: req.user.userId }
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    await syncShopifyData(tenant);
    res.json({ message: 'Sync completed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const topic = req.headers['x-shopify-topic'];
    const shopDomain = req.headers['x-shopify-shop-domain'];
    
    // Handle different webhook topics
    console.log(`Received webhook: ${topic} from ${shopDomain}`);
    
    // Process webhook based on topic
    // Implementation depends on webhook type
    
    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
});

export default router;
