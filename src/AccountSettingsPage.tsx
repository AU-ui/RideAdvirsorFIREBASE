import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthUser } from './useAuthUser';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const AccountSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthUser();
  const auth = getAuth();

  const [prefs, setPrefs] = useState({ dealAlertsEnabled: false, newsletterSubscribed: false });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] =useState(false);

  useEffect(() => {
    // Fetch user preferences when component mounts
    if (user) {
        // Mock fetching user prefs, you would fetch this from your `users` collection in Firestore
        // For example: setPrefs(fetchedUserData.preferences)
    }
  }, [user]);

  const handlePrefsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrefs({ ...prefs, [e.target.name]: e.target.checked });
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSavePrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setMessage({ type: '', text: '' });
    setLoading(true);
    try {
        const response = await fetch(`http://localhost:8000/user/preferences/${user.uid}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prefs)
        });
        const data = await response.json();
        if (data.success) {
            setMessage({ type: 'success', text: 'Preferences saved successfully!' });
        } else {
            setMessage({ type: 'error', text: data.error || 'Failed to save preferences.' });
        }
    } catch (err) {
        setMessage({ type: 'error', text: 'A network error occurred.' });
    } finally {
        setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      // Re-authenticate user before changing password for security
      const credential = EmailAuthProvider.credential(user.email, passwords.currentPassword);
      await reauthenticateWithCredential(auth.currentUser!, credential);
      
      // If re-authentication is successful, update the password
      await updatePassword(auth.currentUser!, passwords.newPassword);
      
      setMessage({ type: 'success', text: 'Password changed successfully! Please use your new password to log in next time.' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      let errorMessage = 'Failed to change password. Please check your current password and try again.';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'The current password you entered is incorrect.';
      } else if(error.code === 'auth/weak-password') {
        errorMessage = 'The new password is too weak. It should be at least 6 characters long.';
      }
      setMessage({ type: 'error', text: errorMessage });
    } finally {
        setLoading(false);
    }
  };

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    color: '#1e293b',
    padding: '40px 20px'
  };

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: 16,
    padding: 32,
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    marginBottom: 32,
  };
  
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    marginTop: 4,
    boxSizing: 'border-box'
  };
  
  const buttonStyle: React.CSSProperties = {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px 24px',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    opacity: loading ? 0.7 : 1,
  };

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Account Settings</h1>
           <button onClick={() => navigate('/dashboard')} style={{...buttonStyle, width: 'auto'}}>Back</button>
        </div>

        {message.text && (
            <div style={{ padding: 16, borderRadius: 8, marginBottom: 24, background: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#991b1b' }}>
                {message.text}
            </div>
        )}

        {/* Change Password */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 24 }}>Change Password</h2>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             <label>Current Password<input type="password" name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} style={inputStyle} required /></label>
             <label>New Password<input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} style={inputStyle} required /></label>
             <label>Confirm New Password<input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} style={inputStyle} required /></label>
             <button type="submit" style={buttonStyle} disabled={loading}>{loading ? 'Saving...' : 'Change Password'}</button>
          </form>
        </div>

        {/* Notification Preferences */}
        <div style={cardStyle}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 24 }}>Notification Preferences</h2>
            <form onSubmit={handleSavePrefs} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" name="dealAlertsEnabled" checked={prefs.dealAlertsEnabled} onChange={handlePrefsChange} style={{width: 20, height: 20}} />
                    <span>Enable email alerts for new deals on my watchlist.</span>
                </label>
                 <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" name="newsletterSubscribed" checked={prefs.newsletterSubscribed} onChange={handlePrefsChange} style={{width: 20, height: 20}} />
                    <span>Subscribe to the monthly RideAdvisor newsletter.</span>
                </label>
                <button type="submit" style={buttonStyle} disabled={loading}>{loading ? 'Saving...' : 'Save Preferences'}</button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage; 