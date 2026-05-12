// src/pages/admin/ApproveLots.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { lotApi } from '../../services/api';
import Navbar from '../../components/Navbar';
import { FaParking, FaCheck, FaTimes, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';

const ApproveLots = () => {
  const [pendingLots, setPendingLots] = useState([]);
  const [allLots, setAllLots] = useState([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLots(); }, []);

  const fetchLots = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        lotApi.get('/lots/pending'),
        lotApi.get('/lots')
      ]);
      setPendingLots(pendingRes.data.data || []);
      setAllLots(allRes.data.data || []);
    } catch { toast.error('Failed to load lots.'); }
    finally { setLoading(false); }
  };

  const handleApprove = async (lotId) => {
    try {
      await lotApi.put(`/lots/${lotId}/approve`);
      toast.success('Lot approved!');
      fetchLots();
    } catch { toast.error('Failed to approve.'); }
  };

  const handleReject = async (lotId) => {
    if (!window.confirm('Reject and delete this lot?')) return;
    try {
      await lotApi.put(`/lots/${lotId}/reject`);
      toast.success('Lot rejected.');
      fetchLots();
    } catch { toast.error('Failed to reject.'); }
  };

  const handleDelete = async (lotId) => {
    if (!window.confirm('Permanently delete this lot?')) return;
    try {
      await lotApi.delete(`/lots/${lotId}`);
      toast.success('Lot deleted.');
      fetchLots();
    } catch { toast.error('Failed to delete.'); }
  };

  const displayLots = tab === 'pending' ? pendingLots : allLots;

  return (
    <div className="pe-page">
      <Navbar />
      <div className="pe-container pe-content">

        <div className="pe-page-header pe-fade-up">
          <h1 className="pe-page-title">Parking Lot Management</h1>
          <p className="pe-page-subtitle">Review and approve lot registration requests</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }} className="pe-fade-up">
          <button
            className={`pe-btn pe-btn-sm ${tab === 'pending' ? 'pe-btn-primary' : 'pe-btn-ghost'}`}
            onClick={() => setTab('pending')}
          >
            Pending Approval
            <span style={{ marginLeft: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '1px 8px', fontSize: '0.75rem' }}>
              {pendingLots.length}
            </span>
          </button>
          <button
            className={`pe-btn pe-btn-sm ${tab === 'all' ? 'pe-btn-primary' : 'pe-btn-ghost'}`}
            onClick={() => setTab('all')}
          >
            All Lots
            <span style={{ marginLeft: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '1px 8px', fontSize: '0.75rem' }}>
              {allLots.length}
            </span>
          </button>
        </div>

        {loading ? (
          <div className="pe-spinner"><div className="pe-spin" /></div>
        ) : displayLots.length === 0 ? (
          <div className="pe-card pe-fade-up">
            <div className="pe-empty">
              <div className="pe-empty-icon"><FaParking /></div>
              <p className="pe-empty-title">
                {tab === 'pending' ? 'No pending requests' : 'No lots found'}
              </p>
              <p className="pe-empty-text">
                {tab === 'pending' ? 'All lot requests have been reviewed.' : 'No parking lots registered yet.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="pe-card pe-fade-up">
            <div className="pe-card-header">
              <h3 className="pe-card-title">
                {tab === 'pending' ? 'Pending Approvals' : 'All Parking Lots'}
              </h3>
              <span className="pe-badge pe-badge-gray">{displayLots.length} lots</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="pe-table">
                <thead>
                  <tr><th>#ID</th><th>Name</th><th>Location</th><th>Manager</th><th>Spots</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {displayLots.map(lot => (
                    <tr key={lot.lotId}>
                      <td className="fw">#{lot.lotId}</td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{lot.name}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          <FaMapMarkerAlt size={11} style={{ color: 'var(--amber)' }} />
                          {lot.city}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>#{lot.managerId}</td>
                      <td>{lot.totalSpots}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span className={`pe-badge ${lot.isApproved ? 'pe-badge-green' : 'pe-badge-amber'}`}>
                            {lot.isApproved ? 'Approved' : 'Pending'}
                          </span>
                          <span className={`pe-badge ${lot.isOpen ? 'pe-badge-green' : 'pe-badge-gray'}`}>
                            {lot.isOpen ? 'Open' : 'Closed'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {!lot.isApproved && (
                            <>
                              <button className="pe-btn pe-btn-success pe-btn-sm" onClick={() => handleApprove(lot.lotId)}>
                                <FaCheck size={11} /> Approve
                              </button>
                              <button className="pe-btn pe-btn-danger pe-btn-sm" onClick={() => handleReject(lot.lotId)}>
                                <FaTimes size={11} /> Reject
                              </button>
                            </>
                          )}
                          {lot.isApproved && (
                            <button className="pe-btn pe-btn-danger pe-btn-sm" onClick={() => handleDelete(lot.lotId)}>
                              <FaTrash size={11} /> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApproveLots;