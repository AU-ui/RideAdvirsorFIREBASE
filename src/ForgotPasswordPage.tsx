import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import app from './firebase';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f6f8fd 0%, #f1f4f9 100%)' }}>
      <form onSubmit={handleResetPassword} style={{ background: 'white', padding: 32, borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', minWidth: 320 }}>
        <h3 style={{ textAlign: 'center', marginBottom: 16 }}>Forgot Password</h3>
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginTop: 4 }} />
        </div>
        {msg && <div style={{ color: 'green', marginBottom: 12 }}>{msg}</div>}
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 8, background: 'linear-gradient(45deg, #2563eb, #4f46e5)', color: 'white', fontWeight: 600, border: 'none', marginBottom: 12 }}>
          {loading ? 'Sending...' : 'Send Reset Email'}
        </button>
        <div style={{ textAlign: 'center' }}>
          <span style={{ color: '#2563eb', cursor: 'pointer' }} onClick={() => navigate('/login')}>
            Back to Login
          </span>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordPage; 