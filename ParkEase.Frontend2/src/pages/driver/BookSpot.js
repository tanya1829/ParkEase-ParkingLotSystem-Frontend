// src/pages/driver/BookSpot.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bookingApi, notifApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { FaParking, FaMapMarkerAlt, FaTag, FaClock, FaArrowRight } from 'react-icons/fa';

const BookSpot = () => {
  const { user } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { lot, spot } = state || {};

  const now = new Date();
  const later = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const [form, setForm] = useState({
    vehiclePlate: '',
    vehicleType: '4W',
    bookingType: 'PRE',
    startTime: now.toISOString().slice(0, 16),
    endTime: later.toISOString().slice(0, 16),
  });
  const [loading, setLoading] = useState(false);

  if (!lot || !spot) {
    navigate('/driver/search');
    return null;
  }

  const calculateFare = () => {
    const start = new Date(form.startTime);
    const end = new Date(form.endTime);
    const hours = Math.max(1, (end - start) / (1000 * 60 * 60));
    return (hours * spot.pricePerHour).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await bookingApi.post('/bookings', {
        userId: user.userId,
        lotId: lot.lotId,
        spotId: spot.spotId,
        vehiclePlate: form.vehiclePlate.toUpperCase(),
        vehicleType: form.vehicleType,
        bookingType: form.bookingType,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        pricePerHour: spot.pricePerHour
      });

      if (res.data.success) {
        const bookingId = res.data.data.bookingId;
        await notifApi.post(
          `/notifications/trigger/booking-confirmation?userId=${user.userId}&bookingId=${bookingId}&spotNumber=${spot.spotNumber}`
        );
        toast.success('Booking confirmed! 🎉');
        navigate('/driver/bookings');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pe-page">
      <Navbar />
      <div className="pe-container pe-content">
        <div className="pe-page-header pe-fade-up">
          <h1 className="pe-page-title">Confirm Booking</h1>
          <p className="pe-page-subtitle">Review details and complete your reservation</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>

          {/* Left — Form */}
          <div className="pe-fade-up pe-fade-up-1">
            <div className="pe-card mb-16">
              <div className="pe-card-header">
                <h3 className="pe-card-title">Booking Details</h3>
              </div>
              <div className="pe-card-body">
                <form onSubmit={handleSubmit}>

                  <div className="pe-form-group">
                    <label className="pe-label">License Plate</label>
                    <input
                      type="text"
                      className="pe-input"
                      placeholder="e.g. UP80AB1234"
                      style={{ textTransform: 'uppercase' }}
                      value={form.vehiclePlate}
                      onChange={e => setForm({ ...form, vehiclePlate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="pe-form-group">
                    <label className="pe-label">Vehicle Type</label>
                    <select className="pe-select" value={form.vehicleType}
                      onChange={e => setForm({ ...form, vehicleType: e.target.value })}>
                      <option value="2W">🛵  2-Wheeler</option>
                      <option value="4W">🚗  4-Wheeler</option>
                      <option value="HEAVY">🚛  Heavy Vehicle</option>
                    </select>
                  </div>

                  <div className="pe-form-group">
                    <label className="pe-label">Booking Type</label>
                    <select className="pe-select" value={form.bookingType}
                      onChange={e => setForm({ ...form, bookingType: e.target.value })}>
                      <option value="PRE">📅  Pre-Booking (Advance)</option>
                      <option value="WALK_IN">⚡  Walk-In (Immediate)</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="pe-form-group">
                      <label className="pe-label">Start Time</label>
                      <input
                        type="datetime-local"
                        className="pe-input"
                        value={form.startTime}
                        onChange={e => setForm({ ...form, startTime: e.target.value })}
                        required
                      />
                    </div>
                    <div className="pe-form-group">
                      <label className="pe-label">End Time</label>
                      <input
                        type="datetime-local"
                        className="pe-input"
                        value={form.endTime}
                        onChange={e => setForm({ ...form, endTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button
                      type="button"
                      className="pe-btn pe-btn-ghost"
                      style={{ flex: 1 }}
                      onClick={() => navigate('/driver/search')}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="pe-btn pe-btn-primary pe-btn-lg"
                      style={{ flex: 2 }}
                      disabled={loading}
                    >
                      {loading ? 'Confirming…' : <><span>Confirm Booking</span><FaArrowRight size={14} /></>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right — Summary */}
          <div className="pe-fade-up pe-fade-up-2">

            {/* Spot Info Card */}
            <div className="pe-card mb-16">
              <div className="pe-card-header">
                <h3 className="pe-card-title">Spot Info</h3>
                <span className="pe-badge pe-badge-green">Available</span>
              </div>
              <div className="pe-card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px solid var(--surface-2)' }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                      {spot.spotNumber}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Floor {spot.floor}</div>
                    <span className="pe-badge pe-badge-blue" style={{ marginTop: 8 }}>{spot.spotType}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <FaParking style={{ color: 'var(--amber)', marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lot</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{lot.name}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <FaMapMarkerAlt style={{ color: 'var(--amber)', marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Address</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{lot.address}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <FaTag style={{ color: 'var(--amber)', marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rate</div>
                        <div style={{ color: 'var(--amber)', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>
                          ₹{spot.pricePerHour}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/hr</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fare Summary */}
            <div className="pe-card" style={{ background: 'linear-gradient(135deg, var(--surface-1), rgba(245,166,35,0.06))', border: '1px solid var(--amber-border)' }}>
              <div className="pe-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                    <FaClock size={14} /> Estimated Fare
                  </div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--amber)', letterSpacing: '-0.03em' }}>
                    ₹{calculateFare()}
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--amber-border)', paddingTop: 10 }}>
                  ⚠️ Minimum 1 hour charge applies. Final amount may vary.
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BookSpot;