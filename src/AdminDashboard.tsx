import React, { useEffect, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

// ... existing User type and component code ...

const AdminDashboard: React.FC = () => {
  // ... existing state and fetch logic ...
  const navigate = useNavigate();

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div style={{ padding: 40, background: 'linear-gradient(135deg, #232526 0%, #414345 100%)', minHeight: '100vh', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Admin Dashboard - User Management</h2>
        <button onClick={handleLogout} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.15)' }}>
          Logout
        </button>
      </div>
      {/* ... rest of the table ... */}
    </div>
  );
};

export default AdminDashboard; 