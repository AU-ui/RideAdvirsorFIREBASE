import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { useAuthUser } from './useAuthUser';
import {
  Car,
  Flame,
  Gem,
  HandCoins,
  HeartHandshake,
  LogOut,
  Settings,
  Sparkles,
  Ticket,
  User as UserIcon,
  Wallet,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

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

const userOptionBtnStyle = {
  background: '#fff',
  color: '#2563eb',
  border: 'none',
  borderRadius: 8,
  padding: '7px 0',
  fontWeight: 500,
  fontSize: 14,
  cursor: 'pointer',
  boxShadow: '0 1px 4px rgba(37,99,235,0.08)',
  transition: 'background 0.2s, color 0.2s',
  margin: 0,
};

const modalBackdropStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
};
const modalStyle: React.CSSProperties = {
  background: '#fff', color: '#222', borderRadius: 16, padding: 32, minWidth: 320, maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', position: 'relative'
};

const UserDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('User');
  const selectedAvatar = (location.state && location.state.selectedAvatar) as AvatarKey | undefined;
  const user = useAuthUser();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [editForm, setEditForm] = useState({ name: '', email: '', phoneNumber: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [recommendationMetadata, setRecommendationMetadata] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const starterCars: Car[] = [
    { id: 9001, name: 'Toyota RAV4', type: 'SUV', price: 28475 },
    { id: 9002, name: 'Ford F-150', type: 'Truck', price: 34585 },
    { id: 9003, name: 'Tesla Model Y', type: 'Electric SUV', price: 44990 },
    { id: 9004, name: 'Honda Civic', type: 'Sedan', price: 23950 },
  ];

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

  // Fetch profile when modal opens
  useEffect(() => {
    if (showEditProfile && user) {
      setProfileLoading(true);
      fetch(`http://localhost:8001/user/profile/${user.uid}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setProfile(data.user);
            setEditForm({
              name: data.user.displayName || data.user.name || '',
              email: data.user.email || '',
              phoneNumber: data.user.phoneNumber || ''
            });
            setProfileError('');
          } else {
            setProfileError(data.error || 'Failed to load profile');
          }
        })
        .catch(() => setProfileError('Failed to load profile'))
        .finally(() => setProfileLoading(false));
    }
  }, [showEditProfile, user]);

  useEffect(() => {
    if (feedbackMsg) {
      const timer = setTimeout(() => setFeedbackMsg(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMsg]);

  const handleEditProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setEditSaving(true);
    setEditSuccess('');
    setProfileError('');
    try {
      const res = await fetch(`http://localhost:8001/user/profile/${user.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: editForm.name, email: editForm.email, phoneNumber: editForm.phoneNumber })
      });
      const data = await res.json();
      if (data.success) {
        setEditSuccess('Profile updated!');
        setProfileError('');
      } else {
        setProfileError(data.error || 'Failed to update profile');
      }
    } catch {
      setProfileError('Failed to update profile');
    } finally {
      setEditSaving(false);
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    navigate('/login');
  };

  const submitFeedback = async (carId: number, feedback: 'like' | 'dislike') => {
    if (!user) return;
    setFeedbackMsg('');
    try {
      // Call the existing feedback endpoint
      const res = await fetch('http://localhost:8001/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          carId,
          avatar: selectedAvatar,
          feedback
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg('Feedback submitted!');
      } else {
        setFeedbackMsg('Failed to submit feedback.');
      }
    } catch {
      setFeedbackMsg('Failed to submit feedback.');
    }
  };

  // Fetch ML-enhanced recommendations
  const fetchRecommendations = async () => {
    if (!selectedAvatar || !user) return;
    
    try {
      const response = await fetch('http://localhost:8001/recommend-cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatar: selectedAvatar,
          userId: user.uid
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations);
        setRecommendationMetadata(data.metadata);
      } else {
        console.error('Failed to fetch recommendations:', data.error);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  // Fetch recommendations and ML status on component mount
  useEffect(() => {
    if (selectedAvatar && user) {
      fetchRecommendations();
    }
  }, [selectedAvatar, user]);

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

  const mainNavItems = [
    { label: 'Watchlist', icon: <HeartHandshake size={18} />, path: '/watchlist' },
    { label: 'Deal Alerts', icon: <Ticket size={18} />, path: '/deals' },
    { label: 'DreamFund', icon: <Sparkles size={18} />, path: '/dreamfund' },
  ];

  const userMenuItems = [
    { label: 'Edit Profile', icon: <UserIcon size={14} />, action: () => setShowEditProfile(true) },
    { label: 'Settings', icon: <Settings size={14} />, action: () => navigate('/settings') },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#cbd5e1',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Navigation Bar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        background: 'rgba(30, 41, 59, 0.5)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #334155',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#e2e8f0' }}>
          Welcome, {userName}!
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {mainNavItems.map(item => (
            <button
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#334155';
                e.currentTarget.style.color = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <main style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '2rem',
        padding: '2rem',
        flex: 1,
      }}>
        {/* Left Side: Recommendations */}
        <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '1rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {avatar.icon} Recommendations from your {avatar.name}
          </h2>
          {recommendations && recommendations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {recommendations.map(car => (
                <div key={car.id} style={{
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid #334155',
                  position: 'relative'
                }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#e2e8f0' }}>{car.name}</h3>
                  <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>{car.type} - ${car.price.toLocaleString()}</p>
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      {car.reason}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
                      <span>Rank: #{car.rank}</span>
                      <span>Confidence: {Math.round(car.confidence * 100)}%</span>
                      {car.mlScore && <span>ML Score: {car.mlScore.toFixed(2)}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => submitFeedback(car.id, 'like')} style={{ flex: 1, background: '#166534', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><ThumbsUp size={14} /> Like</button>
                    <button onClick={() => submitFeedback(car.id, 'dislike')} style={{ flex: 1, background: '#991b1b', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><ThumbsDown size={14} /> Dislike</button>
                  </div>
                </div>
              ))}
              {feedbackMsg && <div style={{ textAlign: 'center', color: '#34d399', marginTop: 12 }}>{feedbackMsg}</div>}
            </div>
          ) : (
            <div>
              <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '0.75rem', border: '1px dashed #334155' }}>
                <div style={{fontSize: '2rem', marginBottom: '1rem'}}>🤔</div>
                <h3 style={{fontSize: '1.25rem', color: '#e2e8f0', marginBottom: '0.5rem'}}>No recommendations yet!</h3>
                <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Your AI assistant is ready to help. <br/>Rate a few cars to get your first personalized recommendations.</p>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '2.5rem', marginBottom: '1.5rem', color: '#e2e8f0' }}>Get Started by Rating These Cars</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {starterCars.map(car => (
                  <div key={car.id} style={{
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid #334155',
                  }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#e2e8f0' }}>{car.name}</h3>
                    <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>{car.type} - ${car.price.toLocaleString()}</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => submitFeedback(car.id, 'like')} style={{ flex: 1, background: '#166534', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><ThumbsUp size={14} /> Like</button>
                      <button onClick={() => submitFeedback(car.id, 'dislike')} style={{ flex: 1, background: '#991b1b', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><ThumbsDown size={14} /> Dislike</button>
                    </div>
                  </div>
                ))}
              </div>
              {feedbackMsg && <div style={{ textAlign: 'center', color: '#34d399', marginTop: 16 }}>{feedbackMsg}</div>}
            </div>
          )}
        </div>

        {/* Right Side: Avatar & User Menu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            background: 'linear-gradient(145deg, #1e3a8a 0%, #4c2f91 100%)',
            padding: '2rem',
            borderRadius: '1rem',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>{avatar.icon}</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{avatar.name}</h3>
            <p style={{ fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '1.5rem' }}>{avatar.description}</p>
            <button onClick={() => navigate('/choose-avatar')} style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.9)',
              color: '#334155',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Change Avatar
            </button>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            padding: '1rem',
            borderRadius: '1rem',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              {userMenuItems.map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: '#334155',
                    color: '#cbd5e1',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#475569'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#334155'}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
            <button onClick={handleLogout} style={{
              width: '100%',
              padding: '0.75rem',
              background: '#991b1b',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Logout
            </button>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div style={modalBackdropStyle} onClick={() => setShowEditProfile(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h2>Edit Profile</h2>
            {profileLoading ? <div>Loading...</div> : (
              <form onSubmit={handleEditProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label>Name
                  <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd', marginTop: 4 }} />
                </label>
                <label>Email
                  <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd', marginTop: 4 }} />
                </label>
                <label>Phone
                  <input type="tel" value={editForm.phoneNumber} onChange={e => setEditForm(f => ({ ...f, phoneNumber: e.target.value }))} style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd', marginTop: 4 }} />
                </label>
                {profileError && <div style={{ color: 'red' }}>{profileError}</div>}
                {editSuccess && <div style={{ color: 'green' }}>{editSuccess}</div>}
                <button type="submit" disabled={editSaving} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 8 }}>
                  {editSaving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowEditProfile(false)} style={{ background: '#eee', color: '#222', border: 'none', borderRadius: 8, padding: '8px 0', fontWeight: 500, fontSize: 14, cursor: 'pointer', marginTop: 4 }}>Cancel</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard; 