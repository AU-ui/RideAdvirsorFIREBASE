import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged, User } from 'firebase/auth';

const avatarDetails = {
  eco: {
    name: 'Eco Advisor',
    description: 'Recommends eco-friendly cars.',
    icon: '🌱',
  },
  luxury: {
    name: 'Luxury Guru',
    description: 'Recommends luxury cars.',
    icon: '💎',
  },
  budget: {
    name: 'Budget Buddy',
    description: 'Recommends budget cars.',
    icon: '💸',
  },
};

type AvatarKey = keyof typeof avatarDetails;
type Car = { id: number; name: string; type: string; price: number };

const UserDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('User');
  const selectedAvatar = (location.state && location.state.selectedAvatar) as AvatarKey | undefined;
  const recommendations = (location.state && location.state.recommendations) as Car[] | undefined;

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setUserName(user.displayName || user.email || 'User');
      } else if (location.state && (location.state as any).userName) {
        setUserName((location.state as any).userName);
      }
    });
    return () => unsubscribe();
  }, [location.state]);

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    navigate('/login');
  };

  if (!selectedAvatar || !avatarDetails[selectedAvatar]) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a2342 0%, #1e3a5c 100%)', color: '#fff', padding: '40px 0' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 700, marginBottom: 8 }}>Welcome, {userName}!</h1>
          <p style={{ color: '#a5b4fc', marginBottom: 32, fontSize: 16 }}>No AI avatar selected. Please go back and select an avatar.</p>
          <button onClick={() => navigate('/choose-avatar')} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.15)' }}>
            Choose Avatar
          </button>
        </div>
      </div>
    );
  }

  const avatar = avatarDetails[selectedAvatar];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a2342 0%, #1e3a5c 100%)', color: '#fff', padding: '40px 0' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 700, marginBottom: 8 }}>Welcome, {userName}!</h1>
          <button onClick={handleLogout} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.15)' }}>
            Logout
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 32, justifyContent: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
            borderRadius: 18,
            boxShadow: '0 8px 32px rgba(37,99,235,0.15)',
            padding: 32,
            minWidth: 220,
            maxWidth: 260,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{avatar.icon}</div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>{avatar.name}</h2>
            <p style={{ color: '#dbeafe', fontSize: 14 }}>{avatar.description}</p>
          </div>
        </div>
        {recommendations && Array.isArray(recommendations) && (
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
            {recommendations.slice(0, 3).map((car) => (
              <div key={car.id} style={{ background: '#1e293b', borderRadius: 14, boxShadow: '0 4px 16px rgba(37,99,235,0.10)', padding: 20, minWidth: 180, maxWidth: 220, textAlign: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6 }}>{car.name}</h3>
                <p style={{ color: '#a5b4fc', fontSize: 14, marginBottom: 4 }}>Type: {car.type}</p>
                <p style={{ color: '#dbeafe', fontSize: 14 }}>Price: ${car.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard; 