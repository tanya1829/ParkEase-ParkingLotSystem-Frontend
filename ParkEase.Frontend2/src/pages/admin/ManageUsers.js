// src/pages/admin/ManageUsers.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { authApi } from '../../services/api';
import Navbar from '../../components/Navbar';
import { FaUsers, FaUserSlash } from 'react-icons/fa';

const roleMap = {
  DRIVER:  { cls: 'pe-badge-blue',   label: 'Driver' },
  MANAGER: { cls: 'pe-badge-purple', label: 'Manager' },
  ADMIN:   { cls: 'pe-badge-red',    label: 'Admin' },
};

const filters = ['ALL', 'DRIVER', 'MANAGER'];

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [driversRes, managersRes] = await Promise.all([
        authApi.get('/auth/users?role=DRIVER').catch(() => ({ data: { data: [] } })),
        authApi.get('/auth/users?role=MANAGER').catch(() => ({ data: { data: [] } }))
      ]);
      setUsers([...(driversRes.data.data || []), ...(managersRes.data.data || [])]);
    } catch { toast.error('Failed to load users.'); }
    finally { setLoading(false); }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await authApi.delete('/auth/deactivate', { data: { userId } });
      toast.success('User deactivated.');
      fetchUsers();
    } catch { toast.error('Failed to deactivate.'); }
  };

  const filtered = filter === 'ALL' ? users : users.filter(u => u.role === filter);
  const driverCount  = users.filter(u => u.role === 'DRIVER').length;
  const managerCount = users.filter(u => u.role === 'MANAGER').length;

  return (
    <div className="pe-page">
      <Navbar />
      <div className="pe-container pe-content">

        <div className="pe-page-header pe-fade-up">
          <h1 className="pe-page-title">Manage Users</h1>
          <p className="pe-page-subtitle">{users.length} registered users</p>
        </div>

        {/* Stats */}
        <div className="pe-grid pe-grid-3 mb-24">
          <div className="pe-stat-card pe-fade-up pe-fade-up-1">
            <div className="pe-stat-icon blue"><FaUsers /></div>
            <div><div className="pe-stat-value">{users.length}</div><div className="pe-stat-label">Total Users</div></div>
          </div>
          <div className="pe-stat-card pe-fade-up pe-fade-up-2">
            <div className="pe-stat-icon amber"><FaUsers /></div>
            <div><div className="pe-stat-value">{driverCount}</div><div className="pe-stat-label">Drivers</div></div>
          </div>
          <div className="pe-stat-card pe-fade-up pe-fade-up-3">
            <div className="pe-stat-icon purple"><FaUsers /></div>
            <div><div className="pe-stat-value">{managerCount}</div><div className="pe-stat-label">Managers</div></div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }} className="pe-fade-up">
          {filters.map(f => (
            <button
              key={f}
              className={`pe-btn pe-btn-sm ${filter === f ? 'pe-btn-primary' : 'pe-btn-ghost'}`}
              onClick={() => setFilter(f)}
            >
              {f}
              <span style={{ marginLeft: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 99, padding: '1px 8px', fontSize: '0.7rem' }}>
                {f === 'ALL' ? users.length : users.filter(u => u.role === f).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="pe-spinner"><div className="pe-spin" /></div>
        ) : (
          <div className="pe-card pe-fade-up">
            <div className="pe-card-header">
              <h3 className="pe-card-title">{filter === 'ALL' ? 'All Users' : `${filter}S`}</h3>
              <span className="pe-badge pe-badge-gray">{filtered.length} users</span>
            </div>
            {filtered.length === 0 ? (
              <div className="pe-empty">
                <div className="pe-empty-icon"><FaUsers /></div>
                <p className="pe-empty-title">No users found</p>
                <p className="pe-empty-text">No users match the selected filter.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="pe-table">
                  <thead>
                    <tr><th>#ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => {
                      const r = roleMap[u.role] || { cls: 'pe-badge-gray', label: u.role };
                      return (
                        <tr key={u.userId}>
                          <td className="fw">#{u.userId}</td>
                          <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.fullName}</td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{u.email}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{u.phone}</td>
                          <td><span className={`pe-badge ${r.cls}`}>{r.label}</span></td>
                          <td>
                            <span className={`pe-badge ${u.isActive ? 'pe-badge-green' : 'pe-badge-red'}`}>
                              {u.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            {u.isActive && (
                              <button className="pe-btn pe-btn-danger pe-btn-sm" onClick={() => handleDeactivate(u.userId)}>
                                <FaUserSlash size={11} /> Deactivate
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;