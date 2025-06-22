import React, { useEffect, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  displayName: string;
  isBlocked: boolean;
}

const ADMIN_EMAIL = 'admin@rideadvisor.com';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
      setUsers(users.filter(user => user.id !== userId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBlock = async (userId: string, isBlocked: boolean) => {
    try {
      const response = await fetch(`http://localhost:8000/admin/users/${userId}/block`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked }),
      });
      if (!response.ok) throw new Error('Failed to update user block status');
      setUsers(users.map(user => user.id === userId ? { ...user, isBlocked } : user));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.displayName);
    setEditEmail(user.email);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    try {
      const response = await fetch(`http://localhost:8000/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: editName, email: editEmail }),
      });
      if (!response.ok) throw new Error('Failed to update user');
      setUsers(users.map(user => user.id === editingUser.id ? { ...user, displayName: editName, email: editEmail } : user));
      setEditingUser(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: 40, background: 'linear-gradient(135deg, #232526 0%, #414345 100%)', minHeight: '100vh', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700 }}>Admin Dashboard - User Management</h2>
        <button onClick={handleLogout} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.15)' }}>
          Logout
        </button>
      </div>
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
              <tr key={user.id} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: 12 }}>
                  {editingUser?.id === user.id ? (
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
                  {editingUser?.id === user.id ? (
                    <input
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                      style={{ background: '#333', color: '#fff', border: 'none', borderRadius: 4, padding: 4, width: 180 }}
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td style={{ padding: 12, color: user.isBlocked ? '#ef4444' : '#22c55e', fontWeight: 600 }}>
                  {user.isBlocked ? 'Blocked' : 'Active'}
                </td>
                <td style={{ padding: 12 }}>
                  {user.email === ADMIN_EMAIL ? (
                    <span style={{ color: '#a5b4fc', fontWeight: 600 }}>Admin</span>
                  ) : editingUser?.id === user.id ? (
                    <button
                      onClick={handleSaveEdit}
                      style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, marginRight: 8, cursor: 'pointer' }}
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(user)}
                        style={{ background: '#f59e42', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, marginRight: 8, cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleBlock(user.id, !user.isBlocked)}
                        style={{ background: user.isBlocked ? '#22c55e' : '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, marginRight: 8, cursor: 'pointer' }}
                      >
                        {user.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
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
    </div>
  );
};

export default AdminDashboard; 