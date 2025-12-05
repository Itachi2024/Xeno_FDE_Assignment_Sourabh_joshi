'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: '',
    shopifyDomain: '',
    shopifyAccessToken: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tenants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTenants(data);
      if (data.length > 0) setSelectedTenant(data[0]);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const handleAddTenant = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/tenants`, newTenant, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddTenant(false);
      setNewTenant({ name: '', shopifyDomain: '', shopifyAccessToken: '' });
      fetchTenants();
    } catch (error) {
      console.error('Error adding tenant:', error);
    }
  };

  const handleSync = async () => {
    if (!selectedTenant) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/shopify/sync/${selectedTenant.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Sync completed successfully!');
    } catch (error) {
      alert('Sync failed: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Xeno Shopify Insights</h1>
        <button onClick={handleLogout} className="btn">Logout</button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
          <select
            value={selectedTenant?.id || ''}
            onChange={(e) => setSelectedTenant(tenants.find(t => t.id === e.target.value))}
            style={{ flex: 1 }}
          >
            {tenants.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button onClick={() => setShowAddTenant(!showAddTenant)} className="btn btn-primary">
            Add Store
          </button>
          <button onClick={handleSync} className="btn btn-primary" disabled={!selectedTenant}>
            Sync Data
          </button>
        </div>

        {showAddTenant && (
          <form onSubmit={handleAddTenant} style={{ marginTop: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '16px' }}>Add New Shopify Store</h3>
            <input
              type="text"
              placeholder="Store Name"
              value={newTenant.name}
              onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Shopify Domain (e.g., mystore.myshopify.com)"
              value={newTenant.shopifyDomain}
              onChange={(e) => setNewTenant({ ...newTenant, shopifyDomain: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Shopify Access Token"
              value={newTenant.shopifyAccessToken}
              onChange={(e) => setNewTenant({ ...newTenant, shopifyAccessToken: e.target.value })}
              required
            />
            <button type="submit" className="btn btn-primary">Add Store</button>
          </form>
        )}
      </div>

      {selectedTenant && <Dashboard tenant={selectedTenant} />}
    </div>
  );
}
