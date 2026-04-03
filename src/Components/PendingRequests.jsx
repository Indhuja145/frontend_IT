import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PendingRequests.css';

const API = 'http://localhost:5000/api';

export default function PendingRequests() {
  const [requests, setRequests]         = useState([]);
  const [search, setSearch]             = useState('');
  const [typeFilter, setTypeFilter]     = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading]           = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [notification, setNotification]       = useState(null);

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try { const res = await axios.get(`${API}/requests`); setRequests(res.data); }
    catch { showNotif('Failed to load requests', 'error'); setRequests([]); }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (id) => {
    try { await axios.put(`${API}/requests/${id}`, { status: 'Approved' }); showNotif('Request approved'); setSelectedRequest(null); fetchRequests(); }
    catch { showNotif('Failed', 'error'); }
  };
  const handleReject = async (id) => {
    try { await axios.put(`${API}/requests/${id}`, { status: 'Rejected' }); showNotif('Request rejected'); setSelectedRequest(null); fetchRequests(); }
    catch { showNotif('Failed', 'error'); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    try { await axios.delete(`${API}/requests/${id}`); showNotif('Deleted'); setSelectedRequest(null); fetchRequests(); }
    catch { showNotif('Failed', 'error'); }
  };

  const filtered = requests.filter(r => {
    const matchSearch = !search || r.employeeName?.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === 'All'   || r.requestType === typeFilter;
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const pendingCount = requests.filter(r => r.status === 'Pending' || r.status === 'pending').length;

  return (
    <div className="requests-container">
      {notification && <div className={`notification ${notification.type}`}>{notification.msg}</div>}

      <div className="requests-header">
        <div>
          <h1>Pending Requests</h1>
          <p>Manage employee requests awaiting approval</p>
        </div>
        {pendingCount > 0 && <span className="pending-badge">{pendingCount} Pending</span>}
      </div>

      <div className="filters-section">
        <input type="text" placeholder="Search by employee name..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="filter-select">
          <option value="All">All Types</option>
          <option>Leave</option><option>Access</option><option>Equipment</option><option>Document</option><option>Meeting</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="filter-select">
          <option value="All">All Status</option>
          <option>Pending</option><option>Approved</option><option>Rejected</option>
        </select>
      </div>

      <div className="table-container">
        {loading ? <div className="loading">Loading...</div> : (
          <table className="requests-table">
            <thead>
              <tr><th>ID</th><th>Employee</th><th>Type</th><th>Description</th><th>Date</th><th>Priority</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" className="no-data">No requests found</td></tr>
              ) : filtered.map(r => (
                <tr key={r._id}>
                  <td className="request-id">{r.requestId || r._id?.slice(-6)}</td>
                  <td>{r.employeeName}</td>
                  <td>{r.requestType}</td>
                  <td className="description">{r.description?.substring(0, 40)}{r.description?.length > 40 ? '...' : ''}</td>
                  <td>{r.dateSubmitted ? new Date(r.dateSubmitted).toLocaleDateString() : '—'}</td>
                  <td><span className={`priority-badge ${r.priority?.toLowerCase() || 'low'}`}>{r.priority || 'Low'}</span></td>
                  <td><span className={`status-badge ${r.status?.toLowerCase()}`}>{r.status}</span></td>
                  <td>
                    <div className="action-btns">
                      {(r.status === 'Pending' || r.status === 'pending') && (
                        <>
                          <button className="approve-btn" onClick={() => handleApprove(r._id)}>Approve</button>
                          <button className="reject-btn"  onClick={() => handleReject(r._id)}>Reject</button>
                        </>
                      )}
                      <button className="view-btn"   onClick={() => setSelectedRequest(r)}>View</button>
                      <button className="delete-btn" onClick={() => handleDelete(r._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Request Details</h2>
            <div className="modal-body">
              {[['Request ID', selectedRequest.requestId || selectedRequest._id?.slice(-6)],
                ['Employee', selectedRequest.employeeName], ['Type', selectedRequest.requestType],
                ['Priority', selectedRequest.priority], ['Date', selectedRequest.dateSubmitted ? new Date(selectedRequest.dateSubmitted).toLocaleString() : '—']
              ].map(([k, v]) => (
                <div key={k} className="detail-row"><strong>{k}</strong><span>{v}</span></div>
              ))}
              <div className="detail-row"><strong>Status</strong><span className={`status-badge ${selectedRequest.status?.toLowerCase()}`}>{selectedRequest.status}</span></div>
              <div className="detail-row full"><strong>Description</strong><p>{selectedRequest.description}</p></div>
            </div>
            <div className="modal-actions">
              {(selectedRequest.status === 'Pending' || selectedRequest.status === 'pending') && (
                <>
                  <button className="modal-approve-btn" onClick={() => handleApprove(selectedRequest._id)}>Approve</button>
                  <button className="modal-reject-btn"  onClick={() => handleReject(selectedRequest._id)}>Reject</button>
                </>
              )}
              <button className="modal-reject-btn" onClick={() => handleDelete(selectedRequest._id)}>Delete</button>
              <button className="modal-close-btn"  onClick={() => setSelectedRequest(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
