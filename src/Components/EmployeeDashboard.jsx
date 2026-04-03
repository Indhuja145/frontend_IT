import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './EmployeeDashboard.css';

const API = 'http://localhost:5000/api';

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

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="ed-clock">
      <span className="ed-clock-time">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      <span className="ed-clock-date">{time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</span>
    </div>
  );
}

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { to: '/attendance', label: 'Attendance', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { to: '/leave', label: 'Leave Request', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { to: '/meetings', label: 'My Meetings', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { to: '/documents', label: 'Documents', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  { to: '/requests', label: 'My Requests', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
  { to: '/query', label: 'Raise Query', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  { to: '/reports', label: 'Reports', icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
];

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [requests, setRequests] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [notification, setNotification] = useState(null);
  const [meetingSearch, setMeetingSearch] = useState('');
  const [docSearch, setDocSearch] = useState('');

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) { navigate('/'); return; }
    fetchAll(email);
    const poll = setInterval(() => fetchAll(email), 60000);
    return () => clearInterval(poll);
  }, [navigate]);

  const fetchAll = useCallback(async (email) => {
    try {
      const [userRes, meetRes, docRes, leaveRes, reqRes, attRes] = await Promise.allSettled([
        axios.get(`${API}/user-profile/${email}`),
        axios.get(`${API}/user-meetings/${email}`),
        axios.get(`${API}/documents`),
        axios.get(`${API}/leaves/${email}`),
        axios.get(`${API}/requests`),
        axios.get(`${API}/attendance`),
      ]);
      if (userRes.status === 'fulfilled') setUser(userRes.value.data);
      else { navigate('/'); return; }
      if (meetRes.status === 'fulfilled') setMeetings(meetRes.value.data);
      if (docRes.status === 'fulfilled') setDocuments(docRes.value.data);
      if (leaveRes.status === 'fulfilled') setLeaves(leaveRes.value.data);
      if (reqRes.status === 'fulfilled') {
        const all = reqRes.value.data;
        setRequests(all.filter(r => r.employeeEmail === email));
      }
      if (attRes.status === 'fulfilled') {
        const all = attRes.value.data;
        setAttendance(all.filter(a => a.employeeEmail === email));
      }
      setLoading(false);
    } catch { navigate('/'); }
  }, [navigate]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const upcomingMeetings = meetings.filter(m => getMeetingStatus(m).type !== 'completed');
  const completedMeetings = meetings.filter(m => getMeetingStatus(m).type === 'completed');
  const todayMeetings = meetings.filter(m => new Date(m.date).toDateString() === now.toDateString());
  const pendingLeaves = leaves.filter(l => l.status === 'Pending' || l.status === 'pending');
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const daysPresent = attendance.filter(a => a.status?.toLowerCase() === 'present').length;
  const leavesTaken = leaves.filter(l => l.status === 'approved' || l.status === 'Approved')
    .reduce((s, l) => s + (l.numberOfDays || 0), 0);

  const filteredMeetings = upcomingMeetings.filter(m =>
    m.title?.toLowerCase().includes(meetingSearch.toLowerCase())
  );
  const filteredDocs = documents.filter(d =>
    d.title?.toLowerCase().includes(docSearch.toLowerCase())
  );

  if (loading) return (
    <div className="ed-loading">
      <div className="ed-spinner"></div>
      <p>Loading Dashboard...</p>
    </div>
  );

  return (
    <div className="ed-container">
      {notification && <div className={`ed-notification ${notification.type}`}>{notification.msg}</div>}

      {/* Sidebar */}
      <aside className="ed-sidebar">
        <div className="ed-brand">
          <div className="ed-brand-icon">IT</div>
          <span>IT-MIS</span>
        </div>
        <p className="ed-portal-label">Employee Portal</p>
        <nav className="ed-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`ed-nav-item ${item.to === '/dashboard' ? 'active' : ''}`}
            >
              <span className="ed-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="ed-sidebar-footer">
          <div className="ed-avatar-sm">{user?.name?.charAt(0)}</div>
          <div className="ed-footer-info">
            <p className="ed-footer-name">{user?.name}</p>
            <p className="ed-footer-role">{user?.role}</p>
          </div>
          <button
            className="ed-logout-icon"
            title="Logout"
            onClick={() => { if (window.confirm('Logout?')) { localStorage.clear(); navigate('/'); } }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ed-main">
        {/* Topbar */}
        <header className="ed-topbar">
          <div>
            <h1 className="ed-page-title">{getGreeting()}, {user?.name}</h1>
            <p className="ed-page-sub">Here's what's happening today</p>
          </div>
          <div className="ed-topbar-right">
            <LiveClock />
            <button className="ed-profile-btn" onClick={() => setShowProfile(true)}>
              <div className="ed-avatar">{user?.name?.charAt(0)}</div>
            </button>
          </div>
        </header>

        <div className="ed-content">
          {/* Stats */}
          <div className="ed-stats-grid">
            {[
              { label: 'Days Present', value: daysPresent, sub: 'this month', accent: 'blue' },
              { label: 'Leaves Taken', value: leavesTaken, sub: 'approved days', accent: 'orange' },
              { label: 'Pending Requests', value: pendingRequests.length, sub: 'awaiting approval', accent: 'violet' },
              { label: "Today's Meetings", value: todayMeetings.length, sub: 'scheduled today', accent: 'green' },
            ].map(s => (
              <div key={s.label} className={`ed-stat-card accent-${s.accent}`}>
                <p className="ed-stat-value">{s.value}</p>
                <p className="ed-stat-label">{s.label}</p>
                <p className="ed-stat-sub">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="ed-card ed-quick-actions">
            <div className="ed-card-header"><h3>Quick Actions</h3></div>
            <div className="ed-actions-grid">
              {[
                { to: '/leave', label: 'Request Leave' },
                { to: '/attendance', label: 'Mark Attendance' },
                { to: '/requests', label: 'My Requests' },
                { to: '/query', label: 'Raise Query' },
                { to: '/documents', label: 'View Documents' },
                { to: '/reports', label: 'View Reports' },
              ].map(a => (
                <Link key={a.to} to={a.to} className="ed-action-btn">{a.label}</Link>
              ))}
            </div>
          </div>

          {/* Main Grid */}
          <div className="ed-grid-3col">
            {/* Today's Schedule */}
            <div className="ed-card">
              <div className="ed-card-header">
                <h3>Today's Schedule</h3>
                <span className="ed-badge badge-blue">{todayMeetings.length}</span>
              </div>
              {todayMeetings.length === 0 ? (
                <div className="ed-empty">No meetings today</div>
              ) : (
                <div className="ed-schedule-list">
                  {todayMeetings.map(m => {
                    const s = getMeetingStatus(m);
                    return (
                      <div key={m._id} className={`ed-schedule-item status-${s.type}`}>
                        <div className="ed-schedule-time">
                          <span>{m.startTime || m.time}</span>
                          <span>{m.endTime || ''}</span>
                        </div>
                        <div className="ed-schedule-info">
                          <p className="ed-schedule-title">{m.title}</p>
                          <p className="ed-schedule-desc">{m.description}</p>
                        </div>
                        <span className={`ed-pill pill-${s.type}`}>{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending Approvals */}
            <div className="ed-card">
              <div className="ed-card-header">
                <h3>Pending Approvals</h3>
                {pendingLeaves.length > 0 && <span className="ed-badge badge-orange">{pendingLeaves.length}</span>}
              </div>
              {pendingLeaves.length === 0 ? (
                <div className="ed-empty">No pending leave requests</div>
              ) : (
                <div className="ed-approval-list">
                  {pendingLeaves.slice(0, 5).map(l => (
                    <div key={l._id} className="ed-approval-item">
                      <div>
                        <p className="ed-approval-type">{l.leaveType}</p>
                        <p className="ed-approval-dates">
                          {new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="ed-pill pill-soon">Pending</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="ed-card">
              <div className="ed-card-header">
                <h3>Recent Activity</h3>
              </div>
              {requests.length === 0 && leaves.length === 0 ? (
                <div className="ed-empty">No recent activity</div>
              ) : (
                <div className="ed-activity-list">
                  {[...leaves.slice(0, 3).map(l => ({ id: l._id, title: `Leave: ${l.leaveType}`, status: l.status, date: l.startDate, type: 'leave' })),
                    ...requests.slice(0, 3).map(r => ({ id: r._id, title: `Request: ${r.requestType || r.type || 'General'}`, status: r.status, date: r.createdAt, type: 'request' }))
                  ].slice(0, 6).map(item => (
                    <div key={item.id} className="ed-activity-item">
                      <div className={`ed-activity-dot ${item.status === 'approved' || item.status === 'Approved' ? 'dot-green' : item.status === 'rejected' ? 'dot-red' : 'dot-orange'}`}></div>
                      <div>
                        <p className="ed-activity-title">{item.title}</p>
                        <p className="ed-activity-meta">{item.date ? new Date(item.date).toLocaleDateString() : ''} · {item.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Meetings & Documents */}
          <div className="ed-grid-2col">
            {/* Upcoming Meetings */}
            <div className="ed-card">
              <div className="ed-card-header">
                <h3>Upcoming Meetings</h3>
                <span className="ed-badge badge-violet">{upcomingMeetings.length}</span>
              </div>
              <div className="ed-search-bar">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input placeholder="Search meetings..." value={meetingSearch} onChange={e => setMeetingSearch(e.target.value)} />
              </div>
              {filteredMeetings.length === 0 ? (
                <div className="ed-empty">No upcoming meetings</div>
              ) : (
                <div className="ed-meeting-list">
                  {filteredMeetings.slice(0, 4).map(m => {
                    const s = getMeetingStatus(m);
                    return (
                      <div key={m._id} className={`ed-meeting-item border-${s.type}`}>
                        <div className="ed-meeting-top">
                          <p className="ed-meeting-title">{m.title}</p>
                          <span className={`ed-pill pill-${s.type}`}>{s.label}</span>
                        </div>
                        <p className="ed-meeting-desc">{m.description}</p>
                        <div className="ed-meeting-meta">
                          <span>{new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          <span>{m.startTime || m.time} — {m.endTime || 'N/A'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Link to="/meetings" className="ed-view-all">View all meetings</Link>
            </div>

            {/* Recent Documents */}
            <div className="ed-card">
              <div className="ed-card-header">
                <h3>Recent Documents</h3>
                <span className="ed-badge badge-blue">{documents.length}</span>
              </div>
              <div className="ed-search-bar">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input placeholder="Search documents..." value={docSearch} onChange={e => setDocSearch(e.target.value)} />
              </div>
              {filteredDocs.length === 0 ? (
                <div className="ed-empty">No documents available</div>
              ) : (
                <div className="ed-doc-list">
                  {filteredDocs.slice(0, 5).map(doc => (
                    <div key={doc._id} className="ed-doc-item">
                      <div className="ed-doc-icon">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div className="ed-doc-info">
                        <p className="ed-doc-title">{doc.title}</p>
                        <p className="ed-doc-date">{new Date(doc.uploadDate).toLocaleDateString()}</p>
                      </div>
                      <a href={`${import.meta.env.VITE_API_URL}/uploads/${doc.fileName}`} target="_blank" rel="noopener noreferrer" className="ed-download-btn" title="Download">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      </a>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/documents" className="ed-view-all">View all documents</Link>
            </div>
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {showProfile && (
        <div className="ed-modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="ed-modal" onClick={e => e.stopPropagation()}>
            <div className="ed-modal-header">
              <h2>Profile</h2>
              <button className="ed-modal-close" onClick={() => setShowProfile(false)}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="ed-modal-profile">
              <div className="ed-modal-avatar">{user?.name?.charAt(0)}</div>
              <h3>{user?.name}</h3>
              <span className="ed-badge badge-violet">{user?.role}</span>
            </div>
            <div className="ed-modal-details">
              {[
                ['Email', user?.email],
                ['Roll No', user?.rollNo || 'N/A'],
                ['Job Type', user?.jobType || 'N/A'],
                ['Experience', user?.experience || 'N/A'],
                ['System', user?.system || 'N/A'],
                ['Joined', user?.dateOfJoining ? new Date(user.dateOfJoining).toLocaleDateString() : 'N/A'],
              ].map(([k, v]) => (
                <div key={k} className="ed-detail-row">
                  <span>{k}</span><span>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeDashboard;

