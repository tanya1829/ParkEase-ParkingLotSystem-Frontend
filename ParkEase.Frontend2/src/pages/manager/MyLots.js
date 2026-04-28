// src/pages/manager/MyLots.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { lotApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { FaPlus, FaTimes, FaParking, FaMapMarkerAlt, FaClock, FaEye, FaHistory, FaMoneyBill } from 'react-icons/fa';

const MyLots = () => {
  const { user } = useAuth();
  const [lots, setLots] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', city: '', totalSpots: '', openTime: '08:00', closeTime: '22:00' });

  useEffect(() => { fetchLots(); }, []);

  const fetchLots = async () => {
    try {
      const res = await lotApi.get(`/lots/manager/${user.userId}`);
      setLots(res.data.data || []);
    } catch { toast.error('Failed to load lots.'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await lotApi.post('/lots', { ...form, managerId: user.userId, totalSpots: parseInt(form.totalSpots) });
      toast.success('Lot registered! Awaiting admin approval.');
      setShowForm(false);
      setForm({ name: '', address: '', city: '', totalSpots: '', openTime: '08:00', closeTime: '22:00' });
      fetchLots();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to register lot.'); }
  };

  return (
    <div className="pe-page">
      <Navbar />
      <div className="pe-container pe-content">

        <div className="flex-between mb-32 pe-fade-up">
          <div className="pe-page-header" style={{ margin: 0 }}>
            <h1 className="pe-page-title">My Parking Lots</h1>
            <p className="pe-page-subtitle">{lots.length} lot{lots.length !== 1 ? 's' : ''} registered</p>
          </div>
          <button className="pe-btn pe-btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? <><FaTimes size={13} /> Cancel</> : <><FaPlus size={13} /> Register New Lot</>}
          </button>
        </div>

        {/* Register Form */}
        {showForm && (
          <div className="pe-card mb-24 pe-fade-up">
            <div className="pe-card-header">
              <h3 className="pe-card-title">Register New Parking Lot</h3>
            </div>
            <div className="pe-card-body">
              <form onSubmit={handleSubmit}>
                <div className="pe-grid pe-grid-2">
                  <div className="pe-form-group">
                    <label className="pe-label">Lot Name</label>
                    <input className="pe-input" placeholder="City Mall Parking"
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="pe-form-group">
                    <label className="pe-label">City</label>
                    <input className="pe-input" placeholder="Mathura"
                      value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required />
                  </div>
                  <div className="pe-form-group">
                    <label className="pe-label">Address</label>
                    <input className="pe-input" placeholder="123 MG Road"
                      value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
                  </div>
                  <div className="pe-form-group">
                    <label className="pe-label">Total Spots</label>
                    <input type="number" className="pe-input" placeholder="50"
                      value={form.totalSpots} onChange={e => setForm({ ...form, totalSpots: e.target.value })} required />
                  </div>
                  <div className="pe-form-group">
                    <label className="pe-label">Opening Time</label>
                    <input type="time" className="pe-input"
                      value={form.openTime} onChange={e => setForm({ ...form, openTime: e.target.value })} />
                  </div>
                  <div className="pe-form-group">
                    <label className="pe-label">Closing Time</label>
                    <input type="time" className="pe-input"
                      value={form.closeTime} onChange={e => setForm({ ...form, closeTime: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="pe-btn pe-btn-primary pe-btn-lg">
                  <FaPlus size={13} /> Register Lot
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Lots Grid */}
        {lots.length === 0 ? (
          <div className="pe-card pe-fade-up">
            <div className="pe-empty">
              <div className="pe-empty-icon"><FaParking /></div>
              <p className="pe-empty-title">No lots registered</p>
              <p className="pe-empty-text">Register your first parking lot to start accepting bookings.</p>
              <button className="pe-btn pe-btn-primary" onClick={() => setShowForm(true)}>
                <FaPlus size={13} /> Register Lot
              </button>
            </div>
          </div>
        ) : (
          <div className="pe-grid pe-grid-2">
            {lots.map((lot, i) => (
              <div key={lot.lotId} className={`pe-card pe-fade-up pe-fade-up-${(i % 4) + 1}`}>
                <div className="pe-card-header">
                  <div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                      <FaParking style={{ color: 'var(--amber)', marginRight: 8 }} />{lot.name}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span className={`pe-badge ${lot.isApproved ? 'pe-badge-green' : 'pe-badge-amber'}`}>
                      {lot.isApproved ? 'Approved' : 'Pending'}
                    </span>
                    <span className={`pe-badge ${lot.isOpen ? 'pe-badge-green' : 'pe-badge-gray'}`}>
                      {lot.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
                <div className="pe-card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <FaMapMarkerAlt style={{ color: 'var(--amber)', flexShrink: 0 }} size={12} />
                      {lot.address}, {lot.city}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <FaClock style={{ color: 'var(--amber)', flexShrink: 0 }} size={12} />
                      {lot.openTime} — {lot.closeTime}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FaParking style={{ color: 'var(--amber)', flexShrink: 0 }} size={12} />
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{lot.availableSpots}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>/ {lot.totalSpots} spots available</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link className="pe-btn pe-btn-ghost pe-btn-sm" style={{ flex: 1, justifyContent: 'center' }} to={`/manager/spots/${lot.lotId}`}>
                      <FaEye size={11} /> Spots
                    </Link>
                    <Link className="pe-btn pe-btn-ghost pe-btn-sm" style={{ flex: 1, justifyContent: 'center' }} to={`/manager/bookings/${lot.lotId}`}>
                      <FaHistory size={11} /> Bookings
                    </Link>
                    <Link className="pe-btn pe-btn-primary pe-btn-sm" style={{ flex: 1, justifyContent: 'center' }} to={`/manager/revenue/${lot.lotId}`}>
                      <FaMoneyBill size={11} /> Revenue
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLots;