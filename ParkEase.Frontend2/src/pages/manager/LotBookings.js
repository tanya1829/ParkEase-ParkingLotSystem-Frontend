// src/pages/manager/LotBookings.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bookingApi } from '../../services/api';
import Navbar from '../../components/Navbar';
import { FaHistory, FaSignOutAlt } from 'react-icons/fa';

const statusMap = {
  RESERVED:  { cls: 'pe-badge-amber', label: 'Reserved' },
  ACTIVE:    { cls: 'pe-badge-green', label: 'Active' },
  COMPLETED: { cls: 'pe-badge-gray',  label: 'Completed' },
  CANCELLED: { cls: 'pe-badge-red',   label: 'Cancelled' },
};

const filters = ['ALL', 'RESERVED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

const LotBookings = () => {
  const { lotId } = useParams();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingApi.get(`/bookings/lot/${lotId}`);
      setBookings(res.data.data || []);
    } catch { toast.error('Failed to load bookings.'); }
    finally { setLoading(false); }
  };

  const handleForceCheckout = async (bookingId) => {
    if (!window.confirm('Force checkout this booking?')) return;
    try {
      await bookingApi.put(`/bookings/${bookingId}/checkout`);
      toast.success('Force checkout done.');
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="pe-page">
      <Navbar />
      <div className="pe-container pe-content">

        <div className="pe-page-header pe-fade-up">
          <h1 className="pe-page-title">Lot Bookings</h1>
          <p className="pe-page-subtitle">Lot #{lotId} · {bookings.length} total bookings</p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }} className="pe-fade-up">
          {filters.map(f => (
            <button
              key={f}
              className={`pe-btn pe-btn-sm ${filter === f ? 'pe-btn-primary' : 'pe-btn-ghost'}`}
              onClick={() => setFilter(f)}
            >
              {f}
              {f !== 'ALL' && (
                <span style={{
                  marginLeft: 6, background: 'rgba(255,255,255,0.15)',
                  borderRadius: 99, padding: '1px 7px', fontSize: '0.7rem'
                }}>
                  {bookings.filter(b => b.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="pe-spinner"><div className="pe-spin" /></div>
        ) : (
          <div className="pe-card pe-fade-up">
            <div className="pe-card-header">
              <h3 className="pe-card-title">
                {filter === 'ALL' ? 'All Bookings' : `${filter} Bookings`}
              </h3>
              <span className="pe-badge pe-badge-gray">{filtered.length} records</span>
            </div>
            {filtered.length === 0 ? (
              <div className="pe-empty">
                <div className="pe-empty-icon"><FaHistory /></div>
                <p className="pe-empty-title">No bookings found</p>
                <p className="pe-empty-text">No {filter !== 'ALL' ? filter.toLowerCase() : ''} bookings for this lot.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="pe-table">
                  <thead>
                    <tr>
                      <th>#ID</th><th>User</th><th>Spot</th><th>Plate</th>
                      <th>Check In</th><th>Check Out</th><th>Amount</th><th>Status</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(b => {
                      const s = statusMap[b.status] || { cls: 'pe-badge-gray', label: b.status };
                      return (
                        <tr key={b.bookingId}>
                          <td className="fw">#{b.bookingId}</td>
                          <td style={{ color: 'var(--text-muted)' }}>User #{b.userId}</td>
                          <td>Spot #{b.spotId}</td>
                          <td style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
                            {b.vehiclePlate}
                          </td>
                          <td style={{ fontSize: '0.8125rem' }}>
                            {b.checkInTime ? new Date(b.checkInTime).toLocaleString() : '—'}
                          </td>
                          <td style={{ fontSize: '0.8125rem' }}>
                            {b.checkOutTime ? new Date(b.checkOutTime).toLocaleString() : '—'}
                          </td>
                          <td style={{ color: 'var(--amber)', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>
                            ₹{b.totalAmount}
                          </td>
                          <td><span className={`pe-badge ${s.cls}`}>{s.label}</span></td>
                          <td>
                            {b.status === 'ACTIVE' && (
                              <button className="pe-btn pe-btn-danger pe-btn-sm"
                                onClick={() => handleForceCheckout(b.bookingId)}>
                                <FaSignOutAlt size={11} /> Force Out
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

export default LotBookings;