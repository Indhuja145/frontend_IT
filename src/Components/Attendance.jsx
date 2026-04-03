import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Attendance.css';

const API = `${import.meta.env.VITE_API_URL}/api`;

export default function Attendance() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const email = localStorage.getItem('userEmail');

  useEffect(() => {
    if (!email) { navigate('/'); return; }
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${API}/attendance`);
      setAttendanceData(res.data.filter(a => a.employeeEmail === email));
    } catch { setAttendanceData([]); }
    setLoading(false);
  };

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleClockIn  = () => showNotif(`Clocked in at ${new Date().toLocaleTimeString()}`);
  const handleClockOut = () => showNotif(`Clocked out at ${new Date().toLocaleTimeString()}`);

  const stats = {
    total:   attendanceData.length,
    present: attendanceData.filter(a => a.status?.toLowerCase() === 'present').length,
    absent:  attendanceData.filter(a => a.status?.toLowerCase() === 'absent').length,
    leave:   attendanceData.filter(a => a.status?.toLowerCase() === 'leave').length,
  };

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getDateStatus = (day) => {
    const d = new Date(year, month, day);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) return 'weekend';
    const iso = d.toISOString().split('T')[0];
    const rec = attendanceData.find(a => a.date?.startsWith(iso));
    return rec ? rec.status?.toLowerCase() : '';
  };

  return (
    <div className="attendance-page">
      {notification && <div className={`notification ${notification.type}`}>{notification.msg}</div>}

      <div className="page-header">
        <div>
          <h1>Attendance</h1>
          <p>Track your daily attendance and records</p>
        </div>
        <div className="header-actions">
          <button className="clock-btn calendar-btn" onClick={() => setShowCalendar(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            Calendar
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Records', value: stats.total,   sub: 'all time',          cls: 'blue'   },
          { label: 'Days Present',  value: stats.present, sub: `${stats.total ? Math.round(stats.present/stats.total*100) : 0}% attendance`, cls: 'green'  },
          { label: 'Days Absent',   value: stats.absent,  sub: 'unauthorized',       cls: 'red'    },
          { label: 'Leave Days',    value: stats.leave,   sub: 'approved leaves',    cls: 'orange' },
        ].map(s => (
          <div key={s.label} className={`att-stat-card ${s.cls}`}>
            <h3>{s.label}</h3>
            <p className="att-stat-number">{s.value}</p>
            <span className="att-stat-sub">{s.sub}</span>
          </div>
        ))}
      </div>

      {showCalendar && (
        <div className="modal-overlay" onClick={() => setShowCalendar(false)}>
          <div className="modal-content att-cal-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Attendance Calendar</h2>
              <button className="modal-close-btn" onClick={() => setShowCalendar(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="month-navigation">
              <button onClick={() => setCurrentMonth(new Date(year, month - 1))}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <span>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              <button onClick={() => setCurrentMonth(new Date(year, month + 1))}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
            <div className="calendar-grid">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="calendar-day-header">{d}</div>
              ))}
              {[...Array(firstDay)].map((_, i) => <div key={`e${i}`} className="calendar-day empty"/>)}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const status = getDateStatus(day);
                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                return (
                  <div key={day} className={`calendar-day ${status} ${isToday ? 'today' : ''}`}>
                    <span className="day-number">{day}</span>
                    <span className="day-status">
                      {status === 'present' ? '✓' : status === 'absent' ? '✗' : status === 'leave' ? 'L' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="att-calendar-legend">
              <span><span className="legend-dot present"/>Present</span>
              <span><span className="legend-dot absent"/>Absent</span>
              <span><span className="legend-dot leave"/>Leave</span>
              <span><span className="legend-dot weekend"/>Weekend</span>
            </div>
          </div>
        </div>
      )}

      <div className="att-table-card">
        <h2>Attendance Records</h2>
        {loading ? <div className="loading">Loading records...</div> : (
          <table className="attendance-table">
            <thead>
              <tr><th>Date</th><th>Check-in</th><th>Check-out</th><th>Hours</th><th>Status</th></tr>
            </thead>
            <tbody>
              {attendanceData.length === 0 ? (
                <tr><td colSpan="5" className="no-data">No attendance records found</td></tr>
              ) : attendanceData.map((r, i) => (
                <tr key={i}>
                  <td>{r.date ? new Date(r.date).toLocaleDateString() : 'N/A'}</td>
                  <td>{r.checkIn || '—'}</td>
                  <td>{r.checkOut || '—'}</td>
                  <td>{r.hours || '—'}</td>
                  <td><span className={`status-badge ${r.status?.toLowerCase()}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
