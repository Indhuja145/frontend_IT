import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Query.css';

function Query() {
  const [queries, setQueries] = useState([]);
  const [newQuery, setNewQuery] = useState({ title: '', description: '' });
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const userName = localStorage.getItem('userName') || 'User';

  useEffect(() => { fetchQueries(); }, []);

  const fetchQueries = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/queries`);
      setQueries(res.data);
    } catch (err) {
      console.error('Failed to fetch queries', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostQuery = async (e) => {
    e.preventDefault();
    if (!newQuery.title || !newQuery.description) return showNotification('Please fill all fields', 'error');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/add-query`, {
        ...newQuery,
        postedBy: userName,
        postedByEmail: localStorage.getItem('userEmail') || 'user@example.com',
        postedAt: new Date()
      });
      showNotification('Query posted successfully', 'success');
      setNewQuery({ title: '', description: '' });
      fetchQueries();
    } catch {
      showNotification('Failed to post query', 'error');
    }
  };

  const handlePostAnswer = async () => {
    if (!answer.trim()) return showNotification('Please enter an answer', 'error');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/answer-query/${selectedQuery._id}`, {
        answer,
        answeredBy: userName,
        answeredByEmail: localStorage.getItem('userEmail') || 'user@example.com',
        answeredAt: new Date()
      });
      showNotification('Answer posted successfully', 'success');
      setAnswer('');
      setSelectedQuery(null);
      fetchQueries();
    } catch {
      showNotification('Failed to post answer', 'error');
    }
  };

  const handleDeleteQuery = async (id) => {
    if (!window.confirm('Delete this query?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/delete-query/${id}`);
      showNotification('Query deleted', 'success');
      setSelectedQuery(null);
      fetchQueries();
    } catch {
      showNotification('Failed to delete query', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  return (
    <div className="query-container">
      {notification.show && (
        <div className={`notification ${notification.type}`}>{notification.message}</div>
      )}

      <div className="page-header">
        <div>
          <h1>Raise Query</h1>
          <p>Post your questions and get answers from the team</p>
        </div>
      </div>

      <div className="post-query-section">
        <h2>Post New Query</h2>
        <form onSubmit={handlePostQuery} className="query-form">
          <input
            type="text"
            placeholder="Query title"
            value={newQuery.title}
            onChange={(e) => setNewQuery({ ...newQuery, title: e.target.value })}
          />
          <textarea
            placeholder="Describe your query in detail..."
            value={newQuery.description}
            onChange={(e) => setNewQuery({ ...newQuery, description: e.target.value })}
            rows="4"
          />
          <button type="submit" className="post-btn">Post Query</button>
        </form>
      </div>

      <div className="queries-section">
        <h2>All Queries</h2>
        {loading ? (
          <p className="no-data">Loading...</p>
        ) : queries.length === 0 ? (
          <p className="no-data">No queries posted yet</p>
        ) : (
          <div className="query-list">
            {queries.map((query) => (
              <div key={query._id} className="query-card">
                <div className="query-card-top">
                  <span className="query-title">{query.title}</span>
                  <span className="query-poster">{query.postedBy}</span>
                </div>
                <p className="query-desc">{query.description}</p>
                <div className="query-card-footer">
                  <span className="query-date">{new Date(query.postedAt).toLocaleDateString()}</span>
                  <span className="answer-count">{query.answers?.length || 0} answers</span>
                  <div className="query-card-actions">
                    <button className="view-btn" onClick={() => setSelectedQuery(query)}>View &amp; Answer</button>
                    <button className="delete-btn" onClick={() => handleDeleteQuery(query._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedQuery && (
        <div className="modal-overlay" onClick={() => setSelectedQuery(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="query-modal-header">
              <h2>{selectedQuery.title}</h2>
              <button className="modal-close-btn" onClick={() => setSelectedQuery(null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="detail-row">
              <strong>Posted by</strong>
              <span>{selectedQuery.postedBy}</span>
            </div>
            <div className="detail-row">
              <strong>Date</strong>
              <span>{new Date(selectedQuery.postedAt).toLocaleString()}</span>
            </div>
            <p className="query-modal-desc">{selectedQuery.description}</p>

            <div className="answers-section">
              <h3>Answers ({selectedQuery.answers?.length || 0})</h3>
              {selectedQuery.answers?.length > 0 ? (
                selectedQuery.answers.map((ans, i) => (
                  <div key={i} className="answer-card">
                    <p>{ans.answer}</p>
                    <div className="answer-meta">
                      <span>{ans.answeredBy}</span>
                      <span>{new Date(ans.answeredAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No answers yet. Be the first to answer!</p>
              )}
            </div>

            <div className="post-answer-section">
              <h3>Post Your Answer</h3>
              <textarea
                placeholder="Write your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows="4"
                className="answer-textarea"
              />
              <div className="modal-actions">
                <button className="submit-answer-btn" onClick={handlePostAnswer}>Submit Answer</button>
                <button className="modal-close-btn" onClick={() => setSelectedQuery(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Query;
