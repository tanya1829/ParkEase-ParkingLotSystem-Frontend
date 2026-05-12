// src/pages/manager/ManageSpots.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { spotApi } from '../../services/api';
import Navbar from '../../components/Navbar';
import { FaPlus, FaTimes, FaTrash, FaBolt, FaWheelchair } from 'react-icons/fa';

const statusMap = {
  AVAILABLE: { cls: 'pe-badge-green', label: 'Available' },
  RESERVED:  { cls: 'pe-badge-amber', label: 'Reserved' },
  OCCUPIED:  { cls: 'pe-badge-red',   label: 'Occupied' },
};

const ManageSpots = () => {
  const { lotId } = useParams();
  const [spots, setSpots] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState('bulk');
  const [bulkForm, setBulkForm] = useState({ count: 10, spotNumberPrefix: 'A', floor: 1, spotType: 'STANDARD', vehicleType: '4W', pricePerHour: 50, isHandicapped: false, isEVCharging: false });
  const [singleForm, setSingleForm] = useState({ spotNumber: '', floor: 1, spotType: 'STANDARD', vehicleType: '4W', pricePerHour: 50, isHandicapped: false, isEVCharging: false });

  useEffect(() => { fetchSpots(); }, []);

  const fetchSpots = async () => {
    try {
      const res = await spotApi.get(`/spots/lot/${lotId}`);
      setSpots(res.data.data || []);
    } catch { toast.error('Failed to load spots.'); }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      await spotApi.post('/spots/bulk', { ...bulkForm, lotId: parseInt(lotId) });
      toast.success(`${bulkForm.count} spots created!`);
      setShowForm(false);
      fetchSpots();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    try {
      await spotApi.post('/spots', { ...singleForm, lotId: parseInt(lotId) });
      toast.success('Spot added!');
      setShowForm(false);
      fetchSpots();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const handleDelete = async (spotId) => {
    if (!window.confirm('Delete this spot?')) return;
    try {
      await spotApi.delete(`/spots/${spotId}`);
      toast.success('Spot deleted.');
      fetchSpots();
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot delete occupied spot.'); }
  };

  const available = spots.filter(s => s.status === 'AVAILABLE').length;
  const occupied  = spots.filter(s => s.status === 'OCCUPIED').length;
  const reserved  = spots.filter(s => s.status === 'RESERVED').length;

  const fieldStyle = { display: 'flex', flexDirection: 'column', gap: 6 };

  return (
    <div className="pe-page">
      <Navbar />
      <div className="pe-container pe-content">

        <div className="flex-between mb-24 pe-fade-up">
          <div className="pe-page-header" style={{ margin: 0 }}>
            <h1 className="pe-page-title">Manage Spots</h1>
            <p className="pe-page-subtitle">Lot #{lotId} · {spots.length} total spots</p>
          </div>
          <button className="pe-btn pe-btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? <><FaTimes size={13} /> Cancel</> : <><FaPlus size={13} /> Add Spots</>}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="pe-grid pe-grid-3 mb-24">
          <div className="pe-stat-card pe-fade-up pe-fade-up-1">
            <div className="pe-stat-icon green"><span style={{ fontSize: '1.2rem' }}>🟢</span></div>
            <div><div className="pe-stat-value">{available}</div><div className="pe-stat-label">Available</div></div>
          </div>
          <div className="pe-stat-card pe-fade-up pe-fade-up-2">
            <div className="pe-stat-icon amber"><span style={{ fontSize: '1.2rem' }}>🟡</span></div>
            <div><div className="pe-stat-value">{reserved}</div><div className="pe-stat-label">Reserved</div></div>
          </div>
          <div className="pe-stat-card pe-fade-up pe-fade-up-3">
            <div className="pe-stat-icon red"><span style={{ fontSize: '1.2rem' }}>🔴</span></div>
            <div><div className="pe-stat-value">{occupied}</div><div className="pe-stat-label">Occupied</div></div>
          </div>
        </div>

        {/* Add Spots Form */}
        {showForm && (
          <div className="pe-card mb-24 pe-fade-up">
            <div className="pe-card-header">
              <h3 className="pe-card-title">Add Spots</h3>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className={`pe-btn pe-btn-sm ${mode === 'bulk' ? 'pe-btn-primary' : 'pe-btn-ghost'}`} onClick={() => setMode('bulk')}>Bulk Add</button>
                <button className={`pe-btn pe-btn-sm ${mode === 'single' ? 'pe-btn-primary' : 'pe-btn-ghost'}`} onClick={() => setMode('single')}>Single Add</button>
              </div>
            </div>
            <div className="pe-card-body">
              {mode === 'bulk' ? (
                <form onSubmit={handleBulkSubmit}>
                  <div className="pe-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    <div style={fieldStyle}><label className="pe-label">Count</label>
                      <input type="number" className="pe-input" value={bulkForm.count} onChange={e => setBulkForm({ ...bulkForm, count: parseInt(e.target.value) })} /></div>
                    <div style={fieldStyle}><label className="pe-label">Prefix</label>
                      <input className="pe-input" value={bulkForm.spotNumberPrefix} onChange={e => setBulkForm({ ...bulkForm, spotNumberPrefix: e.target.value })} /></div>
                    <div style={fieldStyle}><label className="pe-label">Floor</label>
                      <input type="number" className="pe-input" value={bulkForm.floor} onChange={e => setBulkForm({ ...bulkForm, floor: parseInt(e.target.value) })} /></div>
                    <div style={fieldStyle}><label className="pe-label">Spot Type</label>
                      <select className="pe-select" value={bulkForm.spotType} onChange={e => setBulkForm({ ...bulkForm, spotType: e.target.value })}>
                        <option>STANDARD</option><option>COMPACT</option><option>LARGE</option><option>MOTORBIKE</option><option>EV</option>
                      </select></div>
                    <div style={fieldStyle}><label className="pe-label">Vehicle Type</label>
                      <select className="pe-select" value={bulkForm.vehicleType} onChange={e => setBulkForm({ ...bulkForm, vehicleType: e.target.value })}>
                        <option>4W</option><option>2W</option><option>HEAVY</option>
                      </select></div>
                    <div style={fieldStyle}><label className="pe-label">Price / Hr (₹)</label>
                      <input type="number" className="pe-input" value={bulkForm.pricePerHour} onChange={e => setBulkForm({ ...bulkForm, pricePerHour: parseFloat(e.target.value) })} /></div>
                  </div>
                  <button type="submit" className="pe-btn pe-btn-primary pe-btn-lg" style={{ marginTop: 20 }}>
                    <FaPlus size={13} /> Create {bulkForm.count} Spots
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSingleSubmit}>
                  <div className="pe-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    <div style={fieldStyle}><label className="pe-label">Spot Number</label>
                      <input className="pe-input" placeholder="A1" value={singleForm.spotNumber} onChange={e => setSingleForm({ ...singleForm, spotNumber: e.target.value })} required /></div>
                    <div style={fieldStyle}><label className="pe-label">Floor</label>
                      <input type="number" className="pe-input" value={singleForm.floor} onChange={e => setSingleForm({ ...singleForm, floor: parseInt(e.target.value) })} /></div>
                    <div style={fieldStyle}><label className="pe-label">Spot Type</label>
                      <select className="pe-select" value={singleForm.spotType} onChange={e => setSingleForm({ ...singleForm, spotType: e.target.value })}>
                        <option>STANDARD</option><option>COMPACT</option><option>LARGE</option><option>MOTORBIKE</option><option>EV</option>
                      </select></div>
                    <div style={fieldStyle}><label className="pe-label">Vehicle Type</label>
                      <select className="pe-select" value={singleForm.vehicleType} onChange={e => setSingleForm({ ...singleForm, vehicleType: e.target.value })}>
                        <option>4W</option><option>2W</option><option>HEAVY</option>
                      </select></div>
                    <div style={fieldStyle}><label className="pe-label">Price / Hr (₹)</label>
                      <input type="number" className="pe-input" value={singleForm.pricePerHour} onChange={e => setSingleForm({ ...singleForm, pricePerHour: parseFloat(e.target.value) })} /></div>
                  </div>
                  <button type="submit" className="pe-btn pe-btn-primary pe-btn-lg" style={{ marginTop: 20 }}>
                    <FaPlus size={13} /> Add Spot
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Spots Table */}
        <div className="pe-card pe-fade-up">
          <div className="pe-card-header">
            <h3 className="pe-card-title">All Spots</h3>
            <span className="pe-badge pe-badge-gray">{spots.length} total</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="pe-table">
              <thead>
                <tr><th>Spot #</th><th>Floor</th><th>Type</th><th>Vehicle</th><th>Price/Hr</th><th>Features</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {spots.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No spots added yet.</td></tr>
                ) : spots.map(s => {
                  const st = statusMap[s.status] || { cls: 'pe-badge-gray', label: s.status };
                  return (
                    <tr key={s.spotId}>
                      <td style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}>{s.spotNumber}</td>
                      <td>{s.floor}</td>
                      <td><span className="pe-badge pe-badge-blue">{s.spotType}</span></td>
                      <td>{s.vehicleType}</td>
                      <td style={{ color: 'var(--amber)', fontWeight: 600 }}>₹{s.pricePerHour}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {s.isEVCharging && <span className="pe-badge pe-badge-green"><FaBolt size={9} /> EV</span>}
                          {s.isHandicapped && <span className="pe-badge pe-badge-blue"><FaWheelchair size={9} /></span>}
                          {!s.isEVCharging && !s.isHandicapped && <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </div>
                      </td>
                      <td><span className={`pe-badge ${st.cls}`}>{st.label}</span></td>
                      <td>
                        {s.status === 'AVAILABLE' && (
                          <button className="pe-btn pe-btn-danger pe-btn-sm" onClick={() => handleDelete(s.spotId)}>
                            <FaTrash size={11} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManageSpots;