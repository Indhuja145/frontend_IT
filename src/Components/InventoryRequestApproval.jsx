import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "./Inventory.css";

const apiUrl = "http://localhost:5000/api";

export default function InventoryRequestApproval() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [filter, setFilter] = useState("All");
  const adminEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    fetchRequests();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/inventory-requests`);
      setRequests(res.data);
    } catch (err) {
      showNotification("Failed to load requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setLoading(true);
      await axios.put(`${apiUrl}/inventory-requests/${id}`, {
        status: 'Approved',
        reviewedBy: adminEmail,
        reviewedAt: new Date()
      });
      showNotification("Request approved successfully");
      fetchRequests();
    } catch (err) {
      showNotification("Failed to approve request", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this request?")) return;
    try {
      setLoading(true);
      await axios.put(`${apiUrl}/inventory-requests/${id}`, {
        status: 'Rejected',
        reviewedBy: adminEmail,
        reviewedAt: new Date()
      });
      showNotification("Request rejected");
      fetchRequests();
    } catch (err) {
      showNotification("Failed to reject request", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      setLoading(true);
      await axios.delete(`${apiUrl}/inventory-requests/${id}`);
      showNotification("Request deleted successfully");
      fetchRequests();
    } catch (err) {
      showNotification("Failed to delete request", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => 
    filter === "All" || req.status === filter
  );

  const getStatusBadge = (status) => {
    if (status === 'Approved') return <span className="status-badge in-stock">✓ Approved</span>;
    if (status === 'Rejected') return <span className="status-badge out-of-stock">✗ Rejected</span>;
    return <span className="status-badge low-stock">⏳ Pending</span>;
  };

  return (
    <motion.div 
      className="inventory-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {notification.show && (
          <motion.div 
            className={`notification ${notification.type}`}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="header-section"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="inventory-title">📦 Inventory Request Approvals</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '8px 16px',
                background: filter === status ? '#8b5cf6' : 'rgba(139, 92, 246, 0.2)',
                color: 'white',
                border: '1px solid #8b5cf6',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div 
        className="table-wrapper"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {loading && <div className="loading-spinner">Loading...</div>}
        <table>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Requested By</th>
              <th>Item</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">No requests found</td>
              </tr>
            ) : (
              filteredRequests.map((request, index) => (
                <motion.tr 
                  key={request._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td>{request.requestId}</td>
                  <td>{request.requestedBy}</td>
                  <td className="item-name">{request.itemName}</td>
                  <td>{request.category}</td>
                  <td className="quantity">{request.quantity}</td>
                  <td>{request.reason}</td>
                  <td>{getStatusBadge(request.status)}</td>
                  <td>{new Date(request.dateSubmitted).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      {request.status === 'Pending' && (
                        <>
                          <motion.button 
                            className="edit-btn"
                            onClick={() => handleApprove(request._id)}
                            disabled={loading}
                            title="Approve"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            ✓
                          </motion.button>
                          <motion.button 
                            className="delete-btn"
                            onClick={() => handleReject(request._id)}
                            disabled={loading}
                            title="Reject"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            ✗
                          </motion.button>
                        </>
                      )}
                      <motion.button 
                        className="delete-btn"
                        onClick={() => handleDelete(request._id)}
                        disabled={loading}
                        title="Delete"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        🗑️
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}
