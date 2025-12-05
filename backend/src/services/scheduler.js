import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { syncShopifyData } from './shopifySync.js';

const prisma = new PrismaClient();

export function startSyncScheduler() {
  // Run sync every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('🔄 Starting scheduled sync...');
    
    try {
      const tenants = await prisma.tenant.findMany({
        where: {
          shopifyAccessToken: { not: null }
        }
      });

      for (const tenant of tenants) {
        try {
          await syncShopifyData(tenant);
        } catch (error) {
          console.error(`Failed to sync tenant ${tenant.name}:`, error.message);
        }
      }
      
      console.log('✅ Scheduled sync completed');
    } catch (error) {
      console.error('❌ Scheduled sync failed:', error);
    }
  });

  console.log('📅 Sync scheduler started (runs every 6 hours)');
}
