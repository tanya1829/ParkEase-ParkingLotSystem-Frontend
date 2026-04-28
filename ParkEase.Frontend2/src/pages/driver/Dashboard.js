// src/pages/driver/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingApi, vehicleApi, notifApi } from '../../services/api';
import Navbar from '../../components/Navbar';
import { FaParking, FaCar, FaBell, FaHistory, FaSearch, FaMoneyBill } from 'react-icons/fa';

const statusMap = {
  RESERVED:  { cls: 'pe-badge-amber',  label: 'Reserved' },
  ACTIVE:    { cls: 'pe-badge-green',  label: 'Active' },
  COMPLETED: { cls: 'pe-badge-gray',   label: 'Completed' },
  CANCELLED: { cls: 'pe-badge-red',    label: 'Cancelled' },
};

const DriverDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ bookings: 0, vehicles: 0, unread: 0, active: 0 });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [bookingsRes, vehiclesRes, notifRes] = await Promise.all([
        bookingApi.get(`/bookings/user/${user.userId}`),
        vehicleApi.get(`/vehicles/owner/${user.userId}`),
        notifApi.get(`/notifications/user/${user.userId}/unread-count`),
      ]);
      const bookings = bookingsRes.data.data || [];
      const active = bookings.filter(b => b.status === 'ACTIVE' || b.status === 'RESERVED').length;
      setStats({ bookings: bookings.length, vehicles: vehiclesRes.data.data?.length || 0, unread: notifRes.data.data || 0, active });
      setRecentBookings(bookings.slice(0, 5));
    } catch {}
  };

  const statCards = [
    { icon: <FaParking />, color: 'amber',  value: stats.active,   label: 'Active Bookings' },
    { icon: <FaHistory />, color: 'blue',   value: stats.bookings, label: 'Total Bookings' },
    { icon: <FaCar />,     color: 'green',  value: stats.vehicles, label: 'My Vehicles' },
    { icon: <FaBell />,    color: 'red',    value: stats.unread,   label: 'Unread Alerts' },
  ];

  const actions = [
    { to: '/driver/search',    icon: <FaSearch />,    label: 'Find Parking' },
    { to: '/driver/bookings',  icon: <FaHistory />,   label: 'My Bookings' },
    { to: '/driver/vehicles',  icon: <FaCar />,       label: 'My Vehicles' },
    { to: '/driver/payments',  icon: <FaMoneyBill />, label: 'Payments' },
  ];

  return (
    <div className="pe-page">
      <Navbar />
      <div className="pe-container pe-content">

        {/* Welcome Banner */}
        <div className="pe-welcome pe-fade-up">
          <p className="pe-welcome-name">Hello, <span>{user?.fullName?.split(' ')[0]}</span> 👋</p>
          <p className="pe-welcome-sub">Here's what's happening with your parking today.</p>
        </div>

        {/* Stats */}
        <p className="pe-section-label pe-fade-up">Overview</p>
        <div className="pe-grid pe-grid-4 mb-24">
          {statCards.map((s, i) => (
            <div key={i} className={`pe-stat-card pe-fade-up pe-fade-up-${i+1}`}>
              <div className={`pe-stat-icon ${s.color}`}>{s.icon}</div>
              <div>
                <div className="pe-stat-value">{s.value}</div>
                <div className="pe-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <p className="pe-section-label pe-fade-up">Quick Actions</p>
        <div className="pe-grid pe-grid-4 mb-32">
          {actions.map((a, i) => (
            <Link key={i} to={a.to} className={`pe-action-tile pe-fade-up pe-fade-up-${i+1}`}>
              <div className="pe-action-tile-icon">{a.icon}</div>
              {a.label}
            </Link>
          ))}
        </div>

        {/* Recent Bookings */}
        <div className="pe-card pe-fade-up">
          <div className="pe-card-header">
            <h3 className="pe-card-title">Recent Bookings</h3>
            <Link to="/driver/bookings" className="pe-btn pe-btn-ghost pe-btn-sm">View All</Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="pe-empty">
              <div className="pe-empty-icon"><FaParking /></div>
              <p className="pe-empty-title">No bookings yet</p>
              <p className="pe-empty-text">Find a parking spot to get started!</p>
              <Link to="/driver/search" className="pe-btn pe-btn-primary">Find Parking</Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="pe-table">
                <thead>
                  <tr>
                    <th>Booking ID</th><th>Spot</th><th>Date</th><th>Amount</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(b => {
                    const s = statusMap[b.status] || { cls: 'pe-badge-gray', label: b.status };
                    return (
                      <tr key={b.bookingId}>
                        <td className="fw">#{b.bookingId}</td>
                        <td>Spot {b.spotId}</td>
                        <td>{new Date(b.startTime).toLocaleDateString()}</td>
                        <td className="text-amber fw-bold">₹{b.totalAmount}</td>
                        <td><span className={`pe-badge ${s.cls}`}>{s.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DriverDashboard;
