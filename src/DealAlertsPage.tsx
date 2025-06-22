import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthUser } from './useAuthUser';

interface CarDeal {
  id: number;
  name: string;
  type: string;
  price: number;
  originalPrice: number;
  dealDescription: string;
  savings: number;
  dealType: 'price_drop' | 'financing' | 'cashback' | 'trade_in';
}

const DealAlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthUser();
  const [deals, setDeals] = useState<CarDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dummy data for demonstration
  const dummyDeals: CarDeal[] = [
    {
      id: 1,
      name: "2024 Tesla Model 3",
      type: "Electric Sedan",
      price: 38990,
      originalPrice: 42990,
      dealDescription: "🔥 Price Drop Alert! $4,000 off MSRP",
      savings: 4000,
      dealType: "price_drop"
    },
    {
      id: 2,
      name: "2024 BMW X3",
      type: "Luxury SUV",
      price: 48500,
      originalPrice: 52000,
      dealDescription: "💳 0% APR for 60 months + $2,500 cashback",
      savings: 3500,
      dealType: "financing"
    },
    {
      id: 3,
      name: "2024 Honda CR-V",
      type: "Compact SUV",
      price: 28900,
      originalPrice: 31500,
      dealDescription: "💰 $2,600 price reduction + $1,000 trade-in bonus",
      savings: 3600,
      dealType: "trade_in"
    },
    {
      id: 4,
      name: "2024 Ford Mustang",
      type: "Sports Car",
      price: 35900,
      originalPrice: 38500,
      dealDescription: "⚡ Flash Sale! $2,600 off + $500 cashback",
      savings: 3100,
      dealType: "cashback"
    },
    {
      id: 5,
      name: "2024 Toyota Camry",
      type: "Sedan",
      price: 26900,
      originalPrice: 29500,
      dealDescription: "🎯 Limited Time: $2,600 discount available",
      savings: 2600,
      dealType: "price_drop"
    }
  ];

  const getDealTypeIcon = (dealType: string) => {
    switch (dealType) {
      case 'price_drop': return '🔥';
      case 'financing': return '💳';
      case 'cashback': return '💰';
      case 'trade_in': return '🚗';
      default: return '🎯';
    }
  };

  useEffect(() => {
    if (user) {
      // Simulate API call with dummy data
      setTimeout(() => {
        setDeals(dummyDeals);
        setLoading(false);
      }, 1000);
    }
  }, [user]);

  const fetchDeals = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:8000/deals/${user.uid}`);
      const data = await response.json();
      if (data.success) {
        setDeals(data.deals);
      } else {
        setError(data.error || 'Failed to load deals.');
      }
    } catch (err) {
      // Fallback to dummy data if API fails
      setDeals(dummyDeals);
    } finally {
      setLoading(false);
    }
  };

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fdf2f8 0%, #ec4899 100%)',
    color: '#831843',
    padding: '40px 20px'
  };

  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)',
    borderRadius: 16,
    padding: 24,
    border: '1px solid #f472b6',
    boxShadow: '0 8px 25px rgba(236,72,153,0.15)',
    marginBottom: 24,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  };

  const statsCardStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    borderRadius: 12,
    padding: '20px',
    marginBottom: 30,
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(236,72,153,0.3)'
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#831843', marginBottom: 20 }}>Loading Deals...</h1>
          <div style={{ fontSize: '1.2rem', color: '#be185d' }}>Finding the best deals for you...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <h1 style={{ textAlign: 'center', color: '#dc2626' }}>Error: {error}</h1>
      </div>
    );
  }

  const totalSavings = deals.reduce((sum, deal) => sum + deal.savings, 0);

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#831843' }}>Watchlist Deals</h1>
        </div>

        {/* Stats Card */}
        <div style={statsCardStyle}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8, color: '#fff' }}>
            🎉 Total Potential Savings
          </h2>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fdf2f8' }}>
            ${totalSavings.toLocaleString()}
          </div>
          <p style={{ color: '#fce7f3', marginTop: 8 }}>
            Across {deals.length} vehicles in your watchlist
          </p>
        </div>

        {deals.length === 0 ? (
          <div style={{ ...cardStyle, justifyContent: 'center' }}>
            <p style={{ fontSize: '1.2rem', color: '#831843' }}>No new deals on your watched cars right now. Check back later!</p>
          </div>
        ) : (
          deals.map(deal => (
            <div key={deal.id} style={cardStyle}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8, color: '#831843' }}>{deal.name}</h2>
                <p style={{ color: '#be185d', marginBottom: 8 }}>{deal.type}</p>
                <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: 4 }}>
                  {getDealTypeIcon(deal.dealType)} {deal.dealDescription}
                </p>
                <p style={{ color: '#831843' }}>
                  <span style={{ textDecoration: 'line-through', marginRight: 8 }}>${deal.originalPrice.toLocaleString()}</span>
                  <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#059669' }}>${deal.price.toLocaleString()}</span>
                  <span style={{ color: '#059669', marginLeft: 8, fontSize: '0.9rem' }}>
                    (Save ${deal.savings.toLocaleString()})
                  </span>
                </p>
              </div>
              <button style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 8, 
                padding: '12px 24px', 
                fontWeight: 600, 
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}>
                View Details
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DealAlertsPage; 