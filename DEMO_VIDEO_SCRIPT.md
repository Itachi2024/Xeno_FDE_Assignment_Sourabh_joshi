# Demo Video Script Guide

A structured guide for recording your 7-minute demo video for the Xeno FDE Internship assignment.

---

## 🎬 Video Structure (7 minutes total)

### 1. Introduction (30 seconds)

**What to say:**
> "Hi, I'm [Your Name], and I'm excited to present my submission for the Xeno Forward Deployed Engineer internship. I've built a multi-tenant Shopify Data Ingestion and Insights Service that helps enterprise retailers onboard, integrate, and analyze their customer data. Let me walk you through what I've built."

**What to show:**
- Your face (introduce yourself)
- Project title slide or README

---

### 2. Architecture Overview (1 minute)

**What to say:**
> "The application follows a three-tier architecture. The frontend is built with Next.js and React, providing a responsive dashboard with rich data visualizations using Recharts. The backend is an Express.js API that handles authentication, multi-tenant data management, and Shopify integration. All data is stored in PostgreSQL with Prisma ORM for type-safe database access. The system supports multiple tenants with complete data isolation, and includes automated sync scheduling every 6 hours using node-cron."

**What to show:**
- Open `ARCHITECTURE.md` and show the architecture diagram
- Briefly show the project structure in your IDE
- Highlight key folders: `backend/src/routes`, `frontend/src/components`

---

### 3. Live Application Demo (4 minutes)

#### 3.1 Authentication (20 seconds)

**What to say:**
> "Let me start by logging into the application. I've implemented JWT-based authentication with bcrypt password hashing for security."

**What to show:**
- Navigate to `http://localhost:3000`
- Show the login page
- Login with demo@xeno.com / demo123
- Briefly mention the registration flow

#### 3.2 Multi-Tenant Store Management (30 seconds)

**What to say:**
> "The application supports multiple Shopify stores per user. I've seeded three demo stores: Fashion Boutique, Tech Gadgets Store, and Home & Living. Each store has completely isolated data - customers, orders, and products are tenant-specific. Let me show you the Fashion Boutique first."

**What to show:**
- Show the store dropdown selector
- Highlight the "Add Store" button
- Select "Fashion Boutique" from dropdown

#### 3.3 Dashboard Analytics - Overview (40 seconds)

**What to say:**
> "The dashboard provides comprehensive analytics at a glance. These gradient KPI cards show total customers, orders, revenue, and customer lifetime value. Each card also displays growth metrics - for example, new customers this month and monthly revenue. The average order value and customer LTV help retailers understand their business performance."

**What to show:**
- Point to each KPI card
- Highlight the gradient designs
- Show the growth indicators

#### 3.4 Revenue Trends (30 seconds)

**What to say:**
> "This area chart visualizes revenue and order trends over time. Users can filter by date range to analyze specific periods. The dual-axis chart shows both revenue in dollars and order count, making it easy to spot trends and patterns."

**What to show:**
- Point to the area chart
- Change the date range filters
- Show how the chart updates

#### 3.5 Advanced Analytics (40 seconds)

**What to say:**
> "I've implemented several advanced visualizations. This pie chart shows order status distribution - paid, pending, and refunded orders. The horizontal bar chart displays top products by revenue, helping retailers identify their best sellers. Below that, we have customer segmentation breaking down VIP customers who've spent over $1000, regular customers, and new customers."

**What to show:**
- Point to the pie chart
- Scroll to the bar chart
- Show the customer segments section

#### 3.6 Top Customers & Growth Metrics (30 seconds)

**What to say:**
> "The top customers table shows the five highest-spending customers with their order count and total spend. And these growth metric cards display key performance indicators: revenue growth, customer growth, repeat customer rate, and average days between orders - all calculated from the actual data."

**What to show:**
- Scroll to the top customers table
- Point to the growth metrics cards
- Highlight the percentage values

#### 3.7 Multi-Tenant Switching (30 seconds)

**What to say:**
> "Now let me demonstrate the multi-tenant capability. When I switch to the Tech Gadgets Store, you'll see completely different data - different products, customers, and analytics. This demonstrates proper data isolation between tenants."

**What to show:**
- Switch to "Tech Gadgets Store" in dropdown
- Show how all data changes
- Briefly switch to "Home & Living" to show third store

---

### 4. Technical Deep Dive (1 minute 30 seconds)

#### 4.1 Code Structure (30 seconds)

**What to say:**
> "Let me show you the code structure. The backend follows a clean MVC pattern with separate routes for authentication, tenants, Shopify integration, and insights. The Prisma schema defines our multi-tenant data model with proper relationships and unique constraints."

**What to show:**
- Open `backend/src/routes/insights.js`
- Briefly show the advanced analytics endpoint
- Open `backend/prisma/schema.prisma`
- Highlight the Tenant model and relationships

#### 4.2 Multi-Tenancy Implementation (30 seconds)

**What to say:**
> "Multi-tenancy is implemented through tenant IDs in every table, with composite unique keys on shopifyId and tenantId. All queries are filtered by tenant ID, and I validate user-tenant ownership in the authentication middleware to ensure users can only access their own stores."

**What to show:**
- Show the Customer model in schema.prisma
- Point to the `@@unique([shopifyId, tenantId])` constraint
- Show the authentication middleware in `backend/src/middleware/auth.js`

#### 4.3 Shopify Sync Service (30 seconds)

**What to say:**
> "The Shopify sync service fetches customers, products, and orders from the Shopify Admin API and upserts them into our database. I've implemented a scheduler using node-cron that runs every 6 hours to keep data in sync. The service handles errors gracefully and logs progress for monitoring."

**What to show:**
- Open `backend/src/services/shopifySync.js`
- Show the syncShopifyData function
- Open `backend/src/services/scheduler.js`
- Show the cron schedule

---

### 5. Technical Decisions & Trade-offs (1 minute)

**What to say:**
> "Let me discuss some key technical decisions. I chose PostgreSQL for its robust support of complex queries and relationships needed for analytics. Prisma ORM provides type safety and makes multi-tenant queries clean and secure. For the frontend, Next.js gives us server-side rendering capabilities and excellent developer experience. Recharts was chosen for its React-native approach and extensive chart types.

> For trade-offs, I implemented a simplified sync mechanism instead of full OAuth flow to focus on core functionality. In production, I'd add OAuth, implement a job queue like Bull for async processing, add Redis for caching, and implement comprehensive error tracking with Sentry. I've documented all of these considerations in the DOCUMENTATION.md file."

**What to show:**
- Open `DOCUMENTATION.md`
- Scroll to "Production Considerations" section
- Show the "Next Steps for Production" section

---

### 6. Deployment & Documentation (30 seconds)

**What to say:**
> "The application is fully documented with setup instructions, architecture diagrams, API documentation, and deployment guides. I've created a comprehensive deployment guide for Railway, Render, and Vercel. The seed script I wrote generates realistic demo data for three different store types, making it easy to test and demonstrate the application."

**What to show:**
- Show the list of documentation files in the project
- Open `DEPLOYMENT.md` briefly
- Show `QUICKSTART.md`

---

### 7. Conclusion (30 seconds)

**What to say:**
> "To summarize, I've built a production-ready multi-tenant Shopify analytics platform with comprehensive data ingestion, advanced visualizations, automated sync scheduling, and proper security. The application demonstrates my ability to integrate with external APIs, design scalable multi-tenant architectures, and create intuitive user interfaces. I'm excited about the opportunity to work as a Forward Deployed Engineer at Xeno and help enterprise retailers leverage their data. Thank you for your time!"

**What to show:**
- Return to the dashboard showing the analytics
- Show your face for the closing

---

## 🎥 Recording Tips

### Before Recording:

1. **Prepare Your Environment**
   - Close unnecessary applications
   - Clear browser history/cache
   - Use incognito mode to avoid extensions
   - Ensure good lighting for face cam
   - Test microphone quality

2. **Have Everything Ready**
   - Application running (backend + frontend)
   - All documentation files open in IDE
   - Browser tabs organized
   - Script/notes visible (but don't read verbatim)

3. **Practice Run**
   - Do a complete run-through
   - Time yourself (aim for 6-7 minutes)
   - Identify any stumbling points

### During Recording:

1. **Audio Quality**
   - Speak clearly and at moderate pace
   - Avoid filler words (um, uh, like)
   - Pause briefly between sections
   - Maintain enthusiasm and energy

2. **Screen Recording**
   - Use OBS Studio, Loom, or similar
   - Record at 1080p minimum
   - Show your face in corner (optional but recommended)
   - Use cursor highlighting if available

3. **Navigation**
   - Move mouse smoothly
   - Don't rush through screens
   - Give viewers time to see what you're showing
   - Use zoom if showing code

### After Recording:

1. **Review**
   - Watch the entire video
   - Check audio sync
   - Verify all features are shown
   - Ensure time is under 7 minutes

2. **Edit (if needed)**
   - Cut long pauses
   - Add transitions between sections
   - Add text overlays for key points (optional)
   - Export in MP4 format

3. **Upload**
   - YouTube (unlisted)
   - Loom
   - Google Drive
   - Ensure link is accessible

---

## ✅ Demo Checklist

Before recording, ensure:

- [ ] Backend server is running without errors
- [ ] Frontend server is running without errors
- [ ] Database is seeded with demo data
- [ ] Can login with demo credentials
- [ ] All 3 stores are visible
- [ ] All charts render correctly
- [ ] Date filters work
- [ ] Store switching works
- [ ] No console errors in browser
- [ ] Good internet connection (if using cloud DB)

---

## 🎯 Key Points to Emphasize

1. **Multi-tenancy**: Complete data isolation between stores
2. **Scalability**: Clean architecture ready for production
3. **Security**: JWT auth, password hashing, tenant validation
4. **User Experience**: Intuitive dashboard, rich visualizations
5. **Code Quality**: Clean structure, proper error handling
6. **Documentation**: Comprehensive guides and diagrams
7. **Problem Solving**: Thoughtful technical decisions
8. **Completeness**: All assignment requirements met

---

## 📝 Alternative Script (Shorter Version - 5 minutes)

If you want a more concise version:

1. **Intro** (20s): Who you are, what you built
2. **Quick Architecture** (30s): Tech stack overview
3. **Live Demo** (2m 30s): Focus on key features only
4. **Code Highlights** (1m): Show 2-3 key files
5. **Trade-offs** (30s): Main technical decisions
6. **Conclusion** (20s): Summary and thank you

---

## 🚀 Bonus Points

To stand out even more:

- Show the Prisma Studio (database GUI)
- Demonstrate the sync functionality with a real Shopify store
- Show the mobile responsive design
- Mention specific Xeno use cases this could solve
- Discuss how you'd extend this for Xeno's needs

---

Good luck with your demo video! Remember to be yourself, show your passion for the work, and demonstrate your problem-solving approach. The Xeno team wants to see how you think and communicate, not just what you built. 🎉
