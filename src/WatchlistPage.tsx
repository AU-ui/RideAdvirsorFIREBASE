import React, { useEffect, useState } from 'react';
import { useAuthUser } from './useAuthUser';

interface Car {
  id: number;
  name: string;
  type: string;
  price: number;
}

const bgStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0a2342 0%, #1e3a5c 100%)',
  padding: 40,
  position: 'relative',
  overflow: 'hidden',
};

const animatedBgStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  zIndex: 0,
  pointerEvents: 'none',
  background: 'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(37, 99, 235, 0.1) 0%, transparent 40%)',
  animation: 'bgMove 15s linear infinite alternate',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(30, 58, 92, 0.5)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  borderRadius: 18,
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  padding: 24,
  minWidth: 200,
  maxWidth: 260,
  textAlign: 'center',
  marginBottom: 24,
  transition: 'transform 0.25s cubic-bezier(.4,2,.6,1), box-shadow 0.25s',
  cursor: 'pointer',
};

const cardHoverStyle: React.CSSProperties = {
  transform: 'scale(1.04) translateY(-4px)',
  boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
  border: '1px solid rgba(59, 130, 246, 0.4)',
};

const buttonStyle: React.CSSProperties = {
  background: 'linear-gradient(45deg, #3b82f6, #2563eb)',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '10px 22px',
  fontWeight: 600,
  fontSize: 15,
  cursor: 'pointer',
  marginTop: 12,
  transition: 'background 0.2s, transform 0.2s',
  boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
};

const removeBtnStyle: React.CSSProperties = {
  ...buttonStyle,
  background: 'linear-gradient(45deg, #ef4444, #dc2626)',
  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
};

