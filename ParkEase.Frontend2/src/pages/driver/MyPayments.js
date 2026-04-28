// src/pages/driver/MyPayments.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { paymentApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { FaMoneyBill, FaCheckCircle, FaUndo } from 'react-icons/fa';

const statusMap = {
  PAID:     { cls: 'pe-badge-green',  label: 'Paid' },
  PENDING:  { cls: 'pe-badge-amber',  label: 'Pending' },
  REFUNDED: { cls: 'pe-badge-blue',   label: 'Refunded' },
  FAILED:   { cls: 'pe-badge-red',    label: 'Failed' },
};

const modeIcon = { UPI: '📱', CARD: '💳', WALLET: '👛', CASH: '💵' };

const MyPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      const res = await paymentApi.get(`/payments/user/${user.userId}/history`);
      setPayments(res.data.data || []);
    } catch { toast.error('Failed to load payments.'); }
    finally { setLoading(false); }
  };

  const handleRefund = async (paymentId) => {
    if (!window.confirm('Request refund for this payment?')) return;
    try {
      await paymentApi.post('/payments/refund', { paymentId, reason: 'Customer requested refund' });
      toast.success('Refund processed!');
      fetchPayments();
    } catch (err) { toast.error(err.response?.data?.message || 'Refund failed.'); }
  };

  const totalPaid = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
  const paidCount = payments.filter(p => p.status === 'PAID').length;
  const refundCount = payments.filter(p => p.status === 'REFUNDED').length;

  return (
    <div className="pe-page">
      <Navbar />
      <div className="pe-container pe-content">

        <div className="pe-page-header pe-fade-up">
          <h1 className="pe-page-title">My Payments</h1>
          <p className="pe-page-subtitle">Track your parking payment history</p>
        </div>

        {/* Stats */}
        <div className="pe-grid pe-grid-3 mb-32">
          <div className="pe-stat-card pe-fade-up pe-fade-up-1">
            <div className="pe-stat-icon green"><FaMoneyBill /></div>
            <div>
              <div className="pe-stat-value" style={{ fontSize: '1.5rem' }}>₹{totalPaid.toFixed(0)}</div>
              <div className="pe-stat-label">Total Spent</div>
            </div>
          </div>
          <div className="pe-stat-card pe-fade-up pe-fade-up-2">
            <div className="pe-stat-icon blue"><FaCheckCircle /></div>
            <div>
              <div className="pe-stat-value">{paidCount}</div>
              <div className="pe-stat-label">Successful Payments</div>
            </div>
          </div>
          <div className="pe-stat-card pe-fade-up pe-fade-up-3">
            <div className="pe-stat-icon amber"><FaUndo /></div>
            <div>
              <div className="pe-stat-value">{refundCount}</div>
              <div className="pe-stat-label">Refunds</div>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="pe-spinner"><div className="pe-spin" /></div>
        ) : (
          <div className="pe-card pe-fade-up">
            <div className="pe-card-header">
              <h3 className="pe-card-title">Payment History</h3>
              <span className="pe-badge pe-badge-gray">{payments.length} records</span>
            </div>
            {payments.length === 0 ? (
              <div className="pe-empty">
                <div className="pe-empty-icon"><FaMoneyBill /></div>
                <p className="pe-empty-title">No payments yet</p>
                <p className="pe-empty-text">Your payment history will appear here after your first booking.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="pe-table">
                  <thead>
                    <tr>
                      <th>#ID</th><th>Booking</th><th>Amount</th><th>Mode</th>
                      <th>Transaction ID</th><th>Date</th><th>Status</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => {
                      const s = statusMap[p.status] || { cls: 'pe-badge-gray', label: p.status };
                      return (
                        <tr key={p.paymentId}>
                          <td className="fw">#{p.paymentId}</td>
                          <td>#{p.bookingId}</td>
                          <td style={{ color: 'var(--green)', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>
                            ₹{p.amount}
                          </td>
                          <td>
                            <span className="pe-badge pe-badge-blue">
                              {modeIcon[p.mode] || ''} {p.mode}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            {p.transactionId || 'CASH'}
                          </td>
                          <td style={{ fontSize: '0.8125rem' }}>
                            {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}
                          </td>
                          <td><span className={`pe-badge ${s.cls}`}>{s.label}</span></td>
                          <td>
                            {p.status === 'PAID' && (
                              <button className="pe-btn pe-btn-danger pe-btn-sm"
                                onClick={() => handleRefund(p.paymentId)}>
                                <FaUndo size={11} /> Refund
                              </button>
                            )}
                          </td>
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

export default MyPayments;