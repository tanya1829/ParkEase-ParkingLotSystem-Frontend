// src/pages/admin/PlatformAnalytics.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { bookingApi } from '../../services/api';
import Navbar from '../../components/Navbar';
import { FaChartBar, FaMoneyBill, FaCheckCircle, FaTimes, FaClock, FaParking } from 'react-icons/fa';

const PlatformAnalytics = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSummary(); }, []);

  const fetchSummary = async () => {
    try {
      const res = await bookingApi.get('/analytics/platform-summary');
      setSummary(res.data.data);
    } catch { toast.error('Failed to load analytics.'); }
    finally { setLoading(false); }
  };

  const statCards = [
    { icon: <FaChartBar />,    color: 'blue',   value: summary?.totalBookings || 0,                          label: 'Total Bookings' },
    { icon: <FaMoneyBill />,   color: 'green',  value: `₹${(summary?.totalRevenue || 0).toFixed(0)}`,        label: 'Total Revenue' },
    { icon: <FaParking />,     color: 'amber',  value: summary?.activeBookings || 0,                         label: 'Active Now' },
    { icon: <FaCheckCircle />, color: 'green',  value: summary?.completedBookings || 0,                      label: 'Completed' },
    { icon: <FaTimes />,       color: 'red',    value: summary?.cancelledBookings || 0,                      label: 'Cancelled' },
    { icon: <FaClock />,       color: 'cyan',   value: `${(summary?.averageParkingDurationHours || 0).toFixed(1)}h`, label: 'Avg Duration' },
  ];

  const breakdownItems = [
    { label: 'Active',    value: summary?.activeBookings || 0,    color: 'var(--amber)' },
    { label: 'Completed', value: summary?.completedBookings || 0, color: 'var(--green)' },
    { label: 'Cancelled', value: summary?.cancelledBookings || 0, color: 'var(--red)' },
  ];

  const total = summary?.totalBookings || 1;

  return (
    <div className="pe-page">
      <Navbar />
      <div className="pe-container pe-content">

        <div className="pe-page-header pe-fade-up">
          <h1 className="pe-page-title">Platform Analytics</h1>
          <p className="pe-page-subtitle">Real-time overview of the entire ParkEase platform</p>
        </div>

        {loading ? (
          <div className="pe-spinner"><div className="pe-spin" /></div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="pe-grid pe-grid-3 mb-24">
              {statCards.map((s, i) => (
                <div key={i} className={`pe-stat-card pe-fade-up pe-fade-up-${(i % 4) + 1}`}>
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

            {/* Booking Breakdown */}
            <div className="pe-card pe-fade-up">
              <div className="pe-card-header">
                <h3 className="pe-card-title">Booking Status Breakdown</h3>
                <span className="pe-badge pe-badge-gray">{summary?.totalBookings || 0} total</span>
              </div>
              <div className="pe-card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {breakdownItems.map((item, i) => {
                    const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{item.value} bookings</span>
                            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: item.color, minWidth: 48, textAlign: 'right' }}>
                              {pct}%
                            </span>
                          </div>
                        </div>
                        <div style={{ height: 10, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: item.color,
                            borderRadius: 99,
                            transition: 'width 0.8s ease',
                            boxShadow: `0 0 8px ${item.color}55`,
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Revenue Callout */}
                <div style={{
                  marginTop: 32,
                  padding: '20px 24px',
                  background: 'linear-gradient(135deg, var(--surface-2), rgba(245,166,35,0.06))',
                  border: '1px solid var(--amber-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 4 }}>Average revenue per booking</div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.75rem', color: 'var(--amber)', letterSpacing: '-0.03em' }}>
                      ₹{summary?.totalBookings > 0 ? (summary.totalRevenue / summary.totalBookings).toFixed(2) : '0.00'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 4 }}>Total platform revenue</div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.75rem', color: 'var(--green)', letterSpacing: '-0.03em' }}>
                      ₹{(summary?.totalRevenue || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlatformAnalytics;