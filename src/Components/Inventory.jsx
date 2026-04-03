import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { getAuthHeaders } from "./Auth";
import "./Inventory.css";

const apiUrl = `${import.meta.env.VITE_API_URL}/api`;

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [addedBy, setAddedBy] = useState("");
  const [assignedTo, setAssignedTo] = useState("Unassigned");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    fetchItems();
    fetchUsers();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/users`);
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${apiUrl}/get-inventory`, { headers: getAuthHeaders() });
      setItems(res.data);
    } catch (err) {
      setError("Failed to load inventory items");
      showNotification("Failed to load inventory", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        await axios.put(`${apiUrl}/update-inventory/${editingId}`, {
          itemName,
          category,
          quantity,
          addedBy,
          assignedTo
        }, { headers: getAuthHeaders() });
        showNotification("Item updated successfully");
        setEditingId(null);
      } else {
        await axios.post(`${apiUrl}/add-inventory`, {
          itemName,
          category,
          quantity,
          addedBy,
          assignedTo
        }, { headers: getAuthHeaders() });
        showNotification("Item added successfully");
      }
      setItemName("");
      setCategory("");
      setQuantity("");
      setAddedBy("");
      setAssignedTo("Unassigned");
      fetchItems();
    } catch (err) {
      showNotification("Operation failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setItemName(item.itemName);
    setCategory(item.category);
    setQuantity(item.quantity);
    setAddedBy(item.addedBy);
    setAssignedTo(item.assignedTo || "Unassigned");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setItemName("");
    setCategory("");
    setQuantity("");
    setAddedBy("");
    setAssignedTo("Unassigned");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      setLoading(true);
      await axios.delete(`${apiUrl}/delete-inventory/${id}`, { headers: getAuthHeaders() });
      showNotification("Item deleted successfully");
      fetchItems();
    } catch (err) {
      showNotification("Failed to delete item", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.itemName?.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase()) ||
    item.addedBy?.toLowerCase().includes(search.toLowerCase()) ||
    item.assignedTo?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (quantity) => {
    if (quantity <= 0) return <span className="status-badge out-of-stock">Out of Stock</span>;
    if (quantity < 10) return <span className="status-badge low-stock">Low Stock</span>;
    return <span className="status-badge in-stock">In Stock</span>;
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
        <h1 className="inventory-title">📦 Inventory Management</h1>
        <input
          type="text"
          placeholder="🔍 Search items..."
          className="search-bar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      {error && <motion.div 
        className="error-message"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >{error}</motion.div>}

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
              <th>Item</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Added By</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">No items found</td>
                </tr>
              ) : (
                filteredItems.map((item, index) => (
                  <motion.tr 
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: "#f9f9f9", scale: 1.01 }}
                  >
                    <td className="item-name">{item.itemName}</td>
                    <td>{item.category}</td>
                    <td className="quantity">{item.quantity}</td>
                    <td>{getStatusBadge(item.quantity)}</td>
                    <td>{item.addedBy}</td>
                    <td>{item.assignedTo || 'Unassigned'}</td>
                    <td>
                      <div className="action-buttons">
                        <motion.button 
                          className="edit-btn"
                          onClick={() => handleEdit(item)}
                          disabled={loading}
                          title="Edit"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          ✏️
                        </motion.button>
                        <motion.button 
                          className="delete-btn"
                          onClick={() => handleDelete(item._id)}
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
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>

      <motion.div 
        className="form-section"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2>{editingId ? "✏️ Edit Item" : "➕ Add New Item"}</h2>
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
            min="0"
            required
            disabled={loading}
            whileFocus={{ scale: 1.02 }}
          />

          <motion.input
            type="text"
            placeholder="Added By *"
            value={addedBy}
            onChange={(e) => setAddedBy(e.target.value)}
            required
            disabled={loading}
            whileFocus={{ scale: 1.02 }}
          />

          <motion.select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            required
            disabled={loading}
            whileFocus={{ scale: 1.02 }}
          >
            <option value="Unassigned">Unassigned</option>
            {users.map(user => (
              <option key={user._id} value={user.email}>{user.name} ({user.email})</option>
            ))}
          </motion.select>

          <div className="form-buttons">
            <motion.button 
              type="submit" 
              className="submit-btn" 
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? "Processing..." : editingId ? "Update Item" : "Add Item"}
            </motion.button>
            {editingId && (
              <motion.button 
                type="button" 
                className="cancel-btn" 
                onClick={handleCancelEdit}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                Cancel
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
