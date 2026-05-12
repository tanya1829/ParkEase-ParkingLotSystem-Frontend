// src/pages/driver/MyVehicles.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { vehicleApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { FaCar, FaPlus, FaTimes, FaTrash, FaBolt } from 'react-icons/fa';

const MyVehicles = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ licensePlate: '', make: '', model: '', color: '', vehicleType: '4W', isEV: false });

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    try {
      const res = await vehicleApi.get(`/vehicles/owner/${user.userId}`);
      setVehicles(res.data.data || []);
    } catch { toast.error('Failed to load vehicles.'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await vehicleApi.post('/vehicles', { ...form, ownerId: user.userId });
      toast.success('Vehicle registered!');
      setShowForm(false);
      setForm({ licensePlate: '', make: '', model: '', color: '', vehicleType: '4W', isEV: false });
      fetchVehicles();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to register vehicle.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this vehicle?')) return;
    try {
      await vehicleApi.delete(`/vehicles/${id}`);
      toast.success('Vehicle removed.');
      fetchVehicles();
    } catch { toast.error('Failed to remove vehicle.'); }
  };

  return (
    <div className="pe-page">
      <Navbar />
      <div className="pe-container pe-content">

        <div className="flex-between mb-32 pe-fade-up">
          <div className="pe-page-header" style={{ margin: 0 }}>
            <h1 className="pe-page-title">My Vehicles</h1>
            <p className="pe-page-subtitle">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered</p>
          </div>
          <button className="pe-btn pe-btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? <><FaTimes size={13} /> Cancel</> : <><FaPlus size={13} /> Add Vehicle</>}
          </button>
        </div>

        {/* Add Vehicle Form */}
        {showForm && (
          <div className="pe-card mb-24 pe-fade-up">
            <div className="pe-card-header">
              <h3 className="pe-card-title">Register New Vehicle</h3>
            </div>
            <div className="pe-card-body">
              <form onSubmit={handleSubmit}>
                <div className="pe-grid pe-grid-3">
                  <div className="pe-form-group">
                    <label className="pe-label">License Plate</label>
                    <input className="pe-input" placeholder="UP80AB1234"
                      style={{ textTransform: 'uppercase' }}
                      value={form.licensePlate}
                      onChange={e => setForm({ ...form, licensePlate: e.target.value })} required />
                  </div>
                  <div className="pe-form-group">
                    <label className="pe-label">Make</label>
                    <input className="pe-input" placeholder="Honda"
                      value={form.make} onChange={e => setForm({ ...form, make: e.target.value })} required />
                  </div>
                  <div className="pe-form-group">
                    <label className="pe-label">Model</label>
                    <input className="pe-input" placeholder="City"
                      value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} required />
                  </div>
                  <div className="pe-form-group">
                    <label className="pe-label">Color</label>
                    <input className="pe-input" placeholder="White"
                      value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
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
                  <div className="pe-form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                      padding: '11px 16px', background: 'var(--surface-0)',
                      border: `1px solid ${form.isEV ? 'var(--green)' : 'var(--surface-2)'}`,
                      borderRadius: 'var(--radius-sm)', width: '100%', transition: 'var(--transition)'
                    }}>
                      <input type="checkbox" checked={form.isEV}
                        onChange={e => setForm({ ...form, isEV: e.target.checked })}
                        style={{ width: 16, height: 16, accentColor: 'var(--green)' }} />
                      <span style={{ color: form.isEV ? 'var(--green)' : 'var(--text-secondary)' }}>
                        <FaBolt size={13} style={{ marginRight: 6 }} />Electric Vehicle (EV)
                      </span>
                    </label>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <button type="submit" className="pe-btn pe-btn-primary pe-btn-lg">
                    <FaPlus size={13} /> Register Vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Vehicles Grid */}
        {vehicles.length === 0 ? (
          <div className="pe-card pe-fade-up">
            <div className="pe-empty">
              <div className="pe-empty-icon"><FaCar /></div>
              <p className="pe-empty-title">No vehicles yet</p>
              <p className="pe-empty-text">Add your first vehicle to speed up bookings.</p>
              <button className="pe-btn pe-btn-primary" onClick={() => setShowForm(true)}>
                <FaPlus size={13} /> Add Vehicle
              </button>
            </div>
          </div>
        ) : (
          <div className="pe-grid pe-grid-3">
            {vehicles.map((v, i) => (
              <div key={v.vehicleId} className={`pe-card pe-fade-up pe-fade-up-${(i % 4) + 1}`}>
                <div className="pe-card-body">
                  {/* Plate */}
                  <div style={{
                    background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)',
                    padding: '10px 16px', marginBottom: 16, textAlign: 'center',
                    fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.25rem',
                    color: 'var(--text-primary)', letterSpacing: '0.08em', border: '1px solid var(--surface-3)'
                  }}>
                    {v.licensePlate}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {v.make} {v.model}
                    </div>
                    <span className="pe-badge pe-badge-blue">{v.vehicleType}</span>
                  </div>

                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: 12 }}>
                    🎨 {v.color || 'Color not specified'}
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {v.isEV && (
                      <span className="pe-badge pe-badge-green"><FaBolt size={10} /> Electric</span>
                    )}
                    <span className={`pe-badge ${v.isActive ? 'pe-badge-green' : 'pe-badge-red'}`}>
                      {v.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--surface-2)' }}>
                  <button className="pe-btn pe-btn-danger pe-btn-sm w-full"
                    onClick={() => handleDelete(v.vehicleId)}>
                    <FaTrash size={11} /> Remove Vehicle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVehicles;