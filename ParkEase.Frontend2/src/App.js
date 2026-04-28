// src/App.js
import Home from './pages/Home';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

// Driver Pages
import DriverDashboard  from './pages/driver/Dashboard';
import SearchLots       from './pages/driver/SearchLots';
import MyBookings       from './pages/driver/MyBookings';
import MyVehicles       from './pages/driver/MyVehicles';
import MyPayments       from './pages/driver/MyPayments';
import Notifications    from './pages/driver/Notifications';
import BookSpot         from './pages/driver/BookSpot';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import MyLots           from './pages/manager/MyLots';
import ManageSpots      from './pages/manager/ManageSpots';
import LotBookings      from './pages/manager/LotBookings';
import Revenue          from './pages/manager/Revenue';

// Admin Pages
import AdminDashboard   from './pages/admin/Dashboard';
import ManageUsers      from './pages/admin/ManageUsers';
import ApproveLots      from './pages/admin/ApproveLots';
import AllBookings      from './pages/admin/AllBookings';
import PlatformAnalytics from './pages/admin/PlatformAnalytics';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  const getDefaultRoute = () => {
    if (!user) return '/login';
    if (user.role === 'DRIVER')  return '/driver/dashboard';
    if (user.role === 'MANAGER') return '/manager/dashboard';
    if (user.role === 'ADMIN')   return '/admin/dashboard';
    return '/login';
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={!user ? <Home /> : <Navigate to={getDefaultRoute()} />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Driver Routes */}
      <Route path="/driver/dashboard"    element={<ProtectedRoute allowedRoles={['DRIVER']}><DriverDashboard /></ProtectedRoute>} />
      <Route path="/driver/search"       element={<ProtectedRoute allowedRoles={['DRIVER']}><SearchLots /></ProtectedRoute>} />
      <Route path="/driver/bookings"     element={<ProtectedRoute allowedRoles={['DRIVER']}><MyBookings /></ProtectedRoute>} />
      <Route path="/driver/vehicles"     element={<ProtectedRoute allowedRoles={['DRIVER']}><MyVehicles /></ProtectedRoute>} />
      <Route path="/driver/payments"     element={<ProtectedRoute allowedRoles={['DRIVER']}><MyPayments /></ProtectedRoute>} />
      <Route path="/driver/notifications" element={<ProtectedRoute allowedRoles={['DRIVER']}><Notifications /></ProtectedRoute>} />
      <Route path="/driver/book/:lotId/:spotId" element={<ProtectedRoute allowedRoles={['DRIVER']}><BookSpot /></ProtectedRoute>} />

      {/* Manager Routes */}
      <Route path="/manager/dashboard" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerDashboard /></ProtectedRoute>} />
      <Route path="/manager/lots"      element={<ProtectedRoute allowedRoles={['MANAGER']}><MyLots /></ProtectedRoute>} />
      <Route path="/manager/spots/:lotId" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManageSpots /></ProtectedRoute>} />
      <Route path="/manager/bookings/:lotId" element={<ProtectedRoute allowedRoles={['MANAGER']}><LotBookings /></ProtectedRoute>} />
      <Route path="/manager/revenue/:lotId" element={<ProtectedRoute allowedRoles={['MANAGER']}><Revenue /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard"  element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users"      element={<ProtectedRoute allowedRoles={['ADMIN']}><ManageUsers /></ProtectedRoute>} />
      <Route path="/admin/lots"       element={<ProtectedRoute allowedRoles={['ADMIN']}><ApproveLots /></ProtectedRoute>} />
      <Route path="/admin/bookings"   element={<ProtectedRoute allowedRoles={['ADMIN']}><AllBookings /></ProtectedRoute>} />
      <Route path="/admin/analytics"  element={<ProtectedRoute allowedRoles={['ADMIN']}><PlatformAnalytics /></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  </AuthProvider>
);

export default App;