import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LeaveRequest.css';

const API = `${import.meta.env.VITE_API_URL}/api`;

export default function LeaveRequest() {
  const [formData, setFormData] = useState({ leaveType: '', startDate: '', endDate: '', reason: '' });
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const userName  = localStorage.getItem('userName')  || 'Employee';
  const userEmail = localStorage.getItem('userEmail') || '';

  useEffect(() => { fetchLeaveHistory(); }, []);

  const fetchLeaveHistory = async () => {
    try {
      const res = await axios.get(`${API}/leaves/${userEmail}`);
      setLeaveHistory(res.data);
    } catch { setLeaveHistory([]); }
    setLoading(false);
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const d = Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / 86400000) + 1;
    return d > 0 ? d : 0;
  };

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const days = calculateDays();
    if (days <= 0) { showNotif('Invalid date range', 'error'); return; }
    try {
      await axios.post(`${API}/leaves`, {
        employeeName: userName, employeeEmail: userEmail,
        leaveType: formData.leaveType, startDate: formData.startDate,
        endDate: formData.endDate, numberOfDays: days,
        reason: formData.reason, status: 'Pending'
      });
      showNotif('Leave request submitted successfully');
      setFormData({ leaveType: '', startDate: '', endDate: '', reason: '' });
      fetchLeaveHistory();
    } catch { showNotif('Failed to submit leave request', 'error'); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this leave request?')) return;
    try {
      await axios.delete(`${API}/leaves/${id}`);
      showNotif('Leave request cancelled');
      fetchLeaveHistory();
    } catch { showNotif('Failed to cancel', 'error'); }
  };

  const taken     = leaveHistory.filter(l => l.status === 'Approved' || l.status === 'approved').reduce((s, l) => s + (l.numberOfDays || 0), 0);
  const remaining = 20 - taken;

  return (
    <div className="leave-request-page">
      {notification && <div className={`notification ${notification.type}`}>{notification.msg}</div>}

      <div className="page-header">
        <h1>Leave Request</h1>
        <p>Manage your leave applications</p>
      </div>

      <div className="leave-summary">
        {[
          { label: 'Total Balance', value: 20,        sub: 'days per year',  cls: 'total'     },
          { label: 'Leaves Taken',  value: taken,      sub: 'this year',      cls: 'taken'     },
          { label: 'Remaining',     value: remaining,  sub: 'available days', cls: 'remaining' },
        ].map(s => (
          <div key={s.label} className={`summary-card ${s.cls}`}>
            <div className="card-content">
              <h3>{s.label}</h3>
              <p className="card-number">{s.value}</p>
              <span className="card-label">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="leave-form-section">
        <h2>Submit Leave Request</h2>
        <form onSubmit={handleSubmit} className="leave-form">
          <div className="form-row">
            <div className="form-group">
              <label>Leave Type *</label>
              <select value={formData.leaveType} onChange={e => setFormData({...formData, leaveType: e.target.value})} required>
                <option value="">Select Leave Type</option>
                <option>Casual Leave</option>
                <option>Sick Leave</option>
                <option>Paid Leave</option>
                <option>Emergency Leave</option>
              </select>
            </div>
            <div className="form-group">
              <label>Start Date *</label>
              <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>End Date *</label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Number of Days</label>
              <input type="text" value={calculateDays()} readOnly className="readonly-input" />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Reason *</label>
            <textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} placeholder="Enter reason for leave..." rows="3" required />
          </div>
          <button type="submit" className="submit-btn">Submit Request</button>
        </form>
      </div>

      <div className="leave-history-section">
        <div className="history-header"><h2>Leave History</h2></div>
        {loading ? <div className="loading">Loading...</div> : (
          <table className="leave-table">
            <thead>
              <tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {leaveHistory.length === 0 ? (
                <tr><td colSpan="7" className="no-data">No leave requests found</td></tr>
              ) : leaveHistory.map(l => (
                <tr key={l._id}>
                  <td>{l.leaveType}</td>
                  <td>{new Date(l.startDate).toLocaleDateString()}</td>
                  <td>{new Date(l.endDate).toLocaleDateString()}</td>
                  <td>{l.numberOfDays}</td>
                  <td>{l.reason?.substring(0, 30)}{l.reason?.length > 30 ? '...' : ''}</td>
                  <td><span className={`status-badge ${l.status?.toLowerCase()}`}>{l.status}</span></td>
                  <td>
                    {l.status?.toLowerCase() === 'pending' && (
                      <button className="cancel-btn" onClick={() => handleCancel(l._id)}>Cancel</button>
                    )}
                    {l.status?.toLowerCase() === 'approved' && <span style={{color:'var(--green)',fontSize:12,fontWeight:600}}>Verified</span>}
                    {l.status?.toLowerCase() === 'rejected' && <span style={{color:'var(--red)',fontSize:12,fontWeight:600}}>Rejected</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
