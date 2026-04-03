import React from 'react';
import './Reports.css';

const achievements = [
  { number: '500+', label: 'Employees Managed' },
  { number: '1000+', label: 'Requests Processed' },
  { number: '10+', label: 'Departments' },
  { number: '9', label: 'Years of Service' },
];

function Reports() {
  return (
    <div className="rp-page">
      <div className="rp-hero">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
        </svg>
        <h1>IT-MIS</h1>
        <p>Information Management System</p>
      </div>

      <div className="rp-card">
        <h2>Company Overview</h2>
        <p>IT-MIS is designed to help organizations manage employees, attendance, meetings, documents, and inventory efficiently in one centralized platform. Our solution streamlines organizational workflows and enhances productivity through intelligent automation and real-time data management.</p>
      </div>

      <div className="rp-card">
        <h2>Company History</h2>
        <p>Established in 2015 with the aim of providing efficient digital management solutions for organizations. Over the years, we have grown from a small startup to a trusted partner for businesses seeking to modernize their management systems.</p>
      </div>

      <div className="rp-grid-2">
        <div className="rp-card">
          <h2>Mission</h2>
          <p>To simplify organizational management through secure and efficient digital systems — empowering businesses with tools that enhance productivity, improve communication, and streamline operations.</p>
        </div>
        <div className="rp-card">
          <h2>Vision</h2>
          <p>To become a leading provider of intelligent management systems for modern workplaces, revolutionizing how organizations operate through cutting-edge technology.</p>
        </div>
      </div>

      <div className="rp-card">
        <h2>Achievements &amp; Growth</h2>
        <div className="rp-achievements">
          {achievements.map((a, i) => (
            <div key={i} className="rp-achievement">
              <div className="rp-achievement-number">{a.number}</div>
              <div className="rp-achievement-label">{a.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rp-footer">
        <p>© 2025 IT-MIS System. All Rights Reserved.</p>
        <p>Developed for Academic Project</p>
      </div>
    </div>
  );
}

export default Reports;
