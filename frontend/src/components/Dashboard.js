'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { format, subDays } from 'date-fns';

const COLORS = ['#5469d4', '#60a5fa', '#34d399', '#fbbf24', '#f87171'];

export default function Dashboard({ tenant }) {
  const [overview, setOverview] = useState(null);
  const [topCustomers, setTopCustomers] = useState([]);
  const [ordersByDate, setOrdersByDate] = useState([]);
  const [advancedMetrics, setAdvancedMetrics] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (tenant) {
      fetchData();
    }
  }, [tenant, dateRange]);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      const [overviewRes, customersRes, ordersRes, advancedRes] = await Promise.all([
        axios.get(`${baseUrl}/api/insights/${tenant.id}/overview`, config),
        axios.get(`${baseUrl}/api/insights/${tenant.id}/top-customers`, config),
        axios.get(`${baseUrl}/api/insights/${tenant.id}/orders-by-date?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, config),
        axios.get(`${baseUrl}/api/insights/${tenant.id}/advanced`, config)
      ]);

      setOverview(overviewRes.data);
      setTopCustomers(customersRes.data);
      setOrdersByDate(ordersRes.data.map(o => ({
        date: format(new Date(o.orderDate), 'MMM dd'),
        revenue: o._sum.totalPrice || 0,
        orders: o._count
      })));
      setAdvancedMetrics(advancedRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading dashboard...</div>;

  const avgOrderValue = overview?.totalOrders > 0 ? overview.totalRevenue / overview.totalOrders : 0;
  const customerLifetimeValue = overview?.totalCustomers > 0 ? overview.totalRevenue / overview.totalCustomers : 0;

  return (
    <div>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.9 }}>Total Customers</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{overview?.totalCustomers || 0}</p>
          <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
            {advancedMetrics?.newCustomersThisMonth || 0} new this month
          </p>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.9 }}>Total Orders</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{overview?.totalOrders || 0}</p>
          <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
            Avg: ${avgOrderValue.toFixed(2)} per order
          </p>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.9 }}>Total Revenue</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>${overview?.totalRevenue?.toFixed(2) || 0}</p>
          <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
            ${advancedMetrics?.revenueThisMonth?.toFixed(2) || 0} this month
          </p>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.9 }}>Customer LTV</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>${customerLifetimeValue.toFixed(2)}</p>
          <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
            Lifetime value per customer
          </p>
        </div>
      </div>

      {/* Revenue & Orders Trend */}
      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Revenue & Orders Trend</h2>
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '14px', fontWeight: '500' }}>From:</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            style={{ width: 'auto' }}
          />
          <label style={{ fontSize: '14px', fontWeight: '500' }}>To:</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            style={{ width: 'auto' }}
          />
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={ordersByDate}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5469d4" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#5469d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#5469d4" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue ($)" />
            <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#f87171" strokeWidth={2} name="Orders" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px', marginTop: '20px' }}>
        
        {/* Order Status Distribution */}
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>Order Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={advancedMetrics?.orderStatusDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {(advancedMetrics?.orderStatusDistribution || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>Top 5 Products by Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={advancedMetrics?.topProducts || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="title" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#5469d4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px', marginTop: '20px' }}>
        
        {/* Top Customers Table */}
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>Top 5 Customers by Spend</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Customer</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Orders</th>
                <th style={{ padding: '12px' }}>Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((customer, idx) => (
                <tr key={customer.id} style={{ borderBottom: '1px solid #eee', background: idx % 2 === 0 ? '#fafafa' : 'white' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>
                    {customer.firstName} {customer.lastName}
                  </td>
                  <td style={{ padding: '12px', color: '#666' }}>{customer.email}</td>
                  <td style={{ padding: '12px' }}>{customer.ordersCount}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#5469d4' }}>
                    ${customer.totalSpent.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Customer Segments */}
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>Customer Segments</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(advancedMetrics?.customerSegments || []).map((segment, idx) => (
              <div key={idx} style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600', fontSize: '16px' }}>{segment.name}</span>
                  <span style={{ fontWeight: 'bold', color: COLORS[idx % COLORS.length] }}>
                    {segment.count} customers
                  </span>
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>{segment.description}</div>
                <div style={{ marginTop: '8px', fontSize: '14px' }}>
                  Avg Spend: <strong>${segment.avgSpend?.toFixed(2) || 0}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h2 style={{ marginBottom: '20px' }}>Growth Metrics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
            <div style={{ fontSize: '14px', color: '#166534', marginBottom: '8px' }}>Revenue Growth</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#15803d' }}>
              {advancedMetrics?.revenueGrowth?.toFixed(1) || 0}%
            </div>
            <div style={{ fontSize: '12px', color: '#166534', marginTop: '4px' }}>vs last month</div>
          </div>
          <div style={{ padding: '20px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #93c5fd' }}>
            <div style={{ fontSize: '14px', color: '#1e40af', marginBottom: '8px' }}>Customer Growth</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a8a' }}>
              {advancedMetrics?.customerGrowth?.toFixed(1) || 0}%
            </div>
            <div style={{ fontSize: '12px', color: '#1e40af', marginTop: '4px' }}>vs last month</div>
          </div>
          <div style={{ padding: '20px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d' }}>
            <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '8px' }}>Repeat Customer Rate</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#78350f' }}>
              {advancedMetrics?.repeatCustomerRate?.toFixed(1) || 0}%
            </div>
            <div style={{ fontSize: '12px', color: '#92400e', marginTop: '4px' }}>of all customers</div>
          </div>
          <div style={{ padding: '20px', background: '#fce7f3', borderRadius: '8px', border: '1px solid #f9a8d4' }}>
            <div style={{ fontSize: '14px', color: '#9f1239', marginBottom: '8px' }}>Avg Days Between Orders</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#881337' }}>
              {advancedMetrics?.avgDaysBetweenOrders?.toFixed(0) || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#9f1239', marginTop: '4px' }}>days</div>
          </div>
        </div>
      </div>
    </div>
  );
}
