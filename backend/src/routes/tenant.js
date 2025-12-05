import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

router.post('/', async (req, res) => {
  try {
    const { name, shopifyDomain, shopifyAccessToken } = req.body;
    
    const tenant = await prisma.tenant.create({
      data: {
        name,
        shopifyDomain,
        shopifyAccessToken,
        userId: req.user.userId
      }
    });

    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      where: { userId: req.user.userId },
      select: {
        id: true,
        name: true,
        shopifyDomain: true,
        createdAt: true
      }
    });
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
