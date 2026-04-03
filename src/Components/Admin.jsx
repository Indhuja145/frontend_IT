import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

const API = 'http://localhost:5000/api';

const Icons = {
  dashboard: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  users:     <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  attendance:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  leave:     <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  requests:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  meetings:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  documents: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  query:     <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  reports:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  logout:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  userStat:  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  pending:   <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  calendar:  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  docs:      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  check:     <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  close:     <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

function getMeetingStatus(m) {
  const now = new Date();
  const date = new Date(m.date);
  const [sh, sm] = (m.startTime || m.time || '00:00').split(':');
  const [eh, em] = (m.endTime || m.time || '23:59').split(':');
  const start = new Date(date); start.setHours(+sh, +sm, 0, 0);
  const end   = new Date(date); end.setHours(+eh, +em, 0, 0);
  if (now > end) return { label: 'Completed', type: 'completed' };
  if (now >= start && now <= end) return { label: 'Live Now', type: 'ongoing' };
  const diff = Math.round((start - now) / 60000);
  if (diff <= 60) return { label: `Starts in ${diff}m`, type: 'soon' };
  return { label: 'Upcoming', type: 'upcoming' };
}

function LiveClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  return (
    <div className="adm-clock">
      <span className="adm-clock-time">{t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      <span className="adm-clock-date">{t.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
    </div>
  );
}

const NAV = [
  { to: '/admin',            icon: 'dashboard', label: 'Dashboard' },
  { to: '/user',             icon: 'users',     label: 'Users' },
  { to: '/attendance',       icon: 'attendance',label: 'Attendance' },
  { to: '/leave-approval',   icon: 'leave',     label: 'Leave Approvals' },
  { to: '/pending-requests', icon: 'requests',  label: 'Requests' },
  { to: '/admin-meetings',   icon: 'meetings',  label: 'Meetings' },
  { to: '/documents',        icon: 'documents', label: 'Documents' },
  { to: '/query',            icon: 'query',     label: 'Queries' },
  { to: '/reports',          icon: 'reports',   label: 'Reports' },
];

export default function Admin() {
  const navigate = useNavigate();
  const [admin, setAdmin]       = useState(null);
  const [stats, setStats]       = useState({ users: 0, pending: 0, meetingsToday: 0, documents: 0, leaves: 0, queries: 0 });
  const [meetings, setMeetings] = useState([]);
  const [leaves, setLeaves]     = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [now, setNow]           = useState(new Date());
  const [notification, setNotification] = useState(null);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    const email = localStorage.getItem('userEmail');
    if (!email) { navigate('/'); return; }
    try {
      const [adminRes, usersRes, meetRes, docRes, leaveRes, reqRes, queryRes] = await Promise.allSettled([
        axios.get(`${API}/user-profile/${email}`),
        axios.get(`${API}/users`),
        axios.get(`${API}/meetings`),
        axios.get(`${API}/documents`),
        axios.get(`${API}/leaves`),
        axios.get(`${API}/requests`),
        axios.get(`${API}/queries`),
      ]);
      if (adminRes.status === 'fulfilled') {
        const a = adminRes.value.data;
        if (a.role !== 'admin') { localStorage.clear(); navigate('/'); return; }
        setAdmin(a);
      }
      const today = new Date().toDateString();
      const allMeetings = meetRes.status === 'fulfilled' ? meetRes.value.data : [];
      const allLeaves   = leaveRes.status === 'fulfilled' ? leaveRes.value.data : [];
      const allReqs     = reqRes.status === 'fulfilled'   ? reqRes.value.data   : [];
      const allQueries  = queryRes.status === 'fulfilled' ? queryRes.value.data : [];

      setMeetings(allMeetings);
      setLeaves(allLeaves.slice(0, 6));
      setRequests(allReqs.slice(0, 6));
      setStats({
        users:        usersRes.status === 'fulfilled' ? usersRes.value.data.length : 0,
        pending:      allReqs.filter(r => r.status === 'pending' || r.status === 'Pending').length,
        meetingsToday:allMeetings.filter(m => new Date(m.date).toDateString() === today).length,
        documents:    docRes.status === 'fulfilled' ? docRes.value.data.length : 0,
        leaves:       allLeaves.filter(l => l.status === 'Pending').length,
        queries:      allQueries.filter(q => q.status === 'open').length,
      });
      setLoading(false);
    } catch { navigate('/'); }
  }, [navigate]);

  useEffect(() => {
    fetchAll();
    const poll = setInterval(fetchAll, 60000);
    return () => clearInterval(poll);
  }, [fetchAll]);

  const handleApproveLeave = async (id) => {
    try { await axios.put(`${API}/leaves/${id}`, { status: 'Approved' }); showNotif('Leave approved'); fetchAll(); }
    catch { showNotif('Failed', 'error'); }
  };
  const handleRejectLeave = async (id) => {
    try { await axios.put(`${API}/leaves/${id}`, { status: 'Rejected' }); showNotif('Leave rejected'); fetchAll(); }
    catch { showNotif('Failed', 'error'); }
  };

  const todayMeetings  = meetings.filter(m => new Date(m.date).toDateString() === now.toDateString());
  const upcomingMeets  = meetings.filter(m => getMeetingStatus(m).type !== 'completed').slice(0, 5);
  const pendingLeaves  = leaves.filter(l => l.status === 'Pending');

  if (loading) return (
    <div className="adm-loading"><div className="adm-spinner"></div><p>Loading Dashboard...</p></div>
  );

  return (
    <div className="adm-container">
      {notification && <div className={`adm-notif ${notification.type}`}>{notification.msg}</div>}

      {/* Sidebar */}
      <aside className="adm-sidebar">
        <div className="adm-brand">
          <div className="adm-brand-icon">IT</div>
          <span>IT-MIS</span>
        </div>
        <p className="adm-portal-label">Admin Portal</p>
        <nav className="adm-nav">
          {NAV.map(item => (
            <Link key={item.to} to={item.to} className={`adm-nav-item ${item.to === '/admin' ? 'active' : ''}`}>
              <span className="adm-nav-icon">{Icons[item.icon]}</span>
              <span>{item.label}</span>
              {item.to === '/leave-approval' && stats.leaves > 0 && <span className="adm-nav-badge">{stats.leaves}</span>}
              {item.to === '/pending-requests' && stats.pending > 0 && <span className="adm-nav-badge">{stats.pending}</span>}
            </Link>
          ))}
        </nav>
        <div className="adm-sidebar-footer">
          <div className="adm-avatar-sm">{admin?.name?.charAt(0)}</div>
          <div className="adm-footer-info">
            <p className="adm-footer-name">{admin?.name}</p>
            <p className="adm-footer-role">Administrator</p>
          </div>
          <button className="adm-logout-btn" title="Logout"
            onClick={() => { if (window.confirm('Logout?')) { localStorage.clear(); navigate('/'); } }}>
            {Icons.logout}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="adm-main">
        {/* Topbar */}
        <header className="adm-topbar">
          <div>
            <h1 className="adm-page-title">Admin Dashboard</h1>
            <p className="adm-page-sub">Overview of system activity</p>
          </div>
          <div className="adm-topbar-right">
            <LiveClock />
            <button className="adm-profile-btn" onClick={() => setShowProfile(true)}>
              <div className="adm-avatar">{admin?.name?.charAt(0)}</div>
            </button>
          </div>
        </header>

        <div className="adm-content">
          {/* Stats */}
          <div className="adm-stats-grid">
            {[
              { label: 'Total Users',     value: stats.users,        sub: 'registered accounts', accent: 'blue',   icon: Icons.userStat },
              { label: 'Pending Requests',value: stats.pending,      sub: 'awaiting approval',   accent: 'orange', icon: Icons.pending  },
              { label: 'Meetings Today',  value: stats.meetingsToday,sub: 'scheduled today',      accent: 'violet', icon: Icons.calendar },
              { label: 'Total Documents', value: stats.documents,    sub: 'uploaded files',       accent: 'green',  icon: Icons.docs     },
            ].map(s => (
              <div key={s.label} className={`adm-stat-card accent-${s.accent}`}>
                <div className={`adm-stat-icon icon-${s.accent}`}>{s.icon}</div>
                <div>
                  <p className="adm-stat-value">{s.value}</p>
                  <p className="adm-stat-label">{s.label}</p>
                  <p className="adm-stat-sub">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Insights Row */}
          <div className="adm-insights-row">
            <div className="adm-badge-card">
              <span className="adm-ins-label">Pending Leaves</span>
              <span className="adm-ins-val orange">{stats.leaves}</span>
            </div>
            <div className="adm-badge-card">
              <span className="adm-ins-label">Open Queries</span>
              <span className="adm-ins-val violet">{stats.queries}</span>
            </div>
            <div className="adm-badge-card">
              <span className="adm-ins-label">Upcoming Meetings</span>
              <span className="adm-ins-val blue">{upcomingMeets.length}</span>
            </div>
            <div className="adm-badge-card">
              <span className="adm-ins-label">Total Requests</span>
              <span className="adm-ins-val green">{requests.length}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="adm-card">
            <div className="adm-card-header"><h3>Quick Actions</h3></div>
            <div className="adm-actions-grid">
              {[
                { to: '/user',             label: 'Add User',         icon: Icons.users     },
                { to: '/leave-approval',   label: 'Leave Approvals',  icon: Icons.leave     },
                { to: '/admin-meetings',   label: 'Schedule Meeting', icon: Icons.meetings  },
                { to: '/pending-requests', label: 'View Requests',    icon: Icons.requests  },
                { to: '/documents',        label: 'Upload Document',  icon: Icons.documents },
                { to: '/reports',          label: 'View Reports',     icon: Icons.reports   },
              ].map(a => (
                <Link key={a.to} to={a.to} className="adm-action-card">
                  <span className="adm-action-icon">{a.icon}</span>
                  <span>{a.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Main Grid */}
          <div className="adm-grid-2col">
            {/* Today's Schedule */}
            <div className="adm-card">
              <div className="adm-card-header">
                <h3>Today's Schedule</h3>
                <span className="adm-badge badge-blue">{todayMeetings.length} meetings</span>
              </div>
              {todayMeetings.length === 0 ? (
                <div className="adm-empty">No meetings scheduled for today</div>
              ) : (
                <div className="adm-schedule-list">
                  {todayMeetings.map(m => {
                    const s = getMeetingStatus(m);
                    return (
                      <div key={m._id} className={`adm-schedule-item status-${s.type}`}>
                        <div className="adm-schedule-time">
                          <span>{m.startTime || m.time}</span>
                          <span>{m.endTime || ''}</span>
                        </div>
                        <div className="adm-schedule-info">
                          <p className="adm-schedule-title">{m.title}</p>
                          <p className="adm-schedule-desc">{m.description}</p>
                        </div>
                        <span className={`adm-pill pill-${s.type}`}>{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upcoming Meetings */}
            <div className="adm-card">
              <div className="adm-card-header">
                <h3>Upcoming Meetings</h3>
                <Link to="/admin-meetings" className="adm-link-btn">Manage</Link>
              </div>
              {upcomingMeets.length === 0 ? (
                <div className="adm-empty">No upcoming meetings</div>
              ) : (
                <div className="adm-meeting-list">
                  {upcomingMeets.map(m => {
                    const s = getMeetingStatus(m);
                    return (
                      <div key={m._id} className={`adm-meeting-item border-${s.type}`}>
                        <div className="adm-meeting-top">
                          <p className="adm-meeting-title">{m.title}</p>
                          <span className={`adm-pill pill-${s.type}`}>{s.label}</span>
                        </div>
                        <div className="adm-meeting-meta">
                          <span>{new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          <span>{m.startTime || m.time} — {m.endTime || 'N/A'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending Leave Approvals */}
            <div className="adm-card">
              <div className="adm-card-header">
                <h3>Pending Leave Approvals</h3>
                {pendingLeaves.length > 0 && <span className="adm-badge badge-orange">{pendingLeaves.length}</span>}
              </div>
              {pendingLeaves.length === 0 ? (
                <div className="adm-empty">No pending leave requests</div>
              ) : (
                <div className="adm-approval-list">
                  {pendingLeaves.map(l => (
                    <div key={l._id} className="adm-approval-item">
                      <div className="adm-approval-info">
                        <p className="adm-approval-name">{l.employeeName}</p>
                        <p className="adm-approval-meta">{l.leaveType} · {l.numberOfDays} day{l.numberOfDays !== 1 ? 's' : ''}</p>
                        <p className="adm-approval-dates">{new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}</p>
                      </div>
                      <div className="adm-approval-btns">
                        <button className="adm-btn-approve" onClick={() => handleApproveLeave(l._id)} title="Approve">{Icons.check}</button>
                        <button className="adm-btn-reject"  onClick={() => handleRejectLeave(l._id)}  title="Reject">{Icons.close}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/leave-approval" className="adm-view-all">View all leave requests</Link>
            </div>

            {/* Recent Activity */}
            <div className="adm-card">
              <div className="adm-card-header">
                <h3>Recent Requests</h3>
                <Link to="/pending-requests" className="adm-link-btn">View All</Link>
              </div>
              {requests.length === 0 ? (
                <div className="adm-empty">No recent requests</div>
              ) : (
                <div className="adm-activity-list">
                  {requests.map(r => (
                    <div key={r._id} className="adm-activity-item">
                      <div className={`adm-activity-dot dot-${r.status?.toLowerCase() === 'approved' ? 'green' : r.status?.toLowerCase() === 'rejected' ? 'red' : 'orange'}`}></div>
                      <div className="adm-activity-body">
                        <p className="adm-activity-title">{r.employeeName} — {r.requestType || 'General'}</p>
                        <p className="adm-activity-meta">{r.dateSubmitted ? new Date(r.dateSubmitted).toLocaleDateString() : ''}</p>
                      </div>
                      <span className={`status-badge ${r.status?.toLowerCase()}`}>{r.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2>Admin Profile</h2>
              <button className="adm-modal-close" onClick={() => setShowProfile(false)}>{Icons.close}</button>
            </div>
            <div className="adm-modal-profile">
              <div className="adm-modal-avatar">{admin?.name?.charAt(0)}</div>
              <h3>{admin?.name}</h3>
              <span className="adm-badge badge-violet">Administrator</span>
            </div>
            <div className="adm-modal-details">
              {[['Email', admin?.email], ['Roll No', admin?.rollNo || 'N/A'], ['Role', admin?.role], ['Joined', admin?.dateOfJoining ? new Date(admin.dateOfJoining).toLocaleDateString() : 'N/A']].map(([k, v]) => (
                <div key={k} className="detail-row"><span>{k}</span><span>{v}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
