import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

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
    <div className="login-container" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #fdf2f8 0%, #ec4899 50%, #be185d 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)',
        animation: 'float 20s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-50%',
        right: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(190,24,93,0.1) 0%, transparent 70%)',
        animation: 'float 25s ease-in-out infinite reverse'
      }}></div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
      `}</style>

      <form onSubmit={handleSubmit} style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        padding: 40, 
        borderRadius: 20, 
        boxShadow: '0 20px 60px rgba(236,72,153,0.2)', 
        minWidth: 360,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(236,72,153,0.1)',
        position: 'relative',
        zIndex: 10
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: 32, 
          fontSize: '2rem',
          fontWeight: 700,
          color: '#831843',
          background: 'linear-gradient(135deg, #831843 0%, #be185d 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>Welcome to Ride Advisor</h2>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, color: '#831843', fontWeight: 600 }}>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            style={{ 
              width: '100%', 
              padding: 12, 
              borderRadius: 12, 
              border: '2px solid #fce7f3', 
              marginTop: 4,
              fontSize: 16,
              transition: 'all 0.3s ease',
              background: 'rgba(252,231,243,0.3)',
              color: '#831843'
            }}
            placeholder="Enter your email"
          />
        </div>
        
        <div style={{ marginBottom: 20, position: 'relative' }}>
          <label style={{ display: 'block', marginBottom: 8, color: '#831843', fontWeight: 600 }}>Password</label>
          <input 
            type={showPassword ? 'text' : 'password'} 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            style={{ 
              width: '100%', 
              padding: 12, 
              borderRadius: 12, 
              border: '2px solid #fce7f3', 
              marginTop: 4,
              fontSize: 16,
              transition: 'all 0.3s ease',
              background: 'rgba(252,231,243,0.3)',
              color: '#831843'
            }}
            placeholder="Enter your password"
          />
          <span 
            onClick={() => setShowPassword(v => !v)} 
            style={{ 
              position: 'absolute', 
              right: 16, 
              top: 42, 
              cursor: 'pointer', 
              userSelect: 'none',
              fontSize: 18,
              opacity: 0.7,
              transition: 'opacity 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>
        
        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <span 
            style={{ 
              color: '#ec4899', 
              cursor: 'pointer', 
              fontSize: 14,
              fontWeight: 500,
              transition: 'color 0.3s ease'
            }} 
            onClick={() => navigate('/forgot-password')}
            onMouseEnter={(e) => e.currentTarget.style.color = '#be185d'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#ec4899'}
          >
            Forgot Password?
          </span>
        </div>
        
        {error && (
          <div style={{ 
            color: '#dc2626', 
            marginBottom: 16, 
            padding: 12, 
            borderRadius: 8, 
            background: 'rgba(220,38,38,0.1)',
            border: '1px solid rgba(220,38,38,0.2)',
            fontSize: 14
          }}>
            {error}
          </div>
        )}
        
        {error && error.includes('verify your email') && (
          <button 
            onClick={handleResendVerification} 
            disabled={loading}
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              fontWeight: 600,
              border: 'none',
              marginBottom: 16,
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
          >
            Resend Verification Email
          </button>
        )}
        
        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            width: '100%', 
            padding: 14, 
            borderRadius: 12, 
            background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', 
            color: 'white', 
            fontWeight: 600, 
            border: 'none', 
            marginBottom: 16,
            fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(236,72,153,0.3)',
            transform: loading ? 'scale(0.98)' : 'scale(1)'
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        <div style={{ textAlign: 'center', color: '#831843' }}>
          Don't have an account?{' '}
          <span 
            style={{ 
              color: '#ec4899', 
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'color 0.3s ease'
            }} 
            onClick={() => navigate('/signup')}
            onMouseEnter={(e) => e.currentTarget.style.color = '#be185d'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#ec4899'}
          >
            Sign up
          </span>
        </div>
      </form>
      
      {showForgot && (
        <form onSubmit={handleForgot} style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: 40, 
          borderRadius: 20, 
          boxShadow: '0 20px 60px rgba(236,72,153,0.2)', 
          minWidth: 360, 
          marginLeft: 24,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(236,72,153,0.1)',
          position: 'relative',
          zIndex: 10
        }}>
          <h3 style={{ 
            textAlign: 'center', 
            marginBottom: 24,
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#831843'
          }}>Forgot Password</h3>
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, color: '#831843', fontWeight: 600 }}>Email</label>
            <input 
              type="email" 
              value={forgotEmail} 
              onChange={e => setForgotEmail(e.target.value)} 
              required 
              style={{ 
                width: '100%', 
                padding: 12, 
                borderRadius: 12, 
                border: '2px solid #fce7f3', 
                marginTop: 4,
                fontSize: 16,
                background: 'rgba(252,231,243,0.3)',
                color: '#831843'
              }}
              placeholder="Enter your email"
            />
          </div>
          
          {forgotMsg && (
            <div style={{ 
              color: '#059669', 
              marginBottom: 16, 
              padding: 12, 
              borderRadius: 8, 
              background: 'rgba(5,150,105,0.1)',
              border: '1px solid rgba(5,150,105,0.2)',
              fontSize: 14
            }}>
              {forgotMsg}
            </div>
          )}
          
          {error && (
            <div style={{ 
              color: '#dc2626', 
              marginBottom: 16, 
              padding: 12, 
              borderRadius: 8, 
              background: 'rgba(220,38,38,0.1)',
              border: '1px solid rgba(220,38,38,0.2)',
              fontSize: 14
            }}>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: 14, 
              borderRadius: 12, 
              background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', 
              color: 'white', 
              fontWeight: 600, 
              border: 'none', 
              marginBottom: 16,
              fontSize: 16,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(236,72,153,0.3)'
            }}
          >
            Send Reset Email
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <span 
              style={{ 
                color: '#ec4899', 
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'color 0.3s ease'
              }} 
              onClick={() => { setShowForgot(false); setForgotMsg(''); setError(''); }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#be185d'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#ec4899'}
            >
              Back to Login
            </span>
          </div>
        </form>
      )}
    </div>
  );
};

export default LoginPage; 