import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeaders } from "./Auth";
import "./Document.css";

const apiUrl = `${import.meta.env.VITE_API_URL}/api`;

function Document() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Policy",
    uploadedBy: ""
  });
  const [file, setFile] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const fetchDocuments = () => {
    setLoading(true);
    axios
      .get(`${apiUrl}/documents`, { headers: getAuthHeaders() })
      .then((res) => {
        setDocuments(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching documents:', err);
        showNotification("Failed to load documents", "error");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      showNotification("Please select a file to upload", "error");
      return;
    }
    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("uploadedBy", formData.uploadedBy);
    data.append("file", file);

    const authHeaders = getAuthHeaders();
    delete authHeaders['Content-Type']; // Let browser set Content-Type for FormData

    axios
      .post(`${apiUrl}/add-document`, data, { headers: authHeaders })
      .then(() => {
        fetchDocuments();
        showNotification("Document uploaded successfully");
        setFormData({
          title: "",
          description: "",
          category: "Policy",
          uploadedBy: ""
        });
        setFile(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error uploading document:', err);
        showNotification("Failed to upload document", "error");
        setLoading(false);
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    setLoading(true);
    axios
      .delete(`${apiUrl}/delete-document/${id}`, { headers: getAuthHeaders() })
      .then(() => {
        fetchDocuments();
        showNotification("Document deleted successfully");
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error deleting document:', err);
        showNotification("Failed to delete document", "error");
        setLoading(false);
      });
  };

  return (
    <div className="document-container">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>Document Management</h1>
          <p>Upload and manage organizational documents</p>
        </div>
      </div>

      <div className="table-wrapper">
        {loading && <div className="loading-spinner">Loading...</div>}
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Uploaded By</th>
              <th>Date</th>
              <th>Download</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No documents uploaded</td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc._id}>
                  <td>{doc.title}</td>
                  <td>{doc.category}</td>
                  <td>{doc.uploadedBy}</td>
                  <td>{new Date(doc.uploadDate).toLocaleDateString()}</td>
                  <td>
                    <a
                      href={`${import.meta.env.VITE_API_URL}/uploads/${doc.fileName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-btn"
                    >
                      Download
                    </a>
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(doc._id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="form-section">
        <h2>Upload Document</h2>

        <form onSubmit={handleSubmit} className="document-form">

          <input
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <input
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="Policy">Policy</option>
            <option value="Report">Report</option>
            <option value="Invoice">Invoice</option>
            <option value="Meeting">Meeting</option>
            <option value="Other">Other</option>
          </select>

          <input
            name="uploadedBy"
            placeholder="Uploaded By"
            value={formData.uploadedBy}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <input
            type="file"
            onChange={handleFileChange}
            required
            disabled={loading}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
          />

          <div className="button-center">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}

export default Document;

