// src/pages/driver/SearchLots.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { lotApi, spotApi } from '../../services/api';
import Navbar from '../../components/Navbar';
import { FaSearch, FaParking, FaClock, FaMapMarkerAlt, FaBolt, FaWheelchair, FaMap, FaList } from 'react-icons/fa';

// City images mapping
const cityImages = {
  'new delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80',
  'delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80',
  'mumbai': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&q=80',
  'bangalore': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&q=80',
  'hyderabad': 'https://images.unsplash.com/photo-1552301726-3d0e2f10e0b8?w=400&q=80',
  'chennai': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&q=80',
  'pune': 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400&q=80',
  'kolkata': 'https://images.unsplash.com/photo-1558431382-27e303142255?w=400&q=80',
  'ahmedabad': 'https://images.unsplash.com/photo-1609946860441-a51ffed3b7ef?w=400&q=80',
  'jaipur': 'https://images.unsplash.com/photo-1477587458883-47145ed31769?w=400&q=80',
  'surat': 'https://images.unsplash.com/photo-1609946860441-a51ffed3b7ef?w=400&q=80',
};

const getCityImage = (city) => {
  return cityImages[city?.toLowerCase()] || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&q=80';
};

const SearchLots = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [spotsLoading, setSpotsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

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

  const openInMaps = (lot) => {
    window.open(`https://www.openstreetmap.org/?mlat=${lot.latitude}&mlon=${lot.longitude}&zoom=16`, '_blank');
  };

  const getDirections = (lot) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lot.latitude},${lot.longitude}`, '_blank');
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
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
          <div className="pe-search-bar" style={{ maxWidth: 500, flex: 1 }}>
            <FaSearch size={16} style={{ color: 'var(--amber)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Enter city name (e.g. Mumbai, Delhi)…"
              value={city}
              onChange={e => setCity(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchLots(e)}
            />
            <button className="pe-btn pe-btn-primary pe-btn-sm" onClick={searchLots} disabled={loading} style={{ flexShrink: 0 }}>
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>

          {/* View toggle */}
          {lots.length > 0 && (
            <div style={{ display: 'flex', gap: 4, background: 'var(--surface-1)', padding: 4, borderRadius: 8, border: '1px solid var(--surface-2)' }}>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                  borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600,
                  background: viewMode === 'list' ? 'var(--amber)' : 'transparent',
                  color: viewMode === 'list' ? 'var(--obsidian)' : 'var(--text-secondary)',
                }}
              >
                <FaList size={12} /> List
              </button>
              <button
                onClick={() => setViewMode('map')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                  borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600,
                  background: viewMode === 'map' ? 'var(--amber)' : 'transparent',
                  color: viewMode === 'map' ? 'var(--obsidian)' : 'var(--text-secondary)',
                }}
              >
                <FaMap size={12} /> Map
              </button>
            </div>
          )}
        </div>

        {lots.length > 0 && (
          <>
            {/* MAP VIEW */}
            {viewMode === 'map' && (
              <div style={{ marginBottom: 24 }}>
                <p className="pe-section-label">{lots.length} Lot{lots.length !== 1 ? 's' : ''} Found — Map View</p>
                <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--surface-2)', height: 420 }}>
                  <iframe
                    title="parking-map"
                    width="100%"
                    height="420"
                    style={{ border: 0 }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${lots[0].longitude - 0.05},${lots[0].latitude - 0.05},${lots[0].longitude + 0.05},${lots[0].latitude + 0.05}&layer=mapnik&marker=${lots[0].latitude},${lots[0].longitude}`}
                  />
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {lots.map(lot => (
                    <button
                      key={lot.lotId}
                      onClick={() => openInMaps(lot)}
                      className="pe-btn pe-btn-ghost pe-btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <FaMapMarkerAlt size={11} style={{ color: 'var(--amber)' }} /> {lot.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* LIST VIEW */}
            {viewMode === 'list' && (
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
                      {/* City Image */}
                      <div style={{ height: 120, borderRadius: 8, overflow: 'hidden', marginBottom: 12, position: 'relative' }}>
                        <img
                          src={getCityImage(lot.city)}
                          alt={lot.city}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&q=80'; }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,14,18,0.85) 0%, transparent 60%)' }} />
                        <span className={`pe-badge ${lot.isOpen ? 'pe-badge-green' : 'pe-badge-red'}`} style={{ position: 'absolute', top: 8, right: 8 }}>
                          {lot.isOpen ? 'Open' : 'Closed'}
                        </span>
                        <span style={{ position: 'absolute', bottom: 8, left: 10, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                          {lot.name}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FaMapMarkerAlt size={11} /> {lot.address}, {lot.city}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                            <FaClock size={11} /> {lot.openTime} — {lot.closeTime}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--amber)', fontSize: '1.1rem' }}>
                            {lot.availableSpots}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 4 }}>spots free</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="pe-btn pe-btn-ghost pe-btn-sm" style={{ flex: 1 }}>
                          View Spots →
                        </button>
                        <button
                          className="pe-btn pe-btn-outline pe-btn-sm"
                          onClick={e => { e.stopPropagation(); getDirections(lot); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <FaMapMarkerAlt size={11} /> Directions
                        </button>
                      </div>
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
          </>
        )}

        {lots.length === 0 && !loading && (
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