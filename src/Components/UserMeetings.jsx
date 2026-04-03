import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './EmployeeDashboard.css';

function getMeetingStatus(meeting) {
  const now = new Date();
  const date = new Date(meeting.date);
  const [sh, sm] = (meeting.startTime || meeting.time || '00:00').split(':');
  const [eh, em] = (meeting.endTime || meeting.time || '23:59').split(':');
  const start = new Date(date); start.setHours(+sh, +sm, 0, 0);
  const end = new Date(date); end.setHours(+eh, +em, 0, 0);
  if (now > end) return { label: 'Completed', type: 'completed' };
  if (now >= start && now <= end) return { label: 'Ongoing Now', type: 'ongoing' };
  const diff = Math.round((start - now) / 60000);
  if (diff <= 60) return { label: `Starts in ${diff}m`, type: 'soon' };
  return { label: 'Upcoming', type: 'upcoming' };
}

function UserMeetings() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [now, setNow] = useState(new Date());
  const [toasts, setToasts] = useState([]);
  const notifiedRef = useRef(new Set());

  const addToast = (title, time) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, time }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  // Clock tick + notification check every 30s
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setNow(n);
      meetings.forEach(m => {
        const date = new Date(m.date);
        const [sh, sm] = (m.startTime || m.time || '00:00').split(':');
        const start = new Date(date);
        start.setHours(+sh, +sm, 0, 0);
        const diff = Math.round((start - n) / 60000);
        // Notify at exactly 0 min (meeting starting now)
        if (diff === 0 && !notifiedRef.current.has(m._id + '_start')) {
          notifiedRef.current.add(m._id + '_start');
          addToast(m.title, m.startTime || m.time);
        }
        // Notify 5 min before
        if (diff === 5 && !notifiedRef.current.has(m._id + '_5min')) {
          notifiedRef.current.add(m._id + '_5min');
          addToast(m.title, `in 5 minutes (${m.startTime || m.time})`);
        }
      });
    };
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, [meetings]);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) { navigate('/'); return; }
    axios.get(`${import.meta.env.VITE_API_URL}/api/user-meetings/${email}`)
      .then(res => { setMeetings(res.data); setLoading(false); })
      .catch(() => { setMeetings([]); setLoading(false); });
  }, [navigate]);

  const upcoming  = meetings.filter(m => getMeetingStatus(m).type !== 'completed');
  const completed = meetings.filter(m => getMeetingStatus(m).type === 'completed');
  const displayed = filter === 'upcoming' ? upcoming : completed;

  if (loading) return (
    <div className="ed-loading">
      <div className="ed-spinner"></div>
      <p>Loading Meetings...</p>
    </div>
  );

  return (
    <div className="ed-container">
      {toasts.length > 0 && (
        <div className="meet-toast-stack">
          {toasts.map(t => (
            <div key={t.id} className="meet-toast">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <div>
                <p className="meet-toast-title">Meeting Starting</p>
                <p className="meet-toast-sub">{t.title} — {t.time}</p>
              </div>
              <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>✕</button>
            </div>
          ))}
        </div>
      )}
      <aside className="ed-sidebar">
        <div className="ed-brand">
          <div className="ed-brand-icon">IT</div>
          <span>IT-MIS</span>
        </div>
        <p className="ed-portal-label">Employee Portal</p>
        <nav className="ed-nav">
          <Link to="/dashboard" className="ed-nav-item">
            <span className="ed-nav-icon">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </span>
            <span>Dashboard</span>
          </Link>
          <Link to="/meetings" className="ed-nav-item active">
            <span className="ed-nav-icon">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
            <span>My Meetings</span>
          </Link>
        </nav>
      </aside>

      <main className="ed-main">
        <header className="ed-topbar">
          <div>
            <h1 className="ed-page-title">My Meetings</h1>
            <p className="ed-page-sub">{meetings.length} total · {upcoming.length} upcoming</p>
          </div>
        </header>

        <div className="ed-content">
          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            <button
              className={`ud-filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming <span className="filter-count">{upcoming.length}</span>
            </button>
            <button
              className={`ud-filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed <span className="filter-count">{completed.length}</span>
            </button>
          </div>

          {displayed.length === 0 ? (
            <div className="ed-card ed-empty">No {filter} meetings</div>
          ) : (
            <div className="ud-meetings-grid">
              {displayed.map(m => {
                const s = getMeetingStatus(m);
                return (
                  <div key={m._id} className={`ud-meeting-card status-border-${s.type}`}>
                    <div className="ud-meeting-top">
                      <h3>{m.title}</h3>
                      <span className={`ed-pill pill-${s.type}`}>{s.label}</span>
                    </div>
                    <p className="ud-meeting-desc">{m.description}</p>
                    <div className="ud-meeting-meta">
                      <span>{new Date(m.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span>{m.startTime || m.time} — {m.endTime || 'N/A'}</span>
                    </div>
                    {m.createdBy && (
                      <p style={{ fontSize: 11, color: '#6b7280', marginTop: 8 }}>Organized by {m.createdBy}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default UserMeetings;
