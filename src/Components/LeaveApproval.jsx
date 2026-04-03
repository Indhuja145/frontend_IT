import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LeaveApproval.css';

const API = 'http://localhost:5000/api';

export default function LeaveApproval() {
  const [leaves, setLeaves]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [notification, setNotification]   = useState(null);

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    try { const res = await axios.get(`${API}/leaves`); setLeaves(res.data); }
    catch { setLeaves([]); }
    setLoading(false);
  };

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleApprove = async (id) => {
    try { await axios.put(`${API}/leaves/${id}`, { status: 'Approved' }); showNotif('Leave approved'); setSelectedLeave(null); fetchLeaves(); }
    catch { showNotif('Failed to approve', 'error'); }
  };
  const handleReject = async (id) => {
    try { await axios.put(`${API}/leaves/${id}`, { status: 'Rejected' }); showNotif('Leave rejected'); setSelectedLeave(null); fetchLeaves(); }
    catch { showNotif('Failed to reject', 'error'); }
  };

  const filtered     = statusFilter === 'All' ? leaves : leaves.filter(l => l.status === statusFilter);
  const pendingCount = leaves.filter(l => l.status === 'Pending').length;

  return (
    <div className="leave-approval-container">
      {notification && <div className={`notification ${notification.type}`}>{notification.msg}</div>}

      <div className="approval-header">
        <div>
          <h1>Leave Approvals</h1>
          <p>Review and manage employee leave requests</p>
        </div>
        {pendingCount > 0 && <span className="pending-badge">{pendingCount} Pending</span>}
      </div>

      <div className="filters-section">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="filter-select">
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="table-container">
        {loading ? <div className="loading">Loading...</div> : (
          <table className="leave-approval-table">
            <thead>
              <tr><th>Employee</th><th>Leave Type</th><th>From</th><th>To</th><th>Days</th><th>Submitted</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" className="no-data">No leave requests found</td></tr>
              ) : filtered.map(l => (
                <tr key={l._id}>
                  <td>{l.employeeName}</td>
                  <td>{l.leaveType}</td>
                  <td>{new Date(l.startDate).toLocaleDateString()}</td>
                  <td>{new Date(l.endDate).toLocaleDateString()}</td>
                  <td>{l.numberOfDays}</td>
                  <td>{l.submittedAt ? new Date(l.submittedAt).toLocaleDateString() : '—'}</td>
                  <td><span className={`status-badge ${l.status?.toLowerCase()}`}>{l.status}</span></td>
                  <td>
                    <div className="action-btns">
                      {l.status === 'Pending' && (
                        <>
                          <button className="approve-btn" onClick={() => handleApprove(l._id)}>Approve</button>
                          <button className="reject-btn"  onClick={() => handleReject(l._id)}>Reject</button>
                        </>
                      )}
                      <button className="view-btn" onClick={() => setSelectedLeave(l)}>View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedLeave && (
        <div className="modal-overlay" onClick={() => setSelectedLeave(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Leave Request Details</h2>
            <div className="modal-body">
              {[['Employee', selectedLeave.employeeName], ['Email', selectedLeave.employeeEmail], ['Leave Type', selectedLeave.leaveType],
                ['From', new Date(selectedLeave.startDate).toLocaleDateString()], ['To', new Date(selectedLeave.endDate).toLocaleDateString()],
                ['Days', selectedLeave.numberOfDays]].map(([k, v]) => (
                <div key={k} className="detail-row"><strong>{k}</strong><span>{v}</span></div>
              ))}
              <div className="detail-row"><strong>Status</strong><span className={`status-badge ${selectedLeave.status?.toLowerCase()}`}>{selectedLeave.status}</span></div>
              <div className="detail-row full"><strong>Reason</strong><p>{selectedLeave.reason}</p></div>
            </div>
            <div className="modal-actions">
              {selectedLeave.status === 'Pending' && (
                <>
                  <button className="modal-approve-btn" onClick={() => handleApprove(selectedLeave._id)}>Approve</button>
                  <button className="modal-reject-btn"  onClick={() => handleReject(selectedLeave._id)}>Reject</button>
                </>
              )}
              <button className="modal-close-btn" onClick={() => setSelectedLeave(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