const WatchlistPage: React.FC = () => {
  const user = useAuthUser();
  const [search, setSearch] = useState('');
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [watchlist, setWatchlist] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Fetch all cars (for search)
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8001/cars')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.cars)) {
          setAllCars(data.cars);
        }
      })
      .catch(() => setError('Failed to load cars'))
      .finally(() => setLoading(false));
  }, []);

  // Fetch user's watchlist
  useEffect(() => {
    if (user) {
      setLoading(true);
      fetch(`http://localhost:8001/user/watchlist/${user.uid}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.watchlist)) {
            setWatchlist(data.watchlist);
          }
        })
        .catch(() => setError('Failed to load watchlist'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  // Add car to watchlist
  const addToWatchlist = async (car: Car) => {
    if (!user) return;
    setActionMsg('');
    try {
      const res = await fetch(`http://localhost:8001/user/watchlist/${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId: car.id })
      });
      const data = await res.json();
      if (data.success) {
        setWatchlist(prev => [...prev, car]);
        setActionMsg('Added to watchlist!');
        
        // Log interaction for ML training
        await fetch('http://localhost:8001/interaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            carId: car.id,
            type: 'watchlist_add',
            details: {
              source: 'watchlist_page',
              carType: car.type,
              carPrice: car.price
            }
          })
        });
      } else {
        setActionMsg('Failed to add to watchlist.');
      }
    } catch {
      setActionMsg('Failed to add to watchlist.');
    }
  };

  // Remove car from watchlist
  const removeFromWatchlist = async (carId: number) => {
    if (!user) return;
    setActionMsg('');
    try {
      const res = await fetch(`http://localhost:8001/user/watchlist/${user.uid}/${carId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setWatchlist(prev => prev.filter(car => car.id !== carId));
        setActionMsg('Removed from watchlist!');
        
        // Log interaction for ML training
        await fetch('http://localhost:8001/interaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            carId: carId,
            type: 'watchlist_remove',
            details: {
              source: 'watchlist_page'
            }
          })
        });
      } else {
        setActionMsg('Failed to remove from watchlist.');
      }
    } catch {
      setActionMsg('Failed to remove from watchlist.');
    }
  };

  // Filter cars by search
  const filteredCars = allCars.filter(car =>
    car.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (actionMsg) {
      const timer = setTimeout(() => setActionMsg(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [actionMsg]);

  return (
    <div style={bgStyle}>
      <style>{`
        @keyframes bgMove {
          0% { background-position: 0% 0%, 100% 100%; }
          100% { background-position: 100% 100%, 0% 0%; }
        }
        @keyframes fadeInSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInSlideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .interactive-button:hover {
          transform: scale(1.05);
        }
      `}</style>
      <div style={animatedBgStyle}></div>
      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: 32, 
          color: '#fff', 
          letterSpacing: 1.5, 
          fontSize: '2.5rem', 
          fontWeight: 800,
          animation: 'fadeInSlideDown 0.6s ease-out forwards',
        }}>
          Watchlist
        </h1>
        <div style={{ 
          marginBottom: 32, 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 16,
          animation: 'scaleIn 0.7s 0.2s ease-out forwards',
          opacity: 0,
        }}>
          <input
            type="text"
            placeholder="Search cars..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              padding: 12, 
              borderRadius: 10, 
              border: '2px solid rgba(59, 130, 246, 0.3)', 
              minWidth: 280, 
              fontSize: 16, 
              background: 'rgba(10, 35, 66, 0.8)',
              color: '#fff'
            }}
          />
        </div>
        <h2 style={{ 
          marginBottom: 24, 
          color: '#93c5fd',
          animation: 'fadeInSlideUp 0.5s 0.4s ease-out forwards',
          opacity: 0,
        }}>
          Search Results
        </h2>
        {loading ? <div style={{color: '#fff'}}>Loading...</div> : error ? <div style={{ color: '#fca5a5' }}>{error}</div> : (
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 40, justifyContent: 'center' }}>
            {filteredCars.map((car, index) => (
              <div
                key={car.id}
                style={{
                  ...(hoveredCard === car.id ? { ...cardStyle, ...cardHoverStyle } : cardStyle),
                  animation: `fadeInSlideUp 0.5s ${0.5 + index * 0.07}s ease-out forwards`,
                  opacity: 0,
                }}
                onMouseEnter={() => setHoveredCard(car.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: '#fff' }}>{car.name}</h3>
                <p style={{ color: '#93c5fd', fontSize: 15, marginBottom: 6 }}>Type: {car.type}</p>
                <p style={{ color: '#dbeafe', fontSize: 15, fontWeight: 600 }}>Price: ${car.price.toLocaleString()}</p>
                <button
                  onClick={() => addToWatchlist(car)}
                  style={buttonStyle}
                  className="interactive-button"
                  disabled={watchlist.some(w => w.id === car.id)}
                >
                  {watchlist.some(w => w.id === car.id) ? 'In Watchlist' : 'Add to Watchlist'}
                </button>
              </div>
            ))}
          </div>
        )}
        <h2 style={{ 
          marginBottom: 24, 
          color: '#93c5fd',
          animation: 'fadeInSlideUp 0.5s 0.6s ease-out forwards',
          opacity: 0,
        }}>
          Your Watchlist
        </h2>
        {watchlist.length === 0 ? <div style={{ color: '#93c5fd', textAlign: 'center', fontSize: '1.1rem' }}>No cars in your watchlist.</div> : (
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
            {watchlist.map((car, index) => (
              <div
                key={car.id}
                style={{
                  ...(hoveredCard === car.id ? { ...cardStyle, ...cardHoverStyle } : cardStyle),
                  animation: `fadeInSlideUp 0.5s ${0.7 + index * 0.07}s ease-out forwards`,
                  opacity: 0,
                }}
                onMouseEnter={() => setHoveredCard(car.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: '#fff' }}>{car.name}</h3>
                <p style={{ color: '#93c5fd', fontSize: 15, marginBottom: 6 }}>Type: {car.type}</p>
                <p style={{ color: '#dbeafe', fontSize: 15, fontWeight: 600 }}>Price: ${car.price.toLocaleString()}</p>
                <button
                  onClick={() => removeFromWatchlist(car.id)}
                  style={removeBtnStyle}
                  className="interactive-button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        {actionMsg && <div style={{ color: '#22c55e', textAlign: 'center', marginTop: 24, fontWeight: 600, fontSize: 16 }}>{actionMsg}</div>}
      </div>
    </div>
  );
};

export default WatchlistPage; 