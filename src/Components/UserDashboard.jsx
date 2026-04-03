import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserDashboard.css';

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
    <div className="live-clock">
      <span className="clock-time">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      <span className="clock-date">{time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
    </div>
  );
}

function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [queries, setQueries] = useState([]);
  const [newQuery, setNewQuery] = useState({ title: '', description: '' });
  const [answerText, setAnswerText] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [meetingFilter, setMeetingFilter] = useState('upcoming');
  const [now, setNow] = useState(new Date());
  const [notification, setNotification] = useState(null);

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
      const [userRes, meetRes, leaveRes, queryRes] = await Promise.allSettled([
        axios.get(`${API}/user-profile/${email}`),
        axios.get(`${API}/user-meetings/${email}`),
        axios.get(`${API}/leaves/${email}`),
        axios.get(`${API}/queries`)
      ]);
      if (userRes.status === 'fulfilled') setUser(userRes.value.data);
      else { navigate('/'); return; }
      if (meetRes.status === 'fulfilled') setMeetings(meetRes.value.data);
      if (leaveRes.status === 'fulfilled') setLeaves(leaveRes.value.data);
      if (queryRes.status === 'fulfilled') setQueries(queryRes.value.data);
      setLoading(false);
    } catch { navigate('/'); }
  }, [navigate]);

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePostQuery = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/add-query`, { ...newQuery, postedBy: user.name, postedByEmail: user.email });
      setNewQuery({ title: '', description: '' });
      fetchAll(user.email);
      showNotif('Query posted successfully');
    } catch { showNotif('Failed to post query', 'error'); }
  };

  const handleAnswerQuery = async (queryId) => {
    if (!answerText[queryId]?.trim()) return;
    try {
      await axios.post(`${API}/answer-query/${queryId}`, { answer: answerText[queryId], answeredBy: user.name, answeredByEmail: user.email });
      setAnswerText({ ...answerText, [queryId]: '' });
      fetchAll(user.email);
      showNotif('Answer posted');
    } catch { showNotif('Failed to post answer', 'error'); }
  };

  const handleDeleteQuery = async (queryId) => {
    if (!window.confirm('Delete this query?')) return;
    try {
      await axios.delete(`${API}/delete-query/${queryId}`);
      fetchAll(user.email);
      showNotif('Query deleted');
    } catch { showNotif('Failed to delete', 'error'); }
  };

  const upcomingMeetings = meetings.filter(m => getMeetingStatus(m).type !== 'completed');
  const completedMeetings = meetings.filter(m => getMeetingStatus(m).type === 'completed');
  const todayMeetings = meetings.filter(m => new Date(m.date).toDateString() === now.toDateString());
  const pendingLeaves = leaves.filter(l => l.status === 'Pending');
  const openQueries = queries.filter(q => q.status === 'open');

  if (loading) return (
    <div className="ud-loading">
      <div className="ud-spinner"></div>
      <p>Loading Dashboard...</p>
    </div>
  );

  const displayedMeetings = meetingFilter === 'upcoming' ? upcomingMeetings : completedMeetings;

  return (
    <div className="ud-container">
      {notification && (
        <div className={`ud-notification ${notification.type}`}>{notification.msg}</div>
      )}

      {/* Sidebar */}
      <aside className="ud-sidebar">
        <div className="ud-brand">
          <div className="ud-brand-icon">IT</div>
          <span>IT-MIS</span>
        </div>
        <nav className="ud-nav">
          {[
            { id: 'overview', icon: '▦', label: 'Overview' },
            { id: 'meetings', icon: '◷', label: 'Meetings' },
            { id: 'leaves', icon: '◈', label: 'Leave Requests' },
            { id: 'queries', icon: '◎', label: 'Queries' },
          ].map(item => (
            <button
              key={item.id}
              className={`ud-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === 'leaves' && pendingLeaves.length > 0 && <span className="nav-badge">{pendingLeaves.length}</span>}
              {item.id === 'queries' && openQueries.length > 0 && <span className="nav-badge">{openQueries.length}</span>}
            </button>
          ))}
        </nav>
        <div className="ud-sidebar-profile">
          <div className="ud-avatar">{user?.name?.charAt(0)}</div>
          <div>
            <p className="ud-profile-name">{user?.name}</p>
            <p className="ud-profile-role">{user?.role}</p>
          </div>
          <button className="ud-logout" onClick={() => { localStorage.removeItem('userEmail'); navigate('/'); }} title="Logout">⏻</button>
        </div>
      </aside>

      {/* Main */}
      <main className="ud-main">
        {/* Topbar */}
        <header className="ud-topbar">
          <div>
            <h1 className="ud-page-title">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'meetings' && 'My Meetings'}
              {activeTab === 'leaves' && 'Leave Requests'}
              {activeTab === 'queries' && 'Queries & Answers'}
            </h1>
            <p className="ud-page-sub">Welcome back, {user?.name}</p>
          </div>
          <LiveClock />
        </header>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="ud-content">
            {/* Stats */}
            <div className="ud-stats-grid">
              {[
                { label: "Today's Meetings", value: todayMeetings.length, sub: 'scheduled today', accent: 'violet' },
                { label: 'Upcoming Meetings', value: upcomingMeetings.length, sub: 'not yet completed', accent: 'blue' },
                { label: 'Pending Leaves', value: pendingLeaves.length, sub: 'awaiting approval', accent: 'orange' },
                { label: 'Open Queries', value: openQueries.length, sub: 'need attention', accent: 'green' },
              ].map(s => (
                <div key={s.label} className={`ud-stat-card accent-${s.accent}`}>
                  <p className="ud-stat-value">{s.value}</p>
                  <p className="ud-stat-label">{s.label}</p>
                  <p className="ud-stat-sub">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="ud-overview-grid">
              {/* Profile */}
              <div className="ud-card">
                <div className="ud-card-header">
                  <h3>Profile</h3>
                  <span className="ud-badge badge-violet">{user?.role}</span>
                </div>
                <div className="ud-profile-grid">
                  <div className="ud-profile-avatar-lg">{user?.name?.charAt(0)}</div>
                  <div className="ud-profile-details">
                    <h2>{user?.name}</h2>
                    <p>{user?.email}</p>
                  </div>
                </div>
                <div className="ud-info-list">
                  <div className="ud-info-row"><span>Roll No</span><span>{user?.rollNo || 'N/A'}</span></div>
                  <div className="ud-info-row"><span>Job Type</span><span>{user?.jobType || 'N/A'}</span></div>
                  <div className="ud-info-row"><span>Experience</span><span>{user?.experience || 'N/A'}</span></div>
                  <div className="ud-info-row"><span>Joined</span><span>{user?.dateOfJoining ? new Date(user.dateOfJoining).toLocaleDateString() : 'N/A'}</span></div>
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="ud-card">
                <div className="ud-card-header">
                  <h3>Today's Schedule</h3>
                  <span className="ud-badge badge-blue">{todayMeetings.length} meetings</span>
                </div>
                {todayMeetings.length === 0 ? (
                  <div className="ud-empty">No meetings scheduled for today</div>
                ) : (
                  <div className="ud-schedule-list">
                    {todayMeetings.map(m => {
                      const status = getMeetingStatus(m);
                      return (
                        <div key={m._id} className={`ud-schedule-item status-${status.type}`}>
                          <div className="ud-schedule-time">
                            <span>{m.startTime || m.time}</span>
                            <span>{m.endTime || ''}</span>
                          </div>
                          <div className="ud-schedule-info">
                            <p className="ud-schedule-title">{m.title}</p>
                            <p className="ud-schedule-desc">{m.description}</p>
                          </div>
                          <span className={`ud-status-pill pill-${status.type}`}>{status.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pending Approvals */}
              <div className="ud-card">
                <div className="ud-card-header">
                  <h3>Pending Approvals</h3>
                  {pendingLeaves.length > 0 && <span className="ud-badge badge-orange">{pendingLeaves.length}</span>}
                </div>
                {pendingLeaves.length === 0 ? (
                  <div className="ud-empty">No pending leave requests</div>
                ) : (
                  <div className="ud-approval-list">
                    {pendingLeaves.slice(0, 4).map(l => (
                      <div key={l._id} className="ud-approval-item">
                        <div>
                          <p className="ud-approval-type">{l.leaveType}</p>
                          <p className="ud-approval-dates">{new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}</p>
                        </div>
                        <span className="ud-status-pill pill-soon">Pending</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Queries */}
              <div className="ud-card">
                <div className="ud-card-header">
                  <h3>Recent Activity</h3>
                  <button className="ud-link-btn" onClick={() => setActiveTab('queries')}>View All</button>
                </div>
                {queries.length === 0 ? (
                  <div className="ud-empty">No recent activity</div>
                ) : (
                  <div className="ud-activity-list">
                    {queries.slice(0, 4).map(q => (
                      <div key={q._id} className="ud-activity-item">
                        <div className={`ud-activity-dot ${q.status === 'answered' ? 'dot-green' : 'dot-orange'}`}></div>
                        <div>
                          <p className="ud-activity-title">{q.title}</p>
                          <p className="ud-activity-meta">{new Date(q.createdAt).toLocaleDateString()} · {q.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MEETINGS TAB */}
        {activeTab === 'meetings' && (
          <div className="ud-content">
            <div className="ud-tab-filters">
              <button className={`ud-filter-btn ${meetingFilter === 'upcoming' ? 'active' : ''}`} onClick={() => setMeetingFilter('upcoming')}>
                Upcoming <span className="filter-count">{upcomingMeetings.length}</span>
              </button>
              <button className={`ud-filter-btn ${meetingFilter === 'completed' ? 'active' : ''}`} onClick={() => setMeetingFilter('completed')}>
                Completed <span className="filter-count">{completedMeetings.length}</span>
              </button>
            </div>
            {displayedMeetings.length === 0 ? (
              <div className="ud-card ud-empty">No {meetingFilter} meetings</div>
            ) : (
              <div className="ud-meetings-grid">
                {displayedMeetings.map(m => {
                  const status = getMeetingStatus(m);
                  return (
                    <div key={m._id} className={`ud-meeting-card status-border-${status.type}`}>
                      <div className="ud-meeting-top">
                        <h3>{m.title}</h3>
                        <span className={`ud-status-pill pill-${status.type}`}>{status.label}</span>
                      </div>
                      <p className="ud-meeting-desc">{m.description}</p>
                      <div className="ud-meeting-meta">
                        <span>{new Date(m.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <span>{m.startTime || m.time} — {m.endTime || 'N/A'}</span>
                      </div>
                      {m.assignedTo?.length > 0 && (
                        <div className="ud-meeting-participants">
                          {(Array.isArray(m.assignedTo) ? m.assignedTo : [m.assignedTo]).slice(0, 3).map((p, i) => (
                            <span key={i} className="ud-participant-tag">{p}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* LEAVES TAB */}
        {activeTab === 'leaves' && (
          <div className="ud-content">
            <div className="ud-card">
              <div className="ud-card-header"><h3>My Leave Requests</h3></div>
              {leaves.length === 0 ? (
                <div className="ud-empty">No leave requests found</div>
              ) : (
                <table className="ud-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map(l => (
                      <tr key={l._id}>
                        <td>{l.leaveType}</td>
                        <td>{new Date(l.startDate).toLocaleDateString()}</td>
                        <td>{new Date(l.endDate).toLocaleDateString()}</td>
                        <td>{l.numberOfDays}</td>
                        <td>{l.reason}</td>
                        <td><span className={`ud-status-pill pill-${l.status.toLowerCase()}`}>{l.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* QUERIES TAB */}
        {activeTab === 'queries' && (
          <div className="ud-content">
            <div className="ud-two-col">
              <div className="ud-card">
                <div className="ud-card-header"><h3>Post a Query</h3></div>
                <form onSubmit={handlePostQuery} className="ud-form">
                  <input
                    type="text"
                    placeholder="Query title"
                    value={newQuery.title}
                    onChange={e => setNewQuery({ ...newQuery, title: e.target.value })}
                    required
                  />
                  <textarea
                    placeholder="Describe your query..."
                    value={newQuery.description}
                    onChange={e => setNewQuery({ ...newQuery, description: e.target.value })}
                    required
                  />
                  <button type="submit" className="ud-btn-primary">Submit Query</button>
                </form>
              </div>

              <div className="ud-card ud-queries-list-card">
                <div className="ud-card-header">
                  <h3>All Queries</h3>
                  <span className="ud-badge badge-violet">{queries.length}</span>
                </div>
                <div className="ud-queries-scroll">
                  {queries.map(q => (
                    <div key={q._id} className="ud-query-item">
                      <div className="ud-query-top">
                        <h4>{q.title}</h4>
                        <div className="ud-query-actions">
                          <span className={`ud-status-pill pill-${q.status}`}>{q.status}</span>
                          {q.postedByEmail === user?.email && (
                            <button className="ud-icon-btn danger" onClick={() => handleDeleteQuery(q._id)} title="Delete">✕</button>
                          )}
                        </div>
                      </div>
                      <p className="ud-query-desc">{q.description}</p>
                      <p className="ud-query-meta">By {q.postedBy} · {new Date(q.createdAt).toLocaleDateString()}</p>
                      {q.answers?.length > 0 && (
                        <div className="ud-answers">
                          {q.answers.map((a, i) => (
                            <div key={i} className="ud-answer">
                              <p>{a.answer}</p>
                              <p className="ud-query-meta">— {a.answeredBy} · {new Date(a.answeredAt).toLocaleDateString()}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="ud-answer-form">
                        <input
                          type="text"
                          placeholder="Write an answer..."
                          value={answerText[q._id] || ''}
                          onChange={e => setAnswerText({ ...answerText, [q._id]: e.target.value })}
                        />
                        <button className="ud-btn-sm" onClick={() => handleAnswerQuery(q._id)}>Reply</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default UserDashboard;
