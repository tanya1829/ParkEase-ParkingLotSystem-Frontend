// src/pages/driver/MyBookings.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { bookingApi, paymentApi, notifApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { FaHistory, FaSignInAlt, FaSignOutAlt, FaTimes, FaArrowRight } from 'react-icons/fa';

const statusMap = {
  RESERVED:  { cls: 'pe-badge-amber',  label: 'Reserved' },
  ACTIVE:    { cls: 'pe-badge-green',  label: 'Active' },
  COMPLETED: { cls: 'pe-badge-gray',   label: 'Completed' },
  CANCELLED: { cls: 'pe-badge-red',    label: 'Cancelled' },
};

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState(null);
  const [payMode, setPayMode] = useState('UPI');
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingApi.get(`/bookings/user/${user.userId}`);
      setBookings(res.data.data || []);
    } catch { toast.error('Failed to load bookings.'); }
    finally { setLoading(false); }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      await bookingApi.put(`/bookings/${bookingId}/checkin`);
      await notifApi.post(`/notifications/trigger/checkin?userId=${user.userId}&bookingId=${bookingId}&spotNumber=Spot`);
      toast.success('Checked in successfully!');
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Check-in failed.'); }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      const res = await bookingApi.put(`/bookings/${bookingId}/checkout`);
      const amount = res.data.data?.totalAmount;
      await notifApi.post(`/notifications/trigger/checkout?userId=${user.userId}&bookingId=${bookingId}&totalAmount=${amount}`);
      toast.success(`Checked out! Total: ₹${amount}`);
      setPayModal({ bookingId, amount });
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Check-out failed.'); }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingApi.put(`/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled.');
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Cancel failed.'); }
  };

  const handlePayment = async () => {
    setPayLoading(true);
    try {
      const res = await paymentApi.post('/payments', {
        bookingId: payModal.bookingId,
        userId: user.userId,
        amount: payModal.amount,
        mode: payMode,
        description: `Parking fee for booking #${payModal.bookingId}`
      });
      await notifApi.post(`/notifications/trigger/payment?userId=${user.userId}&paymentId=${res.data.data.paymentId}&amount=${payModal.amount}&mode=${payMode}`);
      toast.success(`Payment of ₹${payModal.amount} done via ${payMode}!`);
      setPayModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed.'); }
    finally { setPayLoading(false); }
  };

  const activeCount = bookings.filter(b => b.status === 'ACTIVE' || b.status === 'RESERVED').length;

  return (
    <div className="pe-page">
      <Navbar />
      <div className="pe-container pe-content">

        <div className="pe-page-header pe-fade-up">
          <h1 className="pe-page-title">My Bookings</h1>
          <p className="pe-page-subtitle">
            {bookings.length} total booking{bookings.length !== 1 ? 's' : ''}
            {activeCount > 0 && <span className="pe-badge pe-badge-green" style={{ marginLeft: 10 }}>{activeCount} active</span>}
          </p>
        </div>

        {loading ? (
          <div className="pe-spinner"><div className="pe-spin" /></div>
        ) : bookings.length === 0 ? (
          <div className="pe-card">
            <div className="pe-empty">
              <div className="pe-empty-icon"><FaHistory /></div>
              <p className="pe-empty-title">No bookings yet</p>
              <p className="pe-empty-text">Your booking history will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="pe-card pe-fade-up">
            <div style={{ overflowX: 'auto' }}>
              <table className="pe-table">
                <thead>
                  <tr>
                    <th>#ID</th>
                    <th>Spot</th>
                    <th>Plate</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => {
                    const s = statusMap[b.status] || { cls: 'pe-badge-gray', label: b.status };
                    return (
                      <tr key={b.bookingId}>
                        <td className="fw">#{b.bookingId}</td>
                        <td>Spot {b.spotId}</td>
                        <td style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
                          {b.vehiclePlate}
                        </td>
                        <td style={{ fontSize: '0.8125rem' }}>{new Date(b.startTime).toLocaleString()}</td>
                        <td style={{ fontSize: '0.8125rem' }}>{new Date(b.endTime).toLocaleString()}</td>
                        <td style={{ color: 'var(--amber)', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>
                          ₹{b.totalAmount}
                        </td>
                        <td><span className={`pe-badge ${s.cls}`}>{s.label}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {b.status === 'RESERVED' && (
                              <>
                                <button className="pe-btn pe-btn-success pe-btn-sm" onClick={() => handleCheckIn(b.bookingId)}>
                                  <FaSignInAlt size={11} /> In
                                </button>
                                <button className="pe-btn pe-btn-danger pe-btn-sm" onClick={() => handleCancel(b.bookingId)}>
                                  <FaTimes size={11} />
                                </button>
                              </>
                            )}
                            {b.status === 'ACTIVE' && (
                              <button className="pe-btn pe-btn-primary pe-btn-sm" onClick={() => handleCheckOut(b.bookingId)}>
                                <FaSignOutAlt size={11} /> Out
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {payModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16
        }}>
          <div className="pe-card pe-fade-up" style={{ width: '100%', maxWidth: 420, boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
            <div className="pe-card-header">
              <h3 className="pe-card-title">Complete Payment</h3>
              <button
                onClick={() => setPayModal(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
              >
                <FaTimes size={16} />
              </button>
            </div>
            <div className="pe-card-body">

              {/* Amount Display */}
              <div style={{
                background: 'linear-gradient(135deg, var(--surface-2), rgba(245,166,35,0.06))',
                border: '1px solid var(--amber-border)',
                borderRadius: 'var(--radius-md)',
                padding: '20px 24px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 24
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Amount</span>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--amber)', letterSpacing: '-0.03em' }}>
                  ₹{payModal.amount}
                </span>
              </div>

              <div className="pe-form-group">
                <label className="pe-label">Payment Mode</label>
                <select className="pe-select" value={payMode} onChange={e => setPayMode(e.target.value)}>
                  <option value="UPI">📱  UPI</option>
                  <option value="CARD">💳  Card</option>
                  <option value="WALLET">👛  Wallet</option>
                  <option value="CASH">💵  Cash</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button className="pe-btn pe-btn-ghost" style={{ flex: 1 }} onClick={() => setPayModal(null)}>
                  Later
                </button>
                <button className="pe-btn pe-btn-primary pe-btn-lg" style={{ flex: 2 }} onClick={handlePayment} disabled={payLoading}>
                  {payLoading ? 'Processing…' : <><span>Pay Now</span><FaArrowRight size={14} /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;