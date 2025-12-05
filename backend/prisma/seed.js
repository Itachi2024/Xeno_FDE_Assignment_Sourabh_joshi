import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@xeno.com' },
    update: {},
    create: {
      email: 'demo@xeno.com',
      password: hashedPassword,
      name: 'Demo User'
    }
  });
  console.log('✅ Created demo user:', user.email);

  // Create 3 demo tenants (stores)
  const stores = [
    {
      name: 'Fashion Boutique',
      shopifyDomain: 'fashion-boutique-demo.myshopify.com',
      products: [
        { title: 'Summer Dress', vendor: 'Fashion Co', productType: 'Clothing', price: 89.99 },
        { title: 'Leather Jacket', vendor: 'Fashion Co', productType: 'Clothing', price: 249.99 },
        { title: 'Designer Handbag', vendor: 'Luxury Brands', productType: 'Accessories', price: 399.99 },
        { title: 'Sunglasses', vendor: 'Fashion Co', productType: 'Accessories', price: 129.99 },
        { title: 'Running Shoes', vendor: 'SportWear', productType: 'Footwear', price: 159.99 }
      ],
      customers: [
        { firstName: 'Emma', lastName: 'Wilson', email: 'emma.wilson@example.com' },
        { firstName: 'James', lastName: 'Brown', email: 'james.brown@example.com' },
        { firstName: 'Sophia', lastName: 'Davis', email: 'sophia.davis@example.com' },
        { firstName: 'Oliver', lastName: 'Miller', email: 'oliver.miller@example.com' },
        { firstName: 'Ava', lastName: 'Garcia', email: 'ava.garcia@example.com' }
      ]
    },
    {
      name: 'Tech Gadgets Store',
      shopifyDomain: 'tech-gadgets-demo.myshopify.com',
      products: [
        { title: 'Wireless Earbuds', vendor: 'TechBrand', productType: 'Electronics', price: 79.99 },
        { title: 'Smart Watch', vendor: 'TechBrand', productType: 'Electronics', price: 299.99 },
        { title: 'Laptop Stand', vendor: 'OfficeSupply', productType: 'Accessories', price: 49.99 },
        { title: 'USB-C Hub', vendor: 'TechBrand', productType: 'Accessories', price: 39.99 },
        { title: 'Mechanical Keyboard', vendor: 'Gaming Pro', productType: 'Accessories', price: 149.99 }
      ],
      customers: [
        { firstName: 'Liam', lastName: 'Johnson', email: 'liam.johnson@example.com' },
        { firstName: 'Isabella', lastName: 'Martinez', email: 'isabella.martinez@example.com' },
        { firstName: 'Noah', lastName: 'Anderson', email: 'noah.anderson@example.com' },
        { firstName: 'Mia', lastName: 'Taylor', email: 'mia.taylor@example.com' },
        { firstName: 'Ethan', lastName: 'Thomas', email: 'ethan.thomas@example.com' }
      ]
    },
    {
      name: 'Home & Living',
      shopifyDomain: 'home-living-demo.myshopify.com',
      products: [
        { title: 'Ceramic Vase', vendor: 'HomeDecor', productType: 'Decor', price: 34.99 },
        { title: 'Throw Pillow Set', vendor: 'ComfortHome', productType: 'Textiles', price: 59.99 },
        { title: 'Wall Art Canvas', vendor: 'ArtStudio', productType: 'Decor', price: 89.99 },
        { title: 'Scented Candles', vendor: 'Aromatics', productType: 'Home Fragrance', price: 24.99 },
        { title: 'Coffee Table Book', vendor: 'Publishers', productType: 'Books', price: 45.99 }
      ],
      customers: [
        { firstName: 'Charlotte', lastName: 'White', email: 'charlotte.white@example.com' },
        { firstName: 'William', lastName: 'Harris', email: 'william.harris@example.com' },
        { firstName: 'Amelia', lastName: 'Clark', email: 'amelia.clark@example.com' },
        { firstName: 'Benjamin', lastName: 'Lewis', email: 'benjamin.lewis@example.com' },
        { firstName: 'Harper', lastName: 'Walker', email: 'harper.walker@example.com' }
      ]
    }
  ];

  for (const storeData of stores) {
    console.log(`\n📦 Creating store: ${storeData.name}`);
    
    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: storeData.name,
        shopifyDomain: storeData.shopifyDomain,
        userId: user.id
      }
    });
    console.log(`  ✅ Created tenant: ${tenant.name}`);

    // Create products
    const createdProducts = [];
    for (const productData of storeData.products) {
      const product = await prisma.product.create({
        data: {
          shopifyId: `prod_${Math.random().toString(36).substr(2, 9)}`,
          tenantId: tenant.id,
          ...productData
        }
      });
      createdProducts.push(product);
    }
    console.log(`  ✅ Created ${createdProducts.length} products`);

    // Create customers
    const createdCustomers = [];
    for (const customerData of storeData.customers) {
      const customer = await prisma.customer.create({
        data: {
          shopifyId: `cust_${Math.random().toString(36).substr(2, 9)}`,
          tenantId: tenant.id,
          ...customerData,
          ordersCount: 0,
          totalSpent: 0
        }
      });
      createdCustomers.push(customer);
    }
    console.log(`  ✅ Created ${createdCustomers.length} customers`);

    // Create orders for each customer
    let totalOrders = 0;
    for (const customer of createdCustomers) {
      const numOrders = Math.floor(Math.random() * 5) + 1; // 1-5 orders per customer
      
      for (let i = 0; i < numOrders; i++) {
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 90)); // Random date in last 90 days
        
        const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
        const selectedProducts = [];
        const orderItems = [];
        let orderTotal = 0;

        for (let j = 0; j < numItems; j++) {
          const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
          const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 quantity
          const itemPrice = product.price || 50;
          
          selectedProducts.push(product);
          orderItems.push({
            productId: product.id,
            title: product.title,
            quantity,
            price: itemPrice
          });
          orderTotal += itemPrice * quantity;
        }

        const order = await prisma.order.create({
          data: {
            shopifyId: `order_${Math.random().toString(36).substr(2, 9)}`,
            tenantId: tenant.id,
            customerId: customer.id,
            orderNumber: `${1000 + totalOrders}`,
            totalPrice: orderTotal,
            currency: 'USD',
            financialStatus: ['paid', 'pending', 'refunded'][Math.floor(Math.random() * 3)],
            fulfillmentStatus: ['fulfilled', 'unfulfilled', 'partial'][Math.floor(Math.random() * 3)],
            orderDate,
            items: {
              create: orderItems
            }
          }
        });

        // Update customer stats
        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            ordersCount: { increment: 1 },
            totalSpent: { increment: orderTotal }
          }
        });

        totalOrders++;
      }
    }
    console.log(`  ✅ Created ${totalOrders} orders with items`);
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Demo Credentials:');
  console.log('   Email: demo@xeno.com');
  console.log('   Password: demo123');
  console.log('\n📊 Created:');
  console.log(`   - 1 demo user`);
  console.log(`   - 3 stores (tenants)`);
  console.log(`   - 15 products (5 per store)`);
  console.log(`   - 15 customers (5 per store)`);
  console.log(`   - Multiple orders with items`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
