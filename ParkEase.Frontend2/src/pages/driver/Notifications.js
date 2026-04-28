// src/pages/driver/Notifications.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { notifApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { FaBell, FaCheck, FaTimes, FaCheckDouble } from 'react-icons/fa';

const typeConfig = {
  BOOKING:  { icon: '🎉', cls: 'pe-badge-blue' },
  CHECKIN:  { icon: '✅', cls: 'pe-badge-green' },
  CHECKOUT: { icon: '🚗', cls: 'pe-badge-gray' },
  PAYMENT:  { icon: '💳', cls: 'pe-badge-amber' },
  EXPIRY:   { icon: '⏰', cls: 'pe-badge-red' },
  PROMO:    { icon: '🎁', cls: 'pe-badge-purple' },
};

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notifApi.get(`/notifications/user/${user.userId}`);
      setNotifications(res.data.data || []);
    } catch { toast.error('Failed to load notifications.'); }
    finally { setLoading(false); }
  };

  const markAsRead = async (id) => {
    try { await notifApi.put(`/notifications/${id}/read`); fetchNotifications(); } catch {}
  };

  const markAllRead = async () => {
    try {
      await notifApi.put(`/notifications/user/${user.userId}/read-all`);
      toast.success('All marked as read!');
      fetchNotifications();
    } catch {}
  };

  const deleteNotif = async (id) => {
    try { await notifApi.delete(`/notifications/${id}`); fetchNotifications(); } catch {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="pe-page">
      <Navbar />
      <div className="pe-container pe-content">

        <div className="flex-between mb-32 pe-fade-up">
          <div className="pe-page-header" style={{ margin: 0 }}>
            <h1 className="pe-page-title">Notifications</h1>
            <p className="pe-page-subtitle">
              {unreadCount > 0
                ? <><span className="pe-badge pe-badge-red" style={{ marginRight: 8 }}>{unreadCount} new</span>unread notifications</>
                : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button className="pe-btn pe-btn-ghost" onClick={markAllRead}>
              <FaCheckDouble size={13} /> Mark All Read
            </button>
          )}
        </div>

        {loading ? (
          <div className="pe-spinner"><div className="pe-spin" /></div>
        ) : notifications.length === 0 ? (
          <div className="pe-card pe-fade-up">
            <div className="pe-empty">
              <div className="pe-empty-icon"><FaBell /></div>
              <p className="pe-empty-title">No notifications yet</p>
              <p className="pe-empty-text">You'll be notified about bookings, payments, and more.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifications.map((n, i) => {
              const cfg = typeConfig[n.type] || { icon: '🔔', cls: 'pe-badge-gray' };
              return (
                <div
                  key={n.notificationId}
                  className={`pe-card pe-fade-up pe-fade-up-${(i % 4) + 1}`}
                  style={{
                    borderLeft: `3px solid ${n.isRead ? 'var(--surface-3)' : 'var(--amber)'}`,
                    opacity: n.isRead ? 0.7 : 1,
                    transition: 'var(--transition)'
                  }}
                >
                  <div className="pe-card-body" style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>

                        {/* Icon */}
                        <div style={{
                          width: 40, height: 40, borderRadius: 'var(--radius-md)',
                          background: 'var(--surface-2)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.1rem', flexShrink: 0
                        }}>
                          {cfg.icon}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                              {n.title}
                            </span>
                            <span className={`pe-badge ${cfg.cls}`}>{n.type}</span>
                            {!n.isRead && <span className="pe-badge pe-badge-red">New</span>}
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 6px' }}>
                            {n.message}
                          </p>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {new Date(n.sentAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        {!n.isRead && (
                          <button
                            className="pe-btn pe-btn-success pe-btn-sm"
                            onClick={() => markAsRead(n.notificationId)}
                            title="Mark as read"
                          >
                            <FaCheck size={11} />
                          </button>
                        )}
                        <button
                          className="pe-btn pe-btn-danger pe-btn-sm"
                          onClick={() => deleteNotif(n.notificationId)}
                          title="Delete"
                        >
                          <FaTimes size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;