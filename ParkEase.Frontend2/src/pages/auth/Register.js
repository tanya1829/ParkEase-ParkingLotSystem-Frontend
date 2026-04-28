// src/pages/auth/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { FaParking, FaUser, FaEnvelope, FaLock, FaPhone, FaArrowRight } from 'react-icons/fa';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', role: 'DRIVER' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form);
    if (result.success) {
      toast.success('Account created successfully!');
      if (result.user.role === 'DRIVER')  navigate('/driver/dashboard');
      if (result.user.role === 'MANAGER') navigate('/manager/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  const field = (icon, label, type, placeholder, key) => (
    <div className="pe-form-group">
      <label className="pe-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{icon}</span>
        <input type={type} className="pe-input" placeholder={placeholder} style={{ paddingLeft: 38 }}
          value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required />
      </div>
    </div>
  );

  return (
    <div className="pe-auth-page">
      <div className="pe-auth-bg-glow tl" />
      <div className="pe-auth-bg-glow br" />

      <div className="pe-auth-card" style={{ maxWidth: 460 }}>
        <div className="pe-auth-logo"><FaParking /></div>
        <h1 className="pe-auth-title">Create Account</h1>
        <p className="pe-auth-subtitle">Join ParkEase and park smarter</p>

        <form onSubmit={handleSubmit}>
          {field(<FaUser size={13}/>, 'Full Name', 'text', 'Your full name', 'fullName')}
          {field(<FaEnvelope size={13}/>, 'Email Address', 'email', 'you@example.com', 'email')}
          {field(<FaLock size={13}/>, 'Password', 'password', 'Create a password', 'password')}
          {field(<FaPhone size={13}/>, 'Phone Number', 'text', '10-digit phone number', 'phone')}

          <div className="pe-form-group">
            <label className="pe-label">Register As</label>
            <select className="pe-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="DRIVER">🚗  Driver — Looking for parking</option>
              <option value="MANAGER">🏢  Lot Manager — I own a parking lot</option>
            </select>
          </div>

          <button type="submit" className="pe-btn pe-btn-primary pe-btn-lg pe-btn-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creating account…' : <><span>Create Account</span><FaArrowRight size={14}/></>}
          </button>
        </form>

        <div className="pe-divider" />

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Already have an account?{' '}
          <Link to="/login" className="pe-auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
