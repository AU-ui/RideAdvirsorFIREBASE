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
  const userName = (location.state && (location.state as any).userName) || 'User';

  const handleSelect = async (avatarId: string) => {
    setSelected(avatarId);
    setLoading(true);
    const res = await fetch('http://localhost:8000/recommend-cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar: avatarId })
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      // Pass recommendations and selected avatar to dashboard
      navigate('/dashboard', { state: { recommendations: data.recommendations, selectedAvatar: avatarId, userName } });
    } else {
      alert(data.error);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Choose Your AI Avatar</h2>
      <div style={{ display: 'flex', gap: 24 }}>
        {avatars.map(avatar => (
          <div
            key={avatar.id}
            style={{
              border: selected === avatar.id ? '2px solid #2563eb' : '1px solid #ccc',
              borderRadius: 12,
              padding: 24,
              cursor: 'pointer',
              minWidth: 180
            }}
            onClick={() => handleSelect(avatar.id)}
          >
            <h3>{avatar.name}</h3>
            <p>{avatar.description}</p>
            {selected === avatar.id && loading && <p>Loading recommendations...</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarSelectionPage; 