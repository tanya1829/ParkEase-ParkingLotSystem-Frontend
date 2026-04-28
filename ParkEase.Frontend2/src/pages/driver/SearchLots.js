// src/pages/driver/SearchLots.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { lotApi, spotApi } from '../../services/api';
import Navbar from '../../components/Navbar';
import { FaSearch, FaParking, FaClock, FaMapMarkerAlt, FaBolt, FaWheelchair } from 'react-icons/fa';

const SearchLots = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [spotsLoading, setSpotsLoading] = useState(false);

  const searchLots = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    setLoading(true);
    setSelectedLot(null);
    setSpots([]);
    try {
      const res = await lotApi.get(`/lots/city/${city}`);
      setLots(res.data.data || []);
      if ((res.data.data || []).length === 0) toast.info('No lots found in this city.');
    } catch { toast.error('Failed to search lots.'); }
    finally { setLoading(false); }
  };

  const viewSpots = async (lot) => {
    setSelectedLot(lot);
    setSpotsLoading(true);
    try {
      const res = await spotApi.get(`/spots/lot/${lot.lotId}/available`);
      setSpots(res.data.data || []);
    } catch { toast.error('Failed to load spots.'); }
    finally { setSpotsLoading(false); }
  };

  return (
    <div className="pe-page">
      <Navbar />
      <div className="pe-container pe-content">

        <div className="pe-page-header">
          <h1 className="pe-page-title">Find Parking</h1>
          <p className="pe-page-subtitle">Search for available spots near you</p>
        </div>

        {/* Search Bar */}
        <div className="pe-search-bar mb-32" style={{ maxWidth: 600 }}>
          <FaSearch size={16} style={{ color: 'var(--amber)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Enter city name (e.g. Mathura, Delhi)…"
            value={city}
            onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchLots(e)}
          />
          <button className="pe-btn pe-btn-primary pe-btn-sm" onClick={searchLots} disabled={loading} style={{ flexShrink: 0 }}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>

        {lots.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: selectedLot ? '420px 1fr' : '1fr', gap: 20 }}>
            {/* Lots List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p className="pe-section-label">{lots.length} Lot{lots.length !== 1 ? 's' : ''} Found</p>
              {lots.map(lot => (
                <div
                  key={lot.lotId}
                  className={`pe-lot-card ${selectedLot?.lotId === lot.lotId ? 'selected' : ''}`}
                  onClick={() => viewSpots(lot)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                        <FaParking style={{ color: 'var(--amber)', marginRight: 8 }} />{lot.name}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FaMapMarkerAlt size={11} /> {lot.address}, {lot.city}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <FaClock size={11} /> {lot.openTime} — {lot.closeTime}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                      <span className={`pe-badge ${lot.isOpen ? 'pe-badge-green' : 'pe-badge-red'}`} style={{ display: 'block', marginBottom: 6 }}>
                        {lot.isOpen ? 'Open' : 'Closed'}
                      </span>
                      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--amber)', fontSize: '1.1rem' }}>
                        {lot.availableSpots}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 4 }}>spots free</span>
                    </div>
                  </div>
                  <button className="pe-btn pe-btn-ghost pe-btn-sm w-full">
                    View Available Spots →
                  </button>
                </div>
              ))}
            </div>

            {/* Spots Panel */}
            {selectedLot && (
              <div>
                <p className="pe-section-label">Spots at {selectedLot.name}</p>
                {spotsLoading ? (
                  <div className="pe-spinner"><div className="pe-spin" /></div>
                ) : spots.length === 0 ? (
                  <div className="pe-card">
                    <div className="pe-empty">
                      <div className="pe-empty-icon"><FaParking /></div>
                      <p className="pe-empty-title">No available spots</p>
                      <p className="pe-empty-text">All spots are currently occupied at this lot.</p>
                    </div>
                  </div>
                ) : (
                  <div className="pe-grid pe-grid-auto">
                    {spots.map(spot => (
                      <div key={spot.spotId} className="pe-spot-card available">
                        <div className="pe-spot-number">{spot.spotNumber}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '4px 0' }}>Floor {spot.floor}</div>
                        <span className="pe-badge pe-badge-blue" style={{ marginBottom: 6 }}>{spot.spotType}</span>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--green)', fontSize: '1.1rem', margin: '6px 0' }}>
                          ₹{spot.pricePerHour}<span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)' }}>/hr</span>
                        </div>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                          {spot.isEVCharging && <span className="pe-badge pe-badge-green"><FaBolt size={9}/> EV</span>}
                          {spot.isHandicapped && <span className="pe-badge pe-badge-blue"><FaWheelchair size={9}/> Access</span>}
                        </div>
                        <button
                          className="pe-btn pe-btn-success pe-btn-sm w-full"
                          onClick={() => navigate(`/driver/book/${selectedLot.lotId}/${spot.spotId}`, { state: { lot: selectedLot, spot } })}
                        >
                          Book Now
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {lots.length === 0 && !loading && city && (
          <div className="pe-card">
            <div className="pe-empty">
              <div className="pe-empty-icon"><FaSearch /></div>
              <p className="pe-empty-title">Search for parking</p>
              <p className="pe-empty-text">Enter a city name above to find available parking lots near you.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SearchLots;
