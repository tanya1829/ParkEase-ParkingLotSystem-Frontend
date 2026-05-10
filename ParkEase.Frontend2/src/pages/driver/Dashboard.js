// src/pages/driver/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingApi, vehicleApi, notifApi } from '../../services/api';
import Navbar from '../../components/Navbar';
import { FaParking, FaCar, FaBell, FaHistory, FaSearch, FaMoneyBill, FaChartBar } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const statusMap = {
  RESERVED:  { cls: 'pe-badge-amber',  label: 'Reserved' },
  ACTIVE:    { cls: 'pe-badge-green',  label: 'Active' },
  COMPLETED: { cls: 'pe-badge-gray',   label: 'Completed' },
  CANCELLED: { cls: 'pe-badge-red',    label: 'Cancelled' },
};

const COLORS = ['#fcb4d2', '#22C55E', '#3B82F6', '#EF4444'];

const DriverDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ bookings: 0, vehicles: 0, unread: 0, active: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);

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

      // Build monthly chart data
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const monthlyCounts = Array(12).fill(0);
      bookings.forEach(b => {
        const m = new Date(b.startTime).getMonth();
        monthlyCounts[m]++;
      });
      setChartData(months.map((m, i) => ({ month: m, bookings: monthlyCounts[i] })));

      // Build status pie data
      const statusCounts = { RESERVED: 0, ACTIVE: 0, COMPLETED: 0, CANCELLED: 0 };
      bookings.forEach(b => { if (statusCounts[b.status] !== undefined) statusCounts[b.status]++; });
      setPieData(Object.entries(statusCounts).filter(([,v]) => v > 0).map(([k, v]) => ({ name: k, value: v })));
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

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1A1D27', border: '1px solid #222638', borderRadius: 8, padding: '10px 16px' }}>
          <p style={{ color: '#fcb4d2', margin: 0, fontWeight: 700 }}>{label}</p>
          <p style={{ color: '#F0F1F5', margin: 0 }}>{payload[0].value} bookings</p>
        </div>
      );
    }
    return null;
  };

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
        <p className="pe-section-label pe-fade-up">OVERVIEW</p>
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
        <p className="pe-section-label pe-fade-up">QUICK ACTIONS</p>
        <div className="pe-grid pe-grid-4 mb-32">
          {actions.map((a, i) => (
            <Link key={i} to={a.to} className={`pe-action-tile pe-fade-up pe-fade-up-${i+1}`}>
              <div className="pe-action-tile-icon">{a.icon}</div>
              {a.label}
            </Link>
          ))}
        </div>

        {/* Charts Row */}
        <p className="pe-section-label pe-fade-up"><FaChartBar style={{ marginRight: 6 }} />ANALYTICS</p>
        <div className="pe-grid pe-grid-2 mb-32">

          {/* Monthly Bookings Bar Chart */}
          <div className="pe-card pe-fade-up">
            <div className="pe-card-header">
              <h3 className="pe-card-title">Monthly Bookings</h3>
            </div>
            <div style={{ padding: '20px 10px' }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <XAxis dataKey="month" tick={{ fill: '#8B8FA8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8B8FA8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={customTooltip} />
                  <Bar dataKey="bookings" fill="#fcb4d2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Booking Status Pie Chart */}
          <div className="pe-card pe-fade-up">
            <div className="pe-card-header">
              <h3 className="pe-card-title">Booking Status</h3>
            </div>
            <div style={{ padding: '20px 10px' }}>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1A1D27', border: '1px solid #222638', borderRadius: 8 }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#8B8FA8' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="pe-empty" style={{ height: 200 }}>
                  <p className="pe-empty-text">No booking data yet</p>
                </div>
              )}
            </div>
          </div>
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