// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notifApi } from '../services/api';
import { FaParking, FaBell, FaSignOutAlt, FaTachometerAlt, FaCar, FaSearch, FaHistory, FaMoneyBill, FaList, FaUsers, FaChartBar } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { if (user?.userId) fetchUnreadCount(); }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const res = await notifApi.get(`/notifications/user/${user.userId}/unread-count`);
      setUnreadCount(res.data.data || 0);
    } catch {}
  };

  const getDashboardLink = () => {
    if (user?.role === 'DRIVER')  return '/driver/dashboard';
    if (user?.role === 'MANAGER') return '/manager/dashboard';
    if (user?.role === 'ADMIN')   return '/admin/dashboard';
    return '/';
  };

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U';
  const isActive = (path) => location.pathname === path ? 'pe-nav-link active-link' : 'pe-nav-link';

  const driverLinks = [
    { to: '/driver/dashboard', icon: <FaTachometerAlt size={13}/>, label: 'Dashboard' },
    { to: '/driver/search',    icon: <FaSearch size={13}/>,        label: 'Find Parking' },
    { to: '/driver/bookings',  icon: <FaHistory size={13}/>,       label: 'Bookings' },
    { to: '/driver/vehicles',  icon: <FaCar size={13}/>,           label: 'Vehicles' },
    { to: '/driver/payments',  icon: <FaMoneyBill size={13}/>,     label: 'Payments' },
  ];

  const managerLinks = [
    { to: '/manager/dashboard', icon: <FaTachometerAlt size={13}/>, label: 'Dashboard' },
    { to: '/manager/lots',      icon: <FaList size={13}/>,          label: 'My Lots' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard',  icon: <FaTachometerAlt size={13}/>, label: 'Dashboard' },
    { to: '/admin/users',      icon: <FaUsers size={13}/>,         label: 'Users' },
    { to: '/admin/lots',       icon: <FaParking size={13}/>,       label: 'Approve Lots' },
    { to: '/admin/bookings',   icon: <FaHistory size={13}/>,       label: 'Bookings' },
    { to: '/admin/analytics',  icon: <FaChartBar size={13}/>,      label: 'Analytics' },
  ];

  const links = user?.role === 'DRIVER' ? driverLinks : user?.role === 'MANAGER' ? managerLinks : adminLinks;

  return (
    <nav className="pe-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <Link className="pe-brand" to={getDashboardLink()}>
          <div className="pe-brand-icon"><FaParking /></div>
          Park<span>Ease</span>
        </Link>

        <ul className="pe-nav-links" style={{ display: menuOpen ? 'flex' : undefined }}>
          {links.map(l => (
            <li key={l.to}>
              <Link className={isActive(l.to)} to={l.to}>
                {l.icon} {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="pe-nav-right">
        {user?.role === 'DRIVER' && (
          <button
            className="pe-notif-btn"
            onClick={() => navigate('/driver/notifications')}
            title="Notifications"
          >
            <FaBell size={16} />
            {unreadCount > 0 && (
              <span className="pe-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>
        )}

        <div className="pe-user-chip">
          <div className="pe-avatar">{initials}</div>
          <span className="pe-user-name">{user?.fullName?.split(' ')[0]}</span>
          <span className="pe-role-pill">{user?.role}</span>
        </div>

        <button className="pe-logout-btn" onClick={logout}>
          <FaSignOutAlt size={13} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
