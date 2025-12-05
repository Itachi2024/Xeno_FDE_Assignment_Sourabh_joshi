// src/routes/debug.js
import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

router.get('/db-check', async (req, res) => {
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT 1 AS ok`;
    return res.json({ ok: true, result });
  } catch (err) {
    console.error('[DB-CHECK] error:', err.message || err);
    return res.status(503).json({ ok: false, error: err.message });
  }
});

export default router;
