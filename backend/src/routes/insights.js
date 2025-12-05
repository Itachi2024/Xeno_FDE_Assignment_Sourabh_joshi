import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

router.get('/:tenantId/overview', async (req, res) => {
  try {
    const { tenantId } = req.params;

    const [totalCustomers, totalOrders, revenueData] = await Promise.all([
      prisma.customer.count({ where: { tenantId } }),
      prisma.order.count({ where: { tenantId } }),
      prisma.order.aggregate({
        where: { tenantId },
        _sum: { totalPrice: true }
      })
    ]);

    res.json({
      totalCustomers,
      totalOrders,
      totalRevenue: revenueData._sum.totalPrice || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:tenantId/orders-by-date', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { startDate, endDate } = req.query;

    const where = { tenantId };
    if (startDate && endDate) {
      where.orderDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const orders = await prisma.order.groupBy({
      by: ['orderDate'],
      where,
      _sum: { totalPrice: true },
      _count: true,
      orderBy: { orderDate: 'asc' }
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:tenantId/top-customers', async (req, res) => {
  try {
    const { tenantId } = req.params;

    const topCustomers = await prisma.customer.findMany({
      where: { tenantId },
      orderBy: { totalSpent: 'desc' },
      take: 5,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        totalSpent: true,
        ordersCount: true
      }
    });

    res.json(topCustomers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:tenantId/advanced', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // New customers this month
    const newCustomersThisMonth = await prisma.customer.count({
      where: { tenantId, createdAt: { gte: thisMonth } }
    });

    // Revenue this month
    const revenueThisMonthData = await prisma.order.aggregate({
      where: { tenantId, orderDate: { gte: thisMonth } },
      _sum: { totalPrice: true }
    });
    const revenueThisMonth = revenueThisMonthData._sum.totalPrice || 0;

    // Revenue last month
    const revenueLastMonthData = await prisma.order.aggregate({
      where: { 
        tenantId, 
        orderDate: { gte: lastMonth, lt: thisMonth }
      },
      _sum: { totalPrice: true }
    });
    const revenueLastMonth = revenueLastMonthData._sum.totalPrice || 1;

    // Customer growth
    const customersLastMonth = await prisma.customer.count({
      where: { tenantId, createdAt: { lt: thisMonth } }
    });
    const customersThisMonth = await prisma.customer.count({
      where: { tenantId }
    });
    const customerGrowth = customersLastMonth > 0 
      ? ((customersThisMonth - customersLastMonth) / customersLastMonth) * 100 
      : 0;

    // Revenue growth
    const revenueGrowth = revenueLastMonth > 0 
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 
      : 0;

    // Order status distribution
    const ordersByStatus = await prisma.order.groupBy({
      by: ['financialStatus'],
      where: { tenantId },
      _count: true
    });
    const orderStatusDistribution = ordersByStatus.map(s => ({
      name: s.financialStatus || 'Unknown',
      value: s._count
    }));

    // Top products by revenue
    const topProductsData = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: { 
        order: { tenantId },
        productId: { not: null }
      },
      _sum: { price: true },
      orderBy: { _sum: { price: 'desc' } },
      take: 5
    });

    const topProducts = await Promise.all(
      topProductsData.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        return {
          title: product?.title || 'Unknown',
          revenue: item._sum.price || 0
        };
      })
    );

    // Customer segments
    const allCustomers = await prisma.customer.findMany({
      where: { tenantId },
      select: { totalSpent: true, ordersCount: true }
    });

    const vipCustomers = allCustomers.filter(c => c.totalSpent > 1000);
    const regularCustomers = allCustomers.filter(c => c.totalSpent >= 100 && c.totalSpent <= 1000);
    const newCustomers = allCustomers.filter(c => c.totalSpent < 100);

    const customerSegments = [
      {
        name: 'VIP Customers',
        description: 'Spent over $1,000',
        count: vipCustomers.length,
        avgSpend: vipCustomers.length > 0 
          ? vipCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / vipCustomers.length 
          : 0
      },
      {
        name: 'Regular Customers',
        description: 'Spent $100 - $1,000',
        count: regularCustomers.length,
        avgSpend: regularCustomers.length > 0 
          ? regularCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / regularCustomers.length 
          : 0
      },
      {
        name: 'New Customers',
        description: 'Spent under $100',
        count: newCustomers.length,
        avgSpend: newCustomers.length > 0 
          ? newCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / newCustomers.length 
          : 0
      }
    ];

    // Repeat customer rate
    const repeatCustomers = allCustomers.filter(c => c.ordersCount > 1);
    const repeatCustomerRate = allCustomers.length > 0 
      ? (repeatCustomers.length / allCustomers.length) * 100 
      : 0;

    // Average days between orders (simplified calculation)
    const avgDaysBetweenOrders = 30; // Placeholder - would need more complex query

    res.json({
      newCustomersThisMonth,
      revenueThisMonth,
      revenueGrowth,
      customerGrowth,
      orderStatusDistribution,
      topProducts,
      customerSegments,
      repeatCustomerRate,
      avgDaysBetweenOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
