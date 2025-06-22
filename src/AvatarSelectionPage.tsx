import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const avatars = [
  { id: 'eco', name: 'Eco Advisor', description: 'Recommends eco-friendly cars.' },
  { id: 'luxury', name: 'Luxury Guru', description: 'Recommends luxury cars.' },
  { id: 'budget', name: 'Budget Buddy', description: 'Recommends budget cars.' }
];

const AvatarSelectionPage: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userName = (location.state && location.state.userName) || 'User';

  const handleAvatarSelect = (avatarId: string) => {
    setSelected(avatarId);
  };

  const handleContinue = async () => {
    if (!selected) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      navigate('/dashboard', { 
        state: { 
          selectedAvatar: selected,
          userName: userName
        } 
      });
    }, 1000);
  };

  return (
    <div style={{ padding: 40, minHeight: '100vh', background: 'linear-gradient(135deg, #fdf2f8 0%, #ec4899 100%)' }}>
      <h2 style={{ fontWeight: 800, fontSize: 32, marginBottom: 36, color: '#831843' }}>Choose Your AI Avatar</h2>
      <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
        {avatars.map(avatar => (
          <div
            key={avatar.id}
            style={{
              border: selected === avatar.id ? '2.5px solid #ec4899' : '1.5px solid #f9a8d4',
              borderRadius: 18,
              padding: 32,
              background: selected === avatar.id 
                ? 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)' 
                : 'linear-gradient(135deg, #fef7ff 0%, #fdf2f8 100%)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: selected === avatar.id 
                ? '0 8px 25px rgba(236,72,153,0.25)' 
                : '0 4px 15px rgba(236,72,153,0.1)',
              transform: selected === avatar.id ? 'scale(1.02)' : 'scale(1)',
              minWidth: 200,
              textAlign: 'center'
            }}
            onClick={() => handleAvatarSelect(avatar.id)}
          >
            <div style={{ 
              fontSize: 48, 
              marginBottom: 16,
              filter: selected === avatar.id ? 'drop-shadow(0 4px 8px rgba(236,72,153,0.3))' : 'none'
            }}>
              {avatar.id === 'eco' && '🌱'}
              {avatar.id === 'luxury' && '💎'}
              {avatar.id === 'budget' && '💰'}
            </div>
            <h3 style={{ 
              fontSize: 20, 
              fontWeight: 700, 
              marginBottom: 8,
              color: selected === avatar.id ? '#831843' : '#be185d'
            }}>
              {avatar.name}
            </h3>
            <p style={{ 
              fontSize: 14, 
              color: selected === avatar.id ? '#be185d' : '#9d174d',
              lineHeight: 1.4
            }}>
              {avatar.description}
            </p>
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: 'center', marginTop: 48 }}>
        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          style={{
            background: selected 
              ? 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' 
              : 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
            color: selected ? '#fff' : '#a855f7',
            border: 'none',
            borderRadius: 12,
            padding: '16px 32px',
            fontSize: 18,
            fontWeight: 600,
            cursor: selected ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            boxShadow: selected 
              ? '0 4px 15px rgba(236,72,153,0.3)' 
              : '0 2px 8px rgba(168,85,247,0.1)',
            transform: selected ? 'translateY(-2px)' : 'translateY(0)'
          }}
        >
          {loading ? 'Setting up your avatar...' : 'Continue with Selected Avatar'}
        </button>
      </div>
    </div>
  );
};

export default AvatarSelectionPage; 