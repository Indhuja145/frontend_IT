import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PendingRequests.css';

function UserRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showForm, setShowForm] = useState(false);
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({ requestType: '', description: '', priority: 'Medium', attachments: '' });
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => { fetchUserData(); fetchRequests(); }, []);

  const fetchUserData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/user-profile/${userEmail}`);
      setUserName(res.data.name);
    } catch (err) { console.error(err); }
  };

  const fetchRequests = () => {
    if (!userEmail) return;
    setLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL}/api/requests`)
      .then(res => { setRequests(res.data.filter(r => r.employeeEmail === userEmail)); })
      .catch(() => showNotification('Failed to load requests', 'error'))
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const count = await axios.get(`${import.meta.env.VITE_API_URL}/api/requests`);
      const requestId = `REQ${String(count.data.length + 1).padStart(4, '0')}`;
      await axios.post(`${import.meta.env.VITE_API_URL}/api/requests`, { requestId, employeeName: userName, employeeEmail: userEmail, ...formData });
      showNotification('Request submitted successfully');
      setFormData({ requestType: '', description: '', priority: 'Medium', attachments: '' });
      setShowForm(false);
      fetchRequests();
    } catch { showNotification('Failed to submit request', 'error'); }
    finally { setLoading(false); }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this request?')) return;
    axios.delete(`${import.meta.env.VITE_API_URL}/api/requests/${id}`)
      .then(() => { fetchRequests(); showNotification('Request deleted'); })
      .catch(() => showNotification('Failed to delete request', 'error'));
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  return (
    <div className="requests-container">
      {notification.show && (
        <div className={`notification ${notification.type}`}>{notification.message}</div>
      )}

      <div className="requests-header">
        <div>
          <h1>My Requests</h1>
          <p>View and manage your submitted requests</p>
        </div>
        <button className="add-request-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Request'}
        </button>
      </div>

      {showForm && (
        <div className="request-form-container">
          <h2>Submit New Request</h2>
          <form onSubmit={handleSubmit} className="request-form">
            <select value={formData.requestType} onChange={(e) => setFormData({ ...formData, requestType: e.target.value })} required>
              <option value="">Select Request Type</option>
              <option value="Leave">Leave</option>
              <option value="Access">Access</option>
              <option value="Equipment">Equipment</option>
              <option value="Document">Document</option>
              <option value="Meeting">Meeting</option>
              <option value="Other">Other</option>
            </select>
            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} required>
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
            <textarea
              placeholder="Request Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required rows="4"
              className="form-full"
            />
            <input
              type="text"
              placeholder="Attachments (optional)"
              value={formData.attachments}
              onChange={(e) => setFormData({ ...formData, attachments: e.target.value })}
              className="form-full"
            />
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <div className="loading">Loading requests...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Type</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan="7" className="no-data">No requests found</td></tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id}>
                    <td>{req.requestId}</td>
                    <td>{req.requestType}</td>
                    <td>{req.description?.substring(0, 50)}{req.description?.length > 50 ? '...' : ''}</td>
                    <td><span className={`priority-badge ${req.priority?.toLowerCase()}`}>{req.priority}</span></td>
                    <td><span className={`status-badge ${req.status?.toLowerCase()}`}>{req.status}</span></td>
                    <td>{new Date(req.dateSubmitted).toLocaleDateString()}</td>
                    <td>
                      {req.status === 'Pending' && (
                        <button className="delete-btn" onClick={() => handleDelete(req._id)}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default UserRequests;
