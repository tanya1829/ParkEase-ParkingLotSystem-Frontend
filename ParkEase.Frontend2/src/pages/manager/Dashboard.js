// src/pages/manager/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { lotApi, bookingApi } from '../../services/api';
import Navbar from '../../components/Navbar';
import { FaParking, FaChartBar, FaList, FaPlus, FaToggleOn, FaToggleOff, FaEye, FaMoneyBill } from 'react-icons/fa';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [lots, setLots] = useState([]);
  const [stats, setStats] = useState({ totalLots: 0, openLots: 0, totalBookings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const lotsRes = await lotApi.get(`/lots/manager/${user.userId}`);
      const lotData = lotsRes.data.data || [];
      setLots(lotData);
      let totalBookings = 0;
      for (const lot of lotData) {
        try {
          const bRes = await bookingApi.get(`/bookings/lot/${lot.lotId}`);
          totalBookings += (bRes.data.data || []).length;
        } catch {}
      }
      setStats({ totalLots: lotData.length, openLots: lotData.filter(l => l.isOpen).length, totalBookings });
    } catch {}
    finally { setLoading(false); }
  };

  const toggleLot = async (lotId) => {
    try { await lotApi.put(`/lots/${lotId}/toggle`); fetchData(); }
    catch (err) { alert(err.response?.data?.message || 'Cannot toggle. Lot may not be approved yet.'); }
  };

  const statCards = [
    { icon: <FaParking />, color: 'amber', value: stats.totalLots,    label: 'My Lots' },
    { icon: <FaList />,    color: 'green', value: stats.openLots,     label: 'Open Lots' },
    { icon: <FaChartBar />,color: 'blue',  value: stats.totalBookings, label: 'Total Bookings' },
  ];

  return (
    <div className="pe-page">
      <Navbar />
      <div className="pe-container pe-content">

        <div className="pe-welcome pe-fade-up">
          <p className="pe-welcome-name">Manager Dashboard <span>🏢</span></p>
          <p className="pe-welcome-sub">Manage your parking lots and track performance.</p>
        </div>

        <p className="pe-section-label">Overview</p>
        <div className="pe-grid pe-grid-3 mb-24">
          {statCards.map((s, i) => (
            <div key={i} className={`pe-stat-card pe-fade-up pe-fade-up-${i+1}`}>
              <div className={`pe-stat-icon ${s.color}`}>{s.icon}</div>
              <div>
                <div className="pe-stat-value">{s.value}</div>
                <div className="pe-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="pe-section-label">Quick Actions</p>
        <div className="pe-grid pe-grid-3 mb-32">
          <Link to="/manager/lots" className="pe-action-tile pe-fade-up pe-fade-up-1">
            <div className="pe-action-tile-icon"><FaPlus /></div>Register New Lot
          </Link>
          <Link to="/manager/lots" className="pe-action-tile pe-fade-up pe-fade-up-2">
            <div className="pe-action-tile-icon"><FaList /></div>Manage My Lots
          </Link>
        </div>

        <div className="pe-card pe-fade-up">
          <div className="pe-card-header">
            <h3 className="pe-card-title">My Parking Lots</h3>
            <Link to="/manager/lots" className="pe-btn pe-btn-primary pe-btn-sm">
              <FaPlus size={11}/> Add Lot
            </Link>
          </div>
          {loading ? (
            <div className="pe-spinner"><div className="pe-spin" /></div>
          ) : lots.length === 0 ? (
            <div className="pe-empty">
              <div className="pe-empty-icon"><FaParking /></div>
              <p className="pe-empty-title">No lots registered</p>
              <p className="pe-empty-text">Register your first parking lot to start accepting bookings.</p>
              <Link to="/manager/lots" className="pe-btn pe-btn-primary"><FaPlus size={12}/> Register Lot</Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="pe-table">
                <thead>
                  <tr><th>Lot Name</th><th>City</th><th>Capacity</th><th>Status</th><th>Approval</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {lots.map(lot => (
                    <tr key={lot.lotId}>
                      <td className="fw">{lot.name}</td>
                      <td>{lot.city}</td>
                      <td>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{lot.availableSpots}</span>
                        <span style={{ color: 'var(--text-muted)' }}>/{lot.totalSpots}</span>
                      </td>
                      <td>
                        <span className={`pe-badge ${lot.isOpen ? 'pe-badge-green' : 'pe-badge-gray'}`}>
                          {lot.isOpen ? 'Open' : 'Closed'}
                        </span>
                      </td>
                      <td>
                        <span className={`pe-badge ${lot.isApproved ? 'pe-badge-green' : 'pe-badge-amber'}`}>
                          {lot.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            className={`pe-btn pe-btn-sm ${lot.isOpen ? 'pe-btn-danger' : 'pe-btn-success'}`}
                            onClick={() => toggleLot(lot.lotId)} disabled={!lot.isApproved}
                          >
                            {lot.isOpen ? <><FaToggleOff size={11}/> Close</> : <><FaToggleOn size={11}/> Open</>}
                          </button>
                          <Link className="pe-btn pe-btn-ghost pe-btn-sm" to={`/manager/spots/${lot.lotId}`}><FaEye size={11}/> Spots</Link>
                          <Link className="pe-btn pe-btn-ghost pe-btn-sm" to={`/manager/bookings/${lot.lotId}`}>Bookings</Link>
                          <Link className="pe-btn pe-btn-ghost pe-btn-sm" to={`/manager/revenue/${lot.lotId}`}><FaMoneyBill size={11}/></Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ManagerDashboard;
