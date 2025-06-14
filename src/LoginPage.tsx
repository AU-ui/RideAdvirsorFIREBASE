import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (!user.emailVerified) {
        setError('Please verify your email before logging in.');
        setLoading(false);
        return;
      }
      navigate('/choose-avatar', { state: { userName: user.displayName || user.email } });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg('');
    setError('');
    try {
      const response = await fetch('http://localhost:8000/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await response.json();
      if (response.ok) {
        setForgotMsg('Password reset email sent!');
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleResendVerification = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        alert('Verification email sent!');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f6f8fd 0%, #f1f4f9 100%)' }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: 32, borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', minWidth: 320 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Login</h2>
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginTop: 4 }} />
        </div>
        <div style={{ marginBottom: 16, position: 'relative' }}>
          <label>Password</label>
          <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginTop: 4 }} />
          <span onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 12, top: 38, cursor: 'pointer', userSelect: 'none' }}>
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>
        <div style={{ marginBottom: 16, position: 'relative' }}>
          <label>Confirm Password</label>
          <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginTop: 4 }} />
          <span onClick={() => setShowConfirmPassword(v => !v)} style={{ position: 'absolute', right: 12, top: 38, cursor: 'pointer', userSelect: 'none' }}>
            {showConfirmPassword ? '🙈' : '👁️'}
          </span>
        </div>
        <div style={{ textAlign: 'right', marginBottom: 12 }}>
          <span style={{ color: '#2563eb', cursor: 'pointer', fontSize: 14 }} onClick={() => navigate('/forgot-password')}>
            Forgot Password?
          </span>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        {error && error.includes('verify your email') && (
          <button onClick={handleResendVerification} disabled={loading}>
            Resend Verification Email
          </button>
        )}
        <button type="submit" disabled={loading || password !== confirmPassword} style={{ width: '100%', padding: 12, borderRadius: 8, background: 'linear-gradient(45deg, #2563eb, #4f46e5)', color: 'white', fontWeight: 600, border: 'none', marginBottom: 12 }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div style={{ textAlign: 'center' }}>
          Don't have an account?{' '}
          <span style={{ color: '#2563eb', cursor: 'pointer' }} onClick={() => navigate('/signup')}>
            Sign up
          </span>
        </div>
      </form>
      {showForgot && (
        <form onSubmit={handleForgot} style={{ background: 'white', padding: 32, borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', minWidth: 320, marginLeft: 24 }}>
          <h3 style={{ textAlign: 'center', marginBottom: 16 }}>Forgot Password</h3>
          <div style={{ marginBottom: 16 }}>
            <label>Email</label>
            <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginTop: 4 }} />
          </div>
          {forgotMsg && <div style={{ color: 'green', marginBottom: 12 }}>{forgotMsg}</div>}
          {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
          <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 8, background: 'linear-gradient(45deg, #2563eb, #4f46e5)', color: 'white', fontWeight: 600, border: 'none', marginBottom: 12 }}>
            Send Reset Email
          </button>
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#2563eb', cursor: 'pointer' }} onClick={() => { setShowForgot(false); setForgotMsg(''); setError(''); }}>
              Back to Login
            </span>
          </div>
        </form>
      )}
    </div>
  );
};

export default LoginPage; 