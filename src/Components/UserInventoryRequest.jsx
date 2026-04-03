import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "./Inventory.css";

const apiUrl = `${import.meta.env.VITE_API_URL}/api`;

export default function UserInventoryRequest() {
  const [requests, setRequests] = useState([]);
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');

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
      const res = await axios.get(`${apiUrl}/inventory-requests/${userEmail}`);
      setRequests(res.data);
    } catch (err) {
      showNotification("Failed to load requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(`${apiUrl}/inventory-requests`, {
        itemName,
        category,
        quantity,
        reason,
        requestedBy: userName,
        requestedByEmail: userEmail
      });
      showNotification("Request submitted successfully");
      setItemName("");
      setCategory("");
      setQuantity("");
      setReason("");
      fetchRequests();
    } catch (err) {
      showNotification("Failed to submit request", "error");
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="inventory-title">📦 My Inventory Requests</h1>
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
              <th>Item</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">No requests found</td>
              </tr>
            ) : (
              requests.map((request, index) => (
                <motion.tr 
                  key={request._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td>{request.requestId}</td>
                  <td className="item-name">{request.itemName}</td>
                  <td>{request.category}</td>
                  <td className="quantity">{request.quantity}</td>
                  <td>{request.reason}</td>
                  <td>{getStatusBadge(request.status)}</td>
                  <td>{new Date(request.dateSubmitted).toLocaleDateString()}</td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>

      <motion.div 
        className="form-section"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2>➕ Request New Item</h2>
        <form onSubmit={handleSubmit} className="inventory-form">
          <motion.input
            type="text"
            placeholder="Item Name *"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
            disabled={loading}
            whileFocus={{ scale: 1.02 }}
          />

          <motion.select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            disabled={loading}
            whileFocus={{ scale: 1.02 }}
          >
            <option value="">Select Category *</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Accessories">Accessories</option>
            <option value="Furniture">Furniture</option>
            <option value="Other">Other</option>
          </motion.select>

          <motion.input
            type="number"
            placeholder="Quantity *"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            required
            disabled={loading}
            whileFocus={{ scale: 1.02 }}
          />

          <motion.textarea
            placeholder="Reason for request *"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            disabled={loading}
            whileFocus={{ scale: 1.02 }}
            style={{ gridColumn: 'span 2', minHeight: '100px' }}
          />

          <div className="form-buttons" style={{ gridColumn: 'span 2' }}>
            <motion.button 
              type="submit" 
              className="submit-btn" 
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
