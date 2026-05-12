// src/pages/admin/AllBookings.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { bookingApi, lotApi } from '../../services/api';
import Navbar from '../../components/Navbar';
import { FaHistory, FaChevronDown } from 'react-icons/fa';

const statusMap = {
  RESERVED:  { cls: 'pe-badge-amber', label: 'Reserved' },
  ACTIVE:    { cls: 'pe-badge-green', label: 'Active' },
  COMPLETED: { cls: 'pe-badge-gray',  label: 'Completed' },
  CANCELLED: { cls: 'pe-badge-red',   label: 'Cancelled' },
};

const filters = ['ALL', 'RESERVED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

const AllBookings = () => {
  const [lots, setLots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedLot, setSelectedLot] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchLots(); }, []);

  const fetchLots = async () => {
    try {
      const res = await lotApi.get('/lots');
      setLots(res.data.data || []);
    } catch {}
  };

  const fetchBookings = async (lotId) => {
    setLoading(true);
    try {
      const res = await bookingApi.get(`/bookings/lot/${lotId}`);
      setBookings(res.data.data || []);
    } catch { toast.error('Failed to load bookings.'); }
    finally { setLoading(false); }
  };

  const handleLotChange = (lotId) => {
    setSelectedLot(lotId);
    setFilter('ALL');
    if (lotId) fetchBookings(lotId);
    else setBookings([]);
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);
  const selectedLotName = lots.find(l => String(l.lotId) === String(selectedLot))?.name;

  return (
    <div className="pe-page">
      <Navbar />
      <div className="pe-container pe-content">

        <div className="pe-page-header pe-fade-up">
          <h1 className="pe-page-title">All Bookings</h1>
          <p className="pe-page-subtitle">Platform-wide booking management</p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }} className="pe-fade-up">
          {/* Lot Selector */}
          <div style={{ position: 'relative', flex: '1', minWidth: 220 }}>
            <select
              className="pe-select"
              value={selectedLot}
              onChange={e => handleLotChange(e.target.value)}
              style={{ paddingRight: 36 }}
            >
              <option value="">— Select a Lot —</option>
              {lots.map(lot => (
                <option key={lot.lotId} value={lot.lotId}>{lot.name} · {lot.city}</option>
              ))}
            </select>
            <FaChevronDown size={12} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          </div>

          {/* Status Filters */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {filters.map(f => (
              <button
                key={f}
                className={`pe-btn pe-btn-sm ${filter === f ? 'pe-btn-primary' : 'pe-btn-ghost'}`}
                onClick={() => setFilter(f)}
                disabled={!selectedLot}
              >
                {f}
                {f !== 'ALL' && selectedLot && (
                  <span style={{ marginLeft: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 99, padding: '1px 7px', fontSize: '0.7rem' }}>
                    {bookings.filter(b => b.status === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {!selectedLot ? (
          <div className="pe-card pe-fade-up">
            <div className="pe-empty">
              <div className="pe-empty-icon"><FaHistory /></div>
              <p className="pe-empty-title">Select a lot</p>
              <p className="pe-empty-text">Choose a parking lot from the dropdown above to view its bookings.</p>
            </div>
          </div>
        ) : loading ? (
          <div className="pe-spinner"><div className="pe-spin" /></div>
        ) : (
          <div className="pe-card pe-fade-up">
            <div className="pe-card-header">
              <h3 className="pe-card-title">
                {selectedLotName} — {filter === 'ALL' ? 'All Bookings' : filter}
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
                    <tr><th>#ID</th><th>User</th><th>Spot</th><th>Plate</th><th>Type</th><th>Start</th><th>End</th><th>Amount</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(b => {
                      const s = statusMap[b.status] || { cls: 'pe-badge-gray', label: b.status };
                      return (
                        <tr key={b.bookingId}>
                          <td className="fw">#{b.bookingId}</td>
                          <td style={{ color: 'var(--text-muted)' }}>#{b.userId}</td>
                          <td>#{b.spotId}</td>
                          <td style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
                            {b.vehiclePlate}
                          </td>
                          <td><span className="pe-badge pe-badge-blue">{b.bookingType}</span></td>
                          <td style={{ fontSize: '0.8125rem' }}>{new Date(b.startTime).toLocaleDateString()}</td>
                          <td style={{ fontSize: '0.8125rem' }}>{new Date(b.endTime).toLocaleDateString()}</td>
                          <td style={{ color: 'var(--amber)', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>₹{b.totalAmount}</td>
                          <td><span className={`pe-badge ${s.cls}`}>{s.label}</span></td>
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

export default AllBookings;