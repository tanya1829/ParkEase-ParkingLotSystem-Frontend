// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaParking, FaSearch, FaCalendarCheck, FaCar, FaShieldAlt, FaBolt, FaMapMarkerAlt, FaMobileAlt, FaStar, FaArrowRight, FaCheck } from 'react-icons/fa';

const Home = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ background: 'var(--obsidian)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(13,14,18,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--surface-2)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
          <div style={{ width: 34, height: 34, background: 'var(--amber)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--obsidian)' }}>
            <FaParking />
          </div>
          Park<span style={{ color: 'var(--amber)' }}>Ease</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/login" className="pe-btn pe-btn-ghost pe-btn-sm">Login</Link>
          <Link to="/register" className="pe-btn pe-btn-primary pe-btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '100px 24px 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '10%', left: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 760, position: 'relative', zIndex: 1 }} className="pe-fade-up">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--amber-glow)', border: '1px solid var(--amber-border)', borderRadius: 99, padding: '6px 16px', marginBottom: 28 }}>
            <FaBolt size={11} style={{ color: 'var(--amber)' }} />
            <span style={{ color: 'var(--amber)', fontSize: '0.8125rem', fontWeight: 600 }}>Smart Parking for Modern Cities</span>
          </div>

          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            color: 'var(--text-primary)', margin: '0 0 20px',
            letterSpacing: '-0.03em', lineHeight: 1.1,
          }}>
            Find & Book Parking<br />
            <span style={{ color: 'var(--amber)' }}>In Seconds</span>
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 2vw, 1.25rem)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.6 }}>
            ParkEase connects drivers with available parking spots in real-time. No more circling the block — just search, book, and park.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="pe-btn pe-btn-primary pe-btn-lg">
              Get Started Free <FaArrowRight size={14} />
            </Link>
            <Link to="/login" className="pe-btn pe-btn-outline pe-btn-lg">
              Sign In
            </Link>
          </div>

          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 56, flexWrap: 'wrap' }}>
            {[
              { value: '500+', label: 'Parking Lots' },
              { value: '10K+', label: 'Happy Drivers' },
              { value: '50+', label: 'Cities' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.75rem', color: 'var(--amber)', letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '80px 24px', background: 'var(--surface-0)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ color: 'var(--amber)', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Simple Process</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em' }}>
              Park in 3 Easy Steps
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {[
              { step: '01', icon: <FaSearch size={22} />, title: 'Search', desc: 'Enter your city and instantly see all available parking lots near you with real-time spot availability.' },
              { step: '02', icon: <FaCalendarCheck size={22} />, title: 'Book', desc: 'Choose your spot, set your time, and confirm your booking in seconds. Pre-book or walk in.' },
              { step: '03', icon: <FaCar size={22} />, title: 'Park', desc: 'Arrive, check in with your booking ID, park stress-free, and check out when done.' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'var(--surface-1)', border: '1px solid var(--surface-2)',
                borderRadius: 18, padding: '32px 28px',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 20, right: 24, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '3rem', color: 'var(--surface-2)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {item.step}
                </div>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--amber-glow)', border: '1px solid var(--amber-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)', marginBottom: 20 }}>
                  {item.icon}
                </div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ color: 'var(--amber)', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Why ParkEase</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em' }}>
              Everything You Need
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {[
              { icon: <FaBolt size={20} />, title: 'Real-Time Availability', desc: 'See live spot availability. No guesswork, no wasted trips.' },
              { icon: <FaShieldAlt size={20} />, title: 'Secure Payments', desc: 'Pay via UPI, Card, Wallet or Cash. All transactions are safe and tracked.' },
              { icon: <FaMapMarkerAlt size={20} />, title: 'Multiple Locations', desc: 'Find parking across 50+ cities. Search by area, lot name, or city.' },
              { icon: <FaMobileAlt size={20} />, title: 'Easy Check-In/Out', desc: 'Digital check-in and check-out. No paperwork, no queues.' },
              { icon: <FaCalendarCheck size={20} />, title: 'Pre-Booking', desc: 'Reserve your spot hours in advance. Guarantee your space before you arrive.' },
              { icon: <FaCar size={20} />, title: 'EV Support', desc: 'Find EV charging spots. Filter by vehicle type and special requirements.' },
            ].map((f, i) => (
              <div key={i} style={{
                background: 'var(--surface-1)', border: '1px solid var(--surface-2)',
                borderRadius: 16, padding: '24px',
                display: 'flex', gap: 16, alignItems: 'flex-start',
                transition: 'all 0.22s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--amber-border)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--surface-2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--amber-glow)', border: '1px solid var(--amber-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)', flexShrink: 0 }}>
                  {f.icon}
                </div>
                <div>
                  <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>{f.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR MANAGERS ── */}
      <section style={{ padding: '80px 24px', background: 'var(--surface-0)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--amber)', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>For Lot Owners</p>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: 'var(--text-primary)', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                Own a Parking Lot? Earn More With ParkEase
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, margin: '0 0 28px' }}>
                Register your lot, manage your spots, track bookings, and monitor revenue — all from one dashboard. Get approved and start earning within 24 hours.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {[
                  'Real-time booking management',
                  'Revenue analytics & reports',
                  'Spot-level control (EV, Handicapped)',
                  'Open/Close your lot anytime',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--amber-glow)', border: '1px solid var(--amber-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FaCheck size={10} style={{ color: 'var(--amber)' }} />
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/register" className="pe-btn pe-btn-primary">
                Register as Manager <FaArrowRight size={13} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Total Revenue', value: '₹48,200', sub: 'This month', color: 'var(--green)' },
                { label: 'Active Bookings', value: '24', sub: 'Right now', color: 'var(--amber)' },
                { label: 'Occupancy Rate', value: '87%', sub: 'Today average', color: 'var(--blue)' },
              ].map((card, i) => (
                <div key={i} style={{
                  background: 'var(--surface-1)', border: '1px solid var(--surface-2)',
                  borderRadius: 14, padding: '18px 22px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{card.label}</div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: card.color, letterSpacing: '-0.03em' }}>{card.value}</div>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{card.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ color: 'var(--amber)', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Reviews</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em' }}>
              Loved by Drivers
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { name: 'Rahul M.', city: 'Delhi', text: 'Found parking near Connaught Place in under 2 minutes. Used to take 20 minutes of circling before!', stars: 5 },
              { name: 'Priya S.', city: 'Mumbai', text: 'Pre-booked my spot for a concert. Arrived, checked in, done. Absolutely seamless experience.', stars: 5 },
              { name: 'Arjun K.', city: 'Bangalore', text: 'As a lot owner, my revenue went up 40% in the first month. The dashboard is incredibly easy to use.', stars: 5 },
            ].map((t, i) => (
              <div key={i} style={{
                background: 'var(--surface-1)', border: '1px solid var(--surface-2)',
                borderRadius: 16, padding: '24px',
              }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                  {Array(t.stars).fill(0).map((_, j) => (
                    <FaStar key={j} size={14} style={{ color: 'var(--amber)' }} />
                  ))}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, margin: '0 0 20px', fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{t.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <FaMapMarkerAlt size={10} /> {t.city}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--surface-1) 0%, rgba(245,166,35,0.08) 100%)',
            border: '1px solid var(--amber-border)',
            borderRadius: 24, padding: '56px 40px',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--text-primary)', margin: '0 0 16px', letterSpacing: '-0.03em' }}>
              Ready to Park Smarter?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', margin: '0 0 32px', lineHeight: 1.6 }}>
              Join thousands of drivers who've ditched parking stress. Sign up free today.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="pe-btn pe-btn-primary pe-btn-lg">
                Get Started Free <FaArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'var(--surface-0)', borderTop: '1px solid var(--surface-2)', padding: '32px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            <div style={{ width: 28, height: 28, background: 'var(--amber)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--obsidian)', fontSize: '0.875rem' }}>
              <FaParking />
            </div>
            Park<span style={{ color: 'var(--amber)' }}>Ease</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            © 2026 ParkEase. Smart parking for everyone.
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Made with ❤️ in India
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;