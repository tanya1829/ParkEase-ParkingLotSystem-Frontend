// src/pages/manager/Revenue.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bookingApi } from '../../services/api';
import Navbar from '../../components/Navbar';
import { FaChartBar, FaMoneyBill, FaCalendarAlt, FaFilter } from 'react-icons/fa';

const Revenue = () => {
  const { lotId } = useParams();
  const [revenue, setRevenue] = useState(null);
  const [peakHours, setPeakHours] = useState(null);
  const [occupancy, setOccupancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [revRes, peakRes, occRes] = await Promise.all([
        bookingApi.get(`/analytics/revenue/${lotId}?from=${dateRange.from}T00:00:00&to=${dateRange.to}T23:59:59`),
        bookingApi.get(`/analytics/peak-hours/${lotId}`),
        bookingApi.get(`/analytics/occupancy/${lotId}?totalSpots=50`)
      ]);
      setRevenue(revRes.data.data);
      setPeakHours(peakRes.data.data);
      setOccupancy(occRes.data.data);
    } catch { toast.error('Failed to load analytics.'); }
    finally { setLoading(false); }
  };

  const maxBookings = Math.max(...(peakHours?.hourlyBreakdown?.map(h => h.bookingCount) || [1]));

  return (
    <div className="pe-page">
      <Navbar />
      <div className="pe-container pe-content">

        <div className="pe-page-header pe-fade-up">
          <h1 className="pe-page-title">Revenue & Analytics</h1>
          <p className="pe-page-subtitle">Lot #{lotId} performance overview</p>
        </div>

        {/* Date Filter */}
        <div className="pe-card mb-24 pe-fade-up">
          <div className="pe-card-header">
            <h3 className="pe-card-title"><FaFilter size={13} style={{ marginRight: 8 }} />Date Range</h3>
          </div>
          <div className="pe-card-body">
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="pe-form-group" style={{ flex: 1, minWidth: 160, marginBottom: 0 }}>
                <label className="pe-label">From</label>
                <input type="date" className="pe-input" value={dateRange.from}
                  onChange={e => setDateRange({ ...dateRange, from: e.target.value })} />
              </div>
              <div className="pe-form-group" style={{ flex: 1, minWidth: 160, marginBottom: 0 }}>
                <label className="pe-label">To</label>
                <input type="date" className="pe-input" value={dateRange.to}
                  onChange={e => setDateRange({ ...dateRange, to: e.target.value })} />
              </div>
              <button className="pe-btn pe-btn-primary" onClick={fetchAnalytics}>
                <FaCalendarAlt size={13} /> Apply Filter
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="pe-spinner"><div className="pe-spin" /></div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="pe-grid pe-grid-3 mb-24">
              <div className="pe-stat-card pe-fade-up pe-fade-up-1">
                <div className="pe-stat-icon green"><FaMoneyBill /></div>
                <div>
                  <div className="pe-stat-value" style={{ fontSize: '1.5rem' }}>
                    ₹{revenue?.totalRevenue?.toFixed(0) || 0}
                  </div>
                  <div className="pe-stat-label">Total Revenue</div>
                </div>
              </div>
              <div className="pe-stat-card pe-fade-up pe-fade-up-2">
                <div className="pe-stat-icon blue"><FaChartBar /></div>
                <div>
                  <div className="pe-stat-value">{revenue?.totalBookings || 0}</div>
                  <div className="pe-stat-label">Total Bookings</div>
                </div>
              </div>
              <div className="pe-stat-card pe-fade-up pe-fade-up-3">
                <div className="pe-stat-icon amber"><FaCalendarAlt /></div>
                <div>
                  <div className="pe-stat-value">{occupancy?.occupancyRate?.toFixed(1) || 0}%</div>
                  <div className="pe-stat-label">Occupancy Rate</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              {/* Daily Breakdown */}
              <div className="pe-card pe-fade-up">
                <div className="pe-card-header">
                  <h3 className="pe-card-title">Daily Revenue</h3>
                </div>
                {!revenue?.dailyBreakdown?.length ? (
                  <div className="pe-empty">
                    <div className="pe-empty-icon"><FaChartBar /></div>
                    <p className="pe-empty-title">No data</p>
                    <p className="pe-empty-text">No bookings in this date range.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="pe-table">
                      <thead>
                        <tr><th>Date</th><th>Bookings</th><th>Revenue</th></tr>
                      </thead>
                      <tbody>
                        {revenue.dailyBreakdown.map((d, i) => (
                          <tr key={i}>
                            <td>{new Date(d.date).toLocaleDateString()}</td>
                            <td>{d.bookings}</td>
                            <td style={{ color: 'var(--green)', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>
                              ₹{d.revenue?.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Peak Hours */}
              <div className="pe-card pe-fade-up">
                <div className="pe-card-header">
                  <h3 className="pe-card-title">Peak Hours</h3>
                  {peakHours?.peakHour !== undefined && (
                    <span className="pe-badge pe-badge-amber">
                      Peak: {peakHours.peakHour}:00
                    </span>
                  )}
                </div>
                <div className="pe-card-body">
                  {!peakHours?.hourlyBreakdown?.length ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>
                      No peak hour data available.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {peakHours.hourlyBreakdown.map((h, i) => {
                        const pct = maxBookings > 0 ? (h.bookingCount / maxBookings) * 100 : 0;
                        const isPeak = h.hour === peakHours.peakHour;
                        return (
                          <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: '0.8125rem', color: isPeak ? 'var(--amber)' : 'var(--text-secondary)', fontWeight: isPeak ? 600 : 400 }}>
                                {String(h.hour).padStart(2, '0')}:00 — {String(h.hour + 1).padStart(2, '0')}:00
                              </span>
                              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                {h.bookingCount} bookings
                              </span>
                            </div>
                            <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                              <div style={{
                                height: '100%',
                                width: `${pct}%`,
                                background: isPeak ? 'var(--amber)' : 'var(--surface-3)',
                                borderRadius: 99,
                                transition: 'width 0.6s ease',
                              }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Revenue;