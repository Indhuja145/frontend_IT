import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAuthHeaders } from './Auth';
import './User.css';

const API = 'http://localhost:5000/api';

const EMPTY_FORM = { rollNo: '', name: '', email: '', role: '', jobType: '', experience: '', system: '', dateOfJoining: '' };

export default function User() {
  const [users, setUsers]       = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [notification, setNotification] = useState(null);
  const [editingId, setEditingId]       = useState(null);
  const [formData, setFormData]         = useState(EMPTY_FORM);

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try { const res = await axios.get(`${API}/users`, { headers: getAuthHeaders() }); setUsers(res.data); }
    catch { showNotif('Failed to load users', 'error'); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.rollNo?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editingId) await axios.put(`${API}/update-user/${editingId}`, formData, { headers: getAuthHeaders() });
      else           await axios.post(`${API}/add-user`, formData, { headers: getAuthHeaders() });
      showNotif(editingId ? 'User updated' : 'User added');
      setFormData(EMPTY_FORM); setEditingId(null); fetchUsers();
    } catch (err) {
      showNotif(err.response?.data?.message || 'Operation failed', 'error');
    }
    setLoading(false);
  };

  const handleEdit = (u) => {
    setEditingId(u._id);
    setFormData({ rollNo: u.rollNo, name: u.name, email: u.email, role: u.role, jobType: u.jobType, experience: u.experience, system: u.system, dateOfJoining: u.dateOfJoining ? u.dateOfJoining.split('T')[0] : '' });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    setLoading(true);
    try { await axios.delete(`${API}/delete-user/${id}`, { headers: getAuthHeaders() }); showNotif('User deleted'); fetchUsers(); }
    catch (err) { showNotif(err.response?.data?.message || 'Failed to delete', 'error'); }
    setLoading(false);
  };

  return (
    <div className="user-container">
      {notification && <div className={`notification ${notification.type}`}>{notification.msg}</div>}

      <div className="top-section">
        <h1>User Management</h1>
        <input type="text" placeholder="Search by name, email or roll no..." className="search-bar" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-wrapper">
        {loading && <div className="loading-spinner">Loading...</div>}
        <table>
          <thead>
            <tr><th>Roll No</th><th>Name</th><th>Email</th><th>Role</th><th>Job Type</th><th>Experience</th><th>System</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="9" className="no-data">No users found</td></tr>
            ) : filtered.map(u => (
              <tr key={u._id}>
                <td className="roll-no">{u.rollNo}</td>
                <td className="user-name">{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                <td>{u.jobType}</td>
                <td>{u.experience}</td>
                <td>{u.system}</td>
                <td>{u.dateOfJoining ? new Date(u.dateOfJoining).toLocaleDateString() : '—'}</td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn"   onClick={() => handleEdit(u)}   disabled={loading}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(u._id)} disabled={loading}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="form-section">
        <h2>{editingId ? 'Edit User' : 'Add New User'}</h2>
        <form onSubmit={handleSubmit} className="user-form">
          <input name="rollNo"      placeholder="Roll Number"    value={formData.rollNo}      onChange={e => setFormData({...formData, rollNo: e.target.value})}      disabled={loading} />
          <input name="name"        placeholder="Full Name *"    value={formData.name}        onChange={e => setFormData({...formData, name: e.target.value})}        required disabled={loading} />
          <input name="email" type="email" placeholder="Email *" value={formData.email}       onChange={e => setFormData({...formData, email: e.target.value})}       required disabled={loading} />
          <select name="role" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required disabled={loading}>
            <option value="">Select Role *</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="manager">Manager</option>
          </select>
          <input name="jobType"     placeholder="Job Type"       value={formData.jobType}     onChange={e => setFormData({...formData, jobType: e.target.value})}     disabled={loading} />
          <input name="experience"  placeholder="Experience"     value={formData.experience}  onChange={e => setFormData({...formData, experience: e.target.value})}  disabled={loading} />
          <input name="system"      placeholder="System"         value={formData.system}      onChange={e => setFormData({...formData, system: e.target.value})}      disabled={loading} />
          <input type="date" name="dateOfJoining"                value={formData.dateOfJoining} onChange={e => setFormData({...formData, dateOfJoining: e.target.value})} disabled={loading} />
          <div className="button-center">
            <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Processing...' : editingId ? 'Update User' : 'Add User'}</button>
            {editingId && <button type="button" className="cancel-btn" onClick={() => { setEditingId(null); setFormData(EMPTY_FORM); }} disabled={loading}>Cancel</button>}
          </div>
        </form>
      </div>
    </div>
  );
}
