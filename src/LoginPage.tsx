import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
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
    setLoading(true);
    setForgotMsg('');
    setError('');
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, forgotEmail);
      setForgotMsg('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
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
    <div className="login-container" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f8fafc',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
      `}</style>

      <div className="login-page-container">
        {!showForgot ? (
          <form onSubmit={handleSubmit} className="login-form-card">
            <h2 className="login-title">Welcome to Ride Advisor</h2>
            
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="form-input"
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="form-input"
                placeholder="Enter your password"
              />
              <span onClick={() => setShowPassword(v => !v)} className="password-toggle">
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>

            <span className="forgot-password-link" onClick={() => setShowForgot(true)}>
              Forgot Password?
            </span>

            {error && <div className="error-message">{error}</div>}

            {error && error.includes('verify your email') && (
              <button type="button" onClick={handleResendVerification} disabled={loading} className="resend-verification-btn">
                Resend Verification Email
              </button>
            )}

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="signup-link-container">
              Don't have an account?{' '}
              <span className="signup-link" onClick={() => navigate('/signup')}>
                Sign up
              </span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleForgot} className="login-form-card">
            <h3 className="login-title">Forgot Password</h3>
            
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">Email</label>
              <input
                id="forgot-email"
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                required
                className="form-input"
                placeholder="Enter your email"
              />
            </div>
            
            {forgotMsg && <div className="success-message">{forgotMsg}</div>}
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" disabled={loading} className="login-btn">
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>
            
            <div className="signup-link-container">
              <span className="signup-link" onClick={() => { setShowForgot(false); setForgotMsg(''); setError(''); }}>
                Back to Login
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage; 