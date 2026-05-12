// src/pages/admin/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi, lotApi } from '../../services/api';
import Navbar from '../../components/Navbar';
import { FaUsers, FaParking, FaChartBar, FaMoneyBill, FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [pendingLots, setPendingLots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, lotsRes] = await Promise.all([
        bookingApi.get('/analytics/platform-summary'),
        lotApi.get('/lots/pending'),
      ]);
      setSummary(summaryRes.data.data);
      setPendingLots((lotsRes.data.data || []).slice(0, 4));
    } catch {}
    finally { setLoading(false); }
  };

  const statCards = [
    { icon: <FaChartBar />, color: 'blue',   value: summary?.totalBookings || 0,                  label: 'Total Bookings' },
    { icon: <FaMoneyBill />,color: 'green',  value: `₹${(summary?.totalRevenue || 0).toFixed(0)}`, label: 'Total Revenue' },
    { icon: <FaParking />,  color: 'amber',  value: summary?.activeBookings || 0,                 label: 'Active Bookings' },
    { icon: <FaExclamationTriangle />, color: 'red', value: pendingLots.length, label: 'Pending Approvals' },
  ];

  const adminActions = [
    { to: '/admin/users',     icon: <FaUsers />,    label: 'Manage Users',  desc: 'View & manage all users' },
    { to: '/admin/lots',      icon: <FaParking />,  label: 'Approve Lots',  desc: 'Review pending lot requests' },
    { to: '/admin/bookings',  icon: <FaChartBar />, label: 'All Bookings',  desc: 'Platform-wide booking view' },
    { to: '/admin/analytics', icon: <FaMoneyBill />,label: 'Analytics',     desc: 'Revenue & usage insights' },
  ];

  return (
    <div className="pe-page">
      <Navbar />
      <div className="pe-container pe-content">

        <div className="pe-welcome pe-fade-up">
          <p className="pe-welcome-name">Admin Dashboard <span>🛡️</span></p>
          <p className="pe-welcome-sub">Platform overview and management controls.</p>
        </div>

        <p className="pe-section-label">Platform Stats</p>
        <div className="pe-grid pe-grid-4 mb-24">
          {statCards.map((s, i) => (
            <div key={i} className={`pe-stat-card pe-fade-up pe-fade-up-${i+1}`}>
              <div className={`pe-stat-icon ${s.color}`}>{s.icon}</div>
              <div>
                <div className="pe-stat-value" style={{ fontSize: typeof s.value === 'string' && s.value.length > 6 ? '1.375rem' : undefined }}>
                  {s.value}
                </div>
                <div className="pe-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="pe-section-label">Management</p>
        <div className="pe-grid pe-grid-4 mb-32">
          {adminActions.map((a, i) => (
            <Link key={i} to={a.to} className={`pe-action-tile pe-fade-up pe-fade-up-${i+1}`} style={{ alignItems: 'flex-start', gap: 14 }}>
              <div className="pe-action-tile-icon">{a.icon}</div>
              <div style={{ textAlign: 'left' }}>
                <div>{a.label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontWeight: 400, marginTop: 2 }}>{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {pendingLots.length > 0 && (
          <div className="pe-card pe-fade-up">
            <div className="pe-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="pe-badge pe-badge-amber">
                  <FaExclamationTriangle size={10}/> {pendingLots.length} Pending
                </span>
                <h3 className="pe-card-title">Lot Approval Requests</h3>
              </div>
              <Link to="/admin/lots" className="pe-btn pe-btn-primary pe-btn-sm">
                Review All <FaArrowRight size={11}/>
              </Link>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="pe-table">
                <thead>
                  <tr><th>Lot Name</th><th>City</th><th>Manager</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {pendingLots.map(lot => (
                    <tr key={lot.lotId}>
                      <td className="fw">{lot.name}</td>
                      <td>{lot.city}</td>
                      <td style={{ color: 'var(--text-muted)' }}>Manager #{lot.managerId}</td>
                      <td>
                        <Link to="/admin/lots" className="pe-btn pe-btn-primary pe-btn-sm">Review</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
