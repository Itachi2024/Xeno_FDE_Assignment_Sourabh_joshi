import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function syncShopifyData(tenant) {
  const { shopifyDomain, shopifyAccessToken, id: tenantId } = tenant;
  
  if (!shopifyAccessToken) {
    throw new Error('Shopify access token not configured');
  }

  const shopifyAPI = axios.create({
    baseURL: `https://${shopifyDomain}/admin/api/2024-01`,
    headers: {
      'X-Shopify-Access-Token': shopifyAccessToken,
      'Content-Type': 'application/json'
    }
  });

  try {
    console.log(`🔄 Starting sync for tenant: ${tenant.name}`);

    // Sync Customers
    console.log('  → Syncing customers...');
    await syncCustomers(shopifyAPI, tenantId);
    
    // Sync Products
    console.log('  → Syncing products...');
    await syncProducts(shopifyAPI, tenantId);
    
    // Sync Orders
    console.log('  → Syncing orders...');
    await syncOrders(shopifyAPI, tenantId);

    console.log(`✅ Sync completed for tenant: ${tenant.name}`);
  } catch (error) {
    console.error(`❌ Sync failed for tenant ${tenant.name}:`, error.message);
    throw error;
  }
}

async function syncCustomers(api, tenantId) {
  const { data } = await api.get('/customers.json');
  
  for (const customer of data.customers) {
    await prisma.customer.upsert({
      where: {
        shopifyId_tenantId: {
          shopifyId: customer.id.toString(),
          tenantId
        }
      },
      update: {
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        ordersCount: customer.orders_count || 0,
        totalSpent: parseFloat(customer.total_spent || 0)
      },
      create: {
        shopifyId: customer.id.toString(),
        tenantId,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        ordersCount: customer.orders_count || 0,
        totalSpent: parseFloat(customer.total_spent || 0)
      }
    });
  }
}

async function syncProducts(api, tenantId) {
  const { data } = await api.get('/products.json');
  
  for (const product of data.products) {
    await prisma.product.upsert({
      where: {
        shopifyId_tenantId: {
          shopifyId: product.id.toString(),
          tenantId
        }
      },
      update: {
        title: product.title,
        vendor: product.vendor,
        productType: product.product_type,
        price: product.variants?.[0]?.price ? parseFloat(product.variants[0].price) : null
      },
      create: {
        shopifyId: product.id.toString(),
        tenantId,
        title: product.title,
        vendor: product.vendor,
        productType: product.product_type,
        price: product.variants?.[0]?.price ? parseFloat(product.variants[0].price) : null
      }
    });
  }
}

async function syncOrders(api, tenantId) {
  const { data } = await api.get('/orders.json?status=any');
  
  for (const order of data.orders) {
    const customer = order.customer ? await prisma.customer.findFirst({
      where: {
        shopifyId: order.customer.id.toString(),
        tenantId
      }
    }) : null;

    const createdOrder = await prisma.order.upsert({
      where: {
        shopifyId_tenantId: {
          shopifyId: order.id.toString(),
          tenantId
        }
      },
      update: {
        orderNumber: order.order_number.toString(),
        totalPrice: parseFloat(order.total_price),
        currency: order.currency,
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status,
        orderDate: new Date(order.created_at)
      },
      create: {
        shopifyId: order.id.toString(),
        tenantId,
        customerId: customer?.id,
        orderNumber: order.order_number.toString(),
        totalPrice: parseFloat(order.total_price),
        currency: order.currency,
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status,
        orderDate: new Date(order.created_at)
      }
    });

    // Sync order items
    for (const item of order.line_items) {
      const product = await prisma.product.findFirst({
        where: {
          shopifyId: item.product_id?.toString(),
          tenantId
        }
      });

      await prisma.orderItem.create({
        data: {
          orderId: createdOrder.id,
          productId: product?.id,
          title: item.title,
          quantity: item.quantity,
          price: parseFloat(item.price)
        }
      });
    }
  }
}
