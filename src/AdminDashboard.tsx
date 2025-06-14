import React, { useEffect, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

type User = {
  uid: string;
  email: string;
  displayName: string;
  disabled: boolean;
};

const ADMIN_EMAIL = 'admin@rideadvisor.com';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('http://localhost:8000/admin/users');
    const data = await res.json();
    if (data.success) setUsers(data.users);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    navigate('/login');
  };

  const handleBlock = async (uid: string, block: boolean) => {
    await fetch('http://localhost:8000/admin/user/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, block }),
    });
    fetchUsers();
  };

  const handleDelete = async (uid: string) => {
    await fetch(`http://localhost:8000/admin/user/${uid}`, { method: 'DELETE' });
    fetchUsers();
  };

  const handleEdit = (user: User) => {
    setEditUserId(user.uid);
    setEditName(user.displayName || '');
    setEditEmail(user.email);
  };

  const handleEditSave = async (uid: string) => {
    await fetch('http://localhost:8000/admin/user/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, displayName: editName, email: editEmail }),
    });
    setEditUserId(null);
    fetchUsers();
  };

  return (
    <div style={{ padding: 40, background: 'linear-gradient(135deg, #232526 0%, #414345 100%)', minHeight: '100vh', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700 }}>Admin Dashboard - User Management</h2>
        <button onClick={handleLogout} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.15)' }}>
          Logout
        </button>
      </div>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', background: '#23272f', borderRadius: 16, marginTop: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #2563eb 0%, #4f46e5 100%)' }}>
                <th style={{ color: '#fff', padding: 14, fontWeight: 600 }}>Name</th>
                <th style={{ color: '#fff', padding: 14, fontWeight: 600 }}>Email</th>
                <th style={{ color: '#fff', padding: 14, fontWeight: 600 }}>Status</th>
                <th style={{ color: '#fff', padding: 14, fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.uid} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: 12 }}>
                    {editUserId === user.uid ? (
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        style={{ background: '#333', color: '#fff', border: 'none', borderRadius: 4, padding: 4, width: 120 }}
                      />
                    ) : (
                      user.displayName
                    )}
                  </td>
                  <td style={{ padding: 12 }}>
                    {editUserId === user.uid ? (
                      <input
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        style={{ background: '#333', color: '#fff', border: 'none', borderRadius: 4, padding: 4, width: 180 }}
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td style={{ padding: 12, color: user.disabled ? '#ef4444' : '#22c55e', fontWeight: 600 }}>
                    {user.disabled ? 'Blocked' : 'Active'}
                  </td>
                  <td style={{ padding: 12 }}>
                    {user.email === ADMIN_EMAIL ? (
                      <span style={{ color: '#a5b4fc', fontWeight: 600 }}>Admin</span>
                    ) : editUserId === user.uid ? (
                      <>
                        <button
                          onClick={() => handleEditSave(user.uid)}
                          style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, marginRight: 8, cursor: 'pointer' }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditUserId(null)}
                          style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(user)}
                          style={{ background: '#f59e42', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, marginRight: 8, cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleBlock(user.uid, !user.disabled)}
                          style={{ background: user.disabled ? '#22c55e' : '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, marginRight: 8, cursor: 'pointer' }}
                        >
                          {user.disabled ? 'Unblock' : 'Block'}
                        </button>
                        <button
                          onClick={() => handleDelete(user.uid)}
                          style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 