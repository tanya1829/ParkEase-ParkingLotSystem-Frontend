// src/pages/auth/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { FaParking, FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.fullName}!`);
      if (result.user.role === 'DRIVER')  navigate('/driver/dashboard');
      if (result.user.role === 'MANAGER') navigate('/manager/dashboard');
      if (result.user.role === 'ADMIN')   navigate('/admin/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="pe-auth-page">
      <div className="pe-auth-bg-glow tl" />
      <div className="pe-auth-bg-glow br" />

      <div className="pe-auth-card">
        <div className="pe-auth-logo"><FaParking /></div>
        <h1 className="pe-auth-title">Welcome back</h1>
        <p className="pe-auth-subtitle">Sign in to your ParkEase account</p>

        <form onSubmit={handleSubmit}>
          <div className="pe-form-group">
            <label className="pe-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FaEnvelope size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="pe-input"
                placeholder="you@example.com"
                style={{ paddingLeft: 38 }}
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="pe-form-group" style={{ marginBottom: 28 }}>
            <label className="pe-label">Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock size={13} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="pe-input"
                placeholder="Enter your password"
                style={{ paddingLeft: 38 }}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="pe-btn pe-btn-primary pe-btn-lg pe-btn-full" disabled={loading}>
            {loading ? 'Signing in…' : <><span>Sign In</span><FaArrowRight size={14}/></>}
          </button>
        </form>

        <div className="pe-divider" />

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Don't have an account?{' '}
          <Link to="/register" className="pe-auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
