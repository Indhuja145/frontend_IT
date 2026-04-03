import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Meeting.css';

const API = 'http://localhost:5000/api';

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

export default function Meeting() {
  const [meetings, setMeetings]   = useState([]);
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [notification, setNotification] = useState(null);
  const [participantInput, setParticipantInput] = useState('');
  const [filteredUsers, setFilteredUsers]       = useState([]);
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', startTime: '', endTime: '', assignedTo: [],
    createdBy: localStorage.getItem('userEmail') || ''
  });

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchMeetings = async () => {
    setLoading(true);
    try { const res = await axios.get(`${API}/meetings`); setMeetings(res.data); }
    catch { showNotif('Failed to load meetings', 'error'); }
    setLoading(false);
  };

  useEffect(() => {
    fetchMeetings();
    axios.get(`${API}/users`).then(r => setUsers(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await axios.post(`${API}/add-meeting`, formData);
      fetchMeetings();
      showNotif('Meeting scheduled successfully');
      setFormData({ title: '', description: '', date: '', startTime: '', endTime: '', assignedTo: [], createdBy: localStorage.getItem('userEmail') || '' });
      setParticipantInput(''); setFilteredUsers([]);
    } catch { showNotif('Failed to schedule meeting', 'error'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this meeting?')) return;
    setLoading(true);
    try { await axios.delete(`${API}/delete-meeting/${id}`); fetchMeetings(); showNotif('Meeting deleted'); }
    catch { showNotif('Failed to delete', 'error'); }
    setLoading(false);
  };

  const addParticipant = (val) => {
    if (val && !formData.assignedTo.includes(val)) {
      setFormData({ ...formData, assignedTo: [...formData.assignedTo, val] });
      setParticipantInput(''); setFilteredUsers([]);
    }
  };

  return (
    <div className="meeting-container">
      {notification && <div className={`notification ${notification.type}`}>{notification.msg}</div>}

      <h1 className="meeting-title">Meeting Management</h1>

      <div className="table-wrapper">
        {loading && <div className="loading">Loading...</div>}
        <table>
          <thead>
            <tr><th>Title</th><th>Description</th><th>Date</th><th>Start</th><th>End</th><th>Participants</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {meetings.length === 0 ? (
              <tr><td colSpan="8" className="no-data">No meetings scheduled</td></tr>
            ) : meetings.map(m => {
              const s = getMeetingStatus(m);
              return (
                <tr key={m._id}>
                  <td>{m.title}</td>
                  <td>{m.description}</td>
                  <td>{m.date ? new Date(m.date).toLocaleDateString() : '—'}</td>
                  <td>{m.startTime || m.time}</td>
                  <td>{m.endTime || '—'}</td>
                  <td>{Array.isArray(m.assignedTo) ? m.assignedTo.join(', ') : m.assignedTo}</td>
                  <td><span className={`status-badge ${s.type}`}>{s.label}</span></td>
                  <td><button className="delete-btn" onClick={() => handleDelete(m._id)} disabled={loading}>Delete</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="form-section">
        <h2>Schedule New Meeting</h2>
        <form onSubmit={handleSubmit} className="meeting-form">
          <input name="title" placeholder="Meeting Title *" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required disabled={loading} />
          <input name="description" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} disabled={loading} />
          <input type="date" name="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required disabled={loading} />
          <input type="time" name="startTime" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} required disabled={loading} />
          <input type="time" name="endTime" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} required disabled={loading} />

          <div style={{gridColumn:'span 2'}}>
            <label style={{display:'block',marginBottom:6,fontSize:12,fontWeight:600,color:'var(--text-secondary)'}}>Participants</label>
            <div style={{display:'flex',gap:8,marginBottom:8}}>
              <input
                type="text" placeholder="Search by name or email..."
                value={participantInput}
                onChange={e => {
                  setParticipantInput(e.target.value);
                  setFilteredUsers(e.target.value ? users.filter(u =>
                    u.name?.toLowerCase().includes(e.target.value.toLowerCase()) ||
                    u.email?.toLowerCase().includes(e.target.value.toLowerCase())
                  ) : []);
                }}
                disabled={loading} style={{flex:1}}
              />
              <button type="button" onClick={() => addParticipant(participantInput)} disabled={loading}
                style={{padding:'9px 16px',background:'var(--accent)',color:'white',border:'none',borderRadius:'var(--radius)',cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'inherit'}}>
                Add
              </button>
            </div>
            {filteredUsers.length > 0 && (
              <div style={{background:'var(--bg-input)',border:'1px solid var(--border)',borderRadius:'var(--radius)',maxHeight:140,overflowY:'auto',marginBottom:8}}>
                {filteredUsers.map(u => (
                  <div key={u._id} onClick={() => addParticipant(u.email)}
                    style={{padding:'9px 12px',cursor:'pointer',fontSize:13,color:'var(--text-primary)',borderBottom:'1px solid var(--border)',transition:'background 0.15s'}}
                    onMouseEnter={e => e.currentTarget.style.background='var(--accent-muted)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    {u.name} — {u.email}
                  </div>
                ))}
              </div>
            )}
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {formData.assignedTo.map((p, i) => (
                <span key={i} style={{background:'var(--accent-muted)',border:'1px solid var(--border-accent)',padding:'4px 10px',borderRadius:20,color:'var(--accent-light)',fontSize:12,display:'flex',alignItems:'center',gap:6}}>
                  {p}
                  <button type="button" onClick={() => setFormData({...formData, assignedTo: formData.assignedTo.filter((_,j)=>j!==i)})}
                    style={{background:'none',border:'none',color:'var(--red)',cursor:'pointer',fontSize:14,lineHeight:1,padding:0}}>×</button>
                </span>
              ))}
            </div>
          </div>

          <input name="createdBy" value={formData.createdBy} readOnly disabled style={{opacity:0.5,cursor:'not-allowed'}} />

          <div className="button-center">
            <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Scheduling...' : 'Schedule Meeting'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
