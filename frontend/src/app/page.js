'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm';

export default function Home() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '20px' }}>
        <div className="card">
          <h1 style={{ marginBottom: '24px', textAlign: 'center' }}>
            Xeno Shopify Insights
          </h1>
          <AuthForm isLogin={isLogin} />
          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              style={{ color: '#5469d4', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
