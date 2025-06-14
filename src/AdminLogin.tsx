import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const ADMIN_EMAIL = 'admin@rideadvisor.com'; // Change this to your admin email

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user.email?.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        setError('Unauthorized: Only admin can login.');
        setLoading(false);
        await signOut(auth);
        return;
      }
      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #232526 0%, #414345 100%)' }}>
      <form onSubmit={handleSubmit} style={{ background: '#222', padding: 32, borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.2)', minWidth: 320 }}>
        <h2 style={{ color: '#fff', marginBottom: 24 }}>Admin Login</h2>
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#a5b4fc' }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #444', marginTop: 4, background: '#333', color: '#fff' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#a5b4fc' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #444', marginTop: 4, background: '#333', color: '#fff' }} />
        </div>
        {error && <div style={{ color: '#ef4444', marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 8, background: 'linear-gradient(45deg, #2563eb, #4f46e5)', color: 'white', fontWeight: 600, border: 'none', marginBottom: 12 }}>
          {loading ? 'Logging in...' : 'Login as Admin'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin; 